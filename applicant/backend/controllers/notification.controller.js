const notificationService = require('../services/notification.service');

const createNotification = async (req, res, next) => {
  try {
    const { receiverId, senderId, type, title, message } = req.body;

    // Validate required fields
    if (!receiverId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: receiverId, type, title, message'
      });
    }

    // Send notification via service
    const job = await notificationService.sendNotification({
      receiverId,
      senderId: senderId || null,
      type,
      title,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      jobId: job?.id || 'queued'
    });
  } catch (error) {
    console.error('createNotification controller error:', error);
    next(error);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id; // From requireAuth middleware
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const notifications = await notificationService.getUserNotifications(userId, page, limit);

    res.status(200).json({
      success: true,
      page,
      limit,
      notifications
    });
  } catch (error) {
    console.error('getNotifications controller error:', error);
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id; // From requireAuth middleware
    const count = await notificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('getUnreadCount controller error:', error);
    next(error);
  }
};

const markNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user.id; // From requireAuth middleware
    const result = await notificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('markNotificationsRead controller error:', error);
    next(error);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markNotificationsRead
};
