const Notification = require('../models/Notification');
const redis = require('../config/redis');
const { addNotificationJob } = require('../config/queue');
const { getIO } = require('../config/socket');

/**
 * Send a notification by enqueuing a job in BullMQ
 * @param {Object} payload - Notification data
 * @param {String} payload.receiverId - ID of recipient user
 * @param {String} [payload.senderId] - ID of sender user (optional)
 * @param {String} payload.type - Notification type
 * @param {String} payload.title - Notification title
 * @param {String} payload.message - Notification message
 */
const sendNotification = async (payload) => {
  if (!payload.receiverId || !payload.type || !payload.title || !payload.message) {
    throw new Error('Missing required fields for sending notification');
  }

  // Publish notification job to BullMQ queue
  const job = await addNotificationJob({
    receiverId: payload.receiverId,
    senderId: payload.senderId || null,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    createdAt: new Date()
  });

  return job;
};

/**
 * Fetch notifications for a user (paginated, newest first)
 * Uses Redis cache first for page 1
 */
const getUserNotifications = async (userId, page = 1, limit = 10) => {
  const cacheKey = `notifications:${userId}`;
  
  // Cache-first strategy for page 1
  if (page === 1) {
    try {
      const cacheExists = await redis.exists(cacheKey);
      if (cacheExists) {
        // Fetch up to 20 cached notifications
        const cachedList = await redis.lrange(cacheKey, 0, 19);
        if (cachedList && cachedList.length > 0) {
          const notifications = cachedList.map(item => JSON.parse(item));
          // Paginate from the cached array (in case limit is less than 20)
          const paginatedNotifications = notifications.slice(0, limit);
          console.log(`⚡ Redis cache HIT for notifications:${userId} (page 1)`);
          return paginatedNotifications;
        }
      }
    } catch (err) {
      console.error('Redis notification cache read failed:', err);
    }
  }

  // Fallback to MongoDB
  console.log(`🌐 MongoDB read for notifications:${userId} (page: ${page})`);
  const skip = (page - 1) * limit;
  const notifications = await Notification.find({ receiverId: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // If page 1 had a cache miss, let's hydrate the cache with the latest 20 notifications
  if (page === 1 && notifications.length > 0) {
    try {
      // Fetch latest 20 notifications to ensure cache has full set
      const latest20 = await Notification.find({ receiverId: userId })
        .sort({ createdAt: -1 })
        .limit(20);

      if (latest20.length > 0) {
        const pipeline = redis.pipeline();
        pipeline.del(cacheKey);
        const jsonStrings = latest20.map(n => JSON.stringify(n));
        pipeline.rpush(cacheKey, ...jsonStrings);
        pipeline.expire(cacheKey, 86400); // Expire in 1 day
        await pipeline.exec();
        console.log(`⚡ Hydrated Redis cache for notifications:${userId} with ${latest20.length} items`);
      }
    } catch (err) {
      console.error('Failed to hydrate Redis notification cache:', err);
    }
  }

  return notifications;
};

/**
 * Get count of unread notifications for a user
 * Checks Redis first
 */
const getUnreadCount = async (userId) => {
  const unreadKey = `unread:${userId}`;

  try {
    const cachedCount = await redis.get(unreadKey);
    if (cachedCount !== null) {
      console.log(`⚡ Redis cache HIT for unread count: ${userId} (${cachedCount})`);
      return parseInt(cachedCount, 10);
    }
  } catch (err) {
    console.error('Redis unread count read failed:', err);
  }

  // Fallback to MongoDB
  console.log(`🌐 MongoDB read for unread count: ${userId}`);
  const count = await Notification.countDocuments({ receiverId: userId, isRead: false });

  try {
    // Cache the count in Redis
    await redis.set(unreadKey, count, 'EX', 86400); // 1 day TTL
  } catch (err) {
    console.error('Failed to write unread count cache:', err);
  }

  return count;
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  // 1. Update MongoDB
  await Notification.updateMany(
    { receiverId: userId, isRead: false },
    { $set: { isRead: true } }
  );

  // 2. Reset unread count key in Redis
  const unreadKey = `unread:${userId}`;
  await redis.set(unreadKey, 0, 'EX', 86400);

  // 3. Update Redis list cache to mark all elements as read (if cache exists)
  const cacheKey = `notifications:${userId}`;
  try {
    const cacheExists = await redis.exists(cacheKey);
    if (cacheExists) {
      const cachedList = await redis.lrange(cacheKey, 0, -1);
      if (cachedList && cachedList.length > 0) {
        const updatedList = cachedList.map(item => {
          const notification = JSON.parse(item);
          notification.isRead = true;
          return JSON.stringify(notification);
        });

        // Atomic update of list cache
        const pipeline = redis.pipeline();
        pipeline.del(cacheKey);
        pipeline.rpush(cacheKey, ...updatedList);
        pipeline.expire(cacheKey, 86400);
        await pipeline.exec();
        console.log(`⚡ Updated Redis notification list cache to mark all as read for user: ${userId}`);
      }
    }
  } catch (err) {
    console.error('Failed to sync notification list cache on markAllAsRead:', err);
  }

  // 4. Emit Socket.IO unread count update
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('unread_count_updated', { unreadCount: 0 });
    console.log(`📡 Emitted unread_count_updated (0) to room user:${userId}`);
  } catch (socketErr) {
    console.warn('⚠️ Socket.IO emit failed:', socketErr.message);
  }

  return { success: true };
};

module.exports = {
  sendNotification,
  getUserNotifications,
  getUnreadCount,
  markAllAsRead
};
