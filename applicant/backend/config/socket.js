const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { verifyToken: verifyApplicantToken } = require('./jwt');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { getApplicationAndRecruiter } = require('../controllers/chat.controller');
const redisPub = require('./redis');
const Redis = require('ioredis');

let io;
let subClient;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000'
      ],
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // Initialize Redis subscriber
  if (process.env.NODE_ENV !== 'test') {
    try {
      let redisUrl = process.env.REDIS_URL;
      if (redisUrl) {
        let isUpstash = redisUrl.includes('upstash.io');
        if (isUpstash && redisUrl.startsWith('redis://')) {
          redisUrl = redisUrl.replace('redis://', 'rediss://');
        }

        const redisOptions = {
          maxRetriesPerRequest: null,
          enableReadyCheck: true,
          connectTimeout: 10000,
          retryStrategy: (times) => Math.min(times * 200, 3000)
        };

        if (redisUrl.startsWith('rediss://')) {
          redisOptions.tls = {
            rejectUnauthorized: false
          };
        }

        subClient = new Redis(redisUrl, redisOptions);

        subClient.on('connect', () => {
          console.log('📡 Redis Subscriber TCP connection established');
        });

        subClient.on('ready', () => {
          console.log('📡 Redis Subscriber ready. Subscribing to chat:messages...');
          subClient.subscribe('chat:messages', (err, count) => {
            if (err) {
              console.error('❌ Redis subscriber failed to subscribe:', err.message);
            } else {
              console.log(`✅ Subscribed to Redis channel: chat:messages (count: ${count})`);
            }
          });
        });

        subClient.on('message', async (channel, messageStr) => {
          if (channel === 'chat:messages') {
            try {
              const message = JSON.parse(messageStr);
              const chat = await Chat.findById(message.chatId);
              if (chat) {
                const roomId = chat.applicationId.toString();
                console.log(`📢 Redis Sub broadcasting message to roomId: ${roomId} | message ID: ${message._id}`);
                io.to(roomId).emit('receive_message', message);
              } else {
                console.error(`❌ Redis Sub Chat not found with ID: ${message.chatId}`);
              }
            } catch (err) {
              console.error('Error handling Redis subscription message:', err.message);
            }
          }
        });

        subClient.on('error', (err) => {
          console.error('❌ Redis Subscriber error:', err.message);
        });
      }
    } catch (redisInitErr) {
      console.error('❌ Failed to initialize Redis subscriber:', redisInitErr.message);
    }
  }

  // Socket.IO authentication middleware supporting both applicant and recruiter
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      // Try verifying as applicant
      try {
        const decoded = verifyApplicantToken(token);
        socket.userId = decoded.id;
        socket.userRole = 'applicant';
        return next();
      } catch (err) {
        // Try verifying as recruiter
        try {
          const recruiterSecret = process.env.JWT_SECRET_RECRUITER || 'recruiter-jwt-secret';
          const decoded = jwt.verify(token, recruiterSecret);
          socket.userId = decoded._id;
          socket.userRole = 'recruiter';
          return next();
        } catch (recruiterErr) {
          console.error('Socket authentication failed:', recruiterErr.message);
          return next(new Error('Authentication error: Invalid or expired token'));
        }
      }
    } catch (err) {
      console.error('Socket authentication middleware error:', err.message);
      return next(new Error('Authentication error: Internal error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    const role = socket.userRole;
    console.log(`🔌 User connected to Socket: ${userId} (${role})`);

    // join_chat room event
    socket.on('join_chat', async ({ applicationId }, callback) => {
      try {
        if (!applicationId) {
          if (callback) callback({ success: false, error: 'applicationId is required' });
          return;
        }

        const appDetails = await getApplicationAndRecruiter(applicationId);
        if (!appDetails) {
          if (callback) callback({ success: false, error: 'Application or Opportunity not found' });
          return;
        }

        const { application, recruiterId } = appDetails;

        // Verify status
        if (!application.isSelected) {
          if (callback) callback({ success: false, error: 'Chat is only allowed when application status is selected' });
          return;
        }

        // Access check
        const userIdStr = userId.toString();
        if (application.userId !== userIdStr && recruiterId.toString() !== userIdStr) {
          if (callback) callback({ success: false, error: 'Access denied to this chat room' });
          return;
        }

        // Join room
        socket.join(applicationId);
        console.log(`🔌 User ${userId} joined room: ${applicationId}`);
        if (callback) callback({ success: true });
      } catch (err) {
        console.error('Error joining chat socket room:', err);
        if (callback) callback({ success: false, error: 'Failed to join chat room' });
      }
    });

    // send_message event
    socket.on('send_message', async ({ chatId, message }, callback) => {
      try {
        if (!chatId || !message || message.trim() === '') {
          if (callback) callback({ success: false, error: 'chatId and message are required' });
          return;
        }

        console.log(`💬 socket.on('send_message') received from: ${userId} (${role}) | chatId: ${chatId} | message: ${message}`);

        const chat = await Chat.findById(chatId);
        if (!chat) {
          console.error(`❌ Chat not found with ID: ${chatId}`);
          if (callback) callback({ success: false, error: 'Chat not found' });
          return;
        }

        // Access check
        const userIdStr = userId.toString();
        if (chat.applicantId !== userIdStr && chat.recruiterId.toString() !== userIdStr) {
          console.error(`❌ Access denied for user: ${userIdStr} to chatId: ${chatId}`);
          if (callback) callback({ success: false, error: 'Access denied' });
          return;
        }

        const senderRole = chat.applicantId === userIdStr ? 'applicant' : 'recruiter';

        // Save message to database
        const newMessage = new Message({
          chatId,
          senderId: userIdStr,
          senderRole,
          message: message.trim()
        });

        await newMessage.save();

        // Update chat
        chat.lastMessage = message.trim();
        chat.lastMessageAt = new Date();
        await chat.save();

        // Publish to Redis to broadcast to everyone connected
        const roomId = chat.applicationId.toString();
        try {
          if (redisPub && typeof redisPub.publish === 'function') {
            console.log(`📢 Publishing 'send_message' to Redis chat:messages for roomId: ${roomId}`);
            await redisPub.publish('chat:messages', JSON.stringify(newMessage));
          } else {
            throw new Error('Redis publisher client not available');
          }
        } catch (pubErr) {
          console.warn('⚠️ Redis publish failed. Falling back to local Socket.IO broadcast:', pubErr.message);
          io.to(roomId).emit('receive_message', newMessage);
        }

        if (callback) callback({ success: true, message: newMessage });
      } catch (err) {
        console.error('Error sending message via socket:', err);
        if (callback) callback({ success: false, error: 'Failed to send message' });
      }
    });

    // typing event
    socket.on('typing', ({ applicationId }) => {
      if (applicationId) {
        socket.to(applicationId).emit('typing', { senderId: userId, role });
      }
    });

    // stop_typing event
    socket.on('stop_typing', ({ applicationId }) => {
      if (applicationId) {
        socket.to(applicationId).emit('stop_typing', { senderId: userId, role });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 User disconnected from Socket: ${userId}. Reason: ${reason}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};
