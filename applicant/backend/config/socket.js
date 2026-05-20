const socketIO = require('socket.io');
const { verifyToken } = require('./jwt');

let io;

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

  // Socket.IO authentication middleware using JWT
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      // Verify token
      const decoded = verifyToken(token);
      
      // Store user ID on socket object
      socket.userId = decoded.id; // user.userId
      next();
    } catch (err) {
      console.error('Socket authentication failed:', err.message);
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    const roomName = `user:${userId}`;
    
    // Join personal room
    socket.join(roomName);
    console.log(`🔌 User connected to Socket: ${userId}. Joined room: ${roomName}`);

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected from Socket: ${userId}`);
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
