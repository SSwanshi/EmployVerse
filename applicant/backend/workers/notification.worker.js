require('dotenv').config();
const { Worker } = require('bullmq');
const Redis = require('ioredis');
const Notification = require('../models/Notification');
const redisClient = require('../config/redis');
const { getIO } = require('../config/socket');

let workerConnection;

if (process.env.NODE_ENV === 'test') {
  workerConnection = {};
} else {
  let redisUrl = process.env.REDIS_URL;
  let isUpstash = redisUrl && redisUrl.includes('upstash.io');
  
  if (isUpstash && redisUrl.startsWith('redis://')) {
    redisUrl = redisUrl.replace('redis://', 'rediss://');
  }

  const redisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    connectTimeout: 10000
  };

  if (redisUrl && redisUrl.startsWith('rediss://')) {
    redisOptions.tls = {
      rejectUnauthorized: false
    };
  }

  workerConnection = new Redis(redisUrl, redisOptions);
  
  workerConnection.on('error', (err) => {
    console.error('❌ Redis Connection Error in BullMQ Worker:', err.message || err);
  });
}

const notificationWorker = new Worker('notifications', async (job) => {
  const { receiverId, senderId, type, title, message, createdAt } = job.data;
  
  console.log(`🤖 Processing notification job for user: ${receiverId}`);

  try {
    // 1. Save notification to MongoDB
    const notification = new Notification({
      receiverId,
      senderId,
      type,
      title,
      message,
      createdAt: createdAt || new Date()
    });
    const savedNotification = await notification.save();

    // 2. Update Redis notifications cache
    const cacheKey = `notifications:${receiverId}`;
    const cacheExists = await redisClient.exists(cacheKey);
    if (cacheExists) {
      await redisClient.lpush(cacheKey, JSON.stringify(savedNotification));
      await redisClient.ltrim(cacheKey, 0, 19);
    }

    // 3. Update Redis unread count cache
    const unreadKey = `unread:${receiverId}`;
    let unreadCount;
    const unreadExists = await redisClient.exists(unreadKey);
    if (unreadExists) {
      unreadCount = await redisClient.incr(unreadKey);
    } else {
      unreadCount = await Notification.countDocuments({ receiverId, isRead: false });
      await redisClient.set(unreadKey, unreadCount);
    }

    // 4. Emit Socket.IO events
    try {
      const io = getIO();
      const payload = {
        id: savedNotification._id,
        receiverId,
        senderId,
        type,
        title,
        message,
        isRead: false,
        createdAt: savedNotification.createdAt
      };
      
      io.to(`user:${receiverId}`).emit('new_notification', payload);
      io.to(`user:${receiverId}`).emit('unread_count_updated', { unreadCount });
      
      console.log(`📡 Emitted new_notification and unread_count_updated (${unreadCount}) to user:${receiverId}`);
    } catch (socketErr) {
      console.warn('⚠️ Socket.IO emit skipped/failed:', socketErr.message);
    }

    return savedNotification;
  } catch (error) {
    console.error('❌ Error processing notification job:', error);
    throw error;
  }
}, {
  connection: workerConnection
});

notificationWorker.on('completed', (job) => {
  console.log(`✅ Notification job ${job.id} completed successfully`);
});

notificationWorker.on('failed', (job, err) => {
  console.error(`❌ Notification job ${job?.id} failed:`, err.message);
});

module.exports = notificationWorker;
