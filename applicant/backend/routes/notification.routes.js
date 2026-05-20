const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const notificationController = require('../controllers/notification.controller');

// POST /api/notifications/internal - Internal endpoint (from other servers)
// No auth required for internal server-to-server communication
router.post('/internal', notificationController.createNotification);

// All routes below are protected
router.use(requireAuth);

// GET /api/notifications
router.get('/', notificationController.getNotifications);

// GET /api/notifications/unread-count
router.get('/unread-count', notificationController.getUnreadCount);

// PUT /api/notifications/mark-read
router.put('/mark-read', notificationController.markNotificationsRead);

// PUT /api/notifications/mark-read/:id
router.put('/mark-read/:id', notificationController.markSingleNotificationRead);

module.exports = router;
