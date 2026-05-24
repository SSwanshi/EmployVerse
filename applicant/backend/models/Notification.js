const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  receiverId: {
    type: String,
    ref: 'User',
    required: true,
    index: true
  },
  senderId: {
    type: String,
    ref: 'User',
    required: false
  },
  type: {
    type: String,
    enum: [
      'APPLICATION_RECEIVED',
      'APPLICATION_SUBMITTED',
      'APPLICATION_SHORTLISTED',
      'APPLICATION_REJECTED',
      'INTERVIEW_SCHEDULED',
      'PAYMENT_SUCCESS',
      'APPLICATION_VIEWED',
      'SYSTEM',
      'CHAT_MESSAGE'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index — covers: fetch by receiver sorted by date (most common query)
NotificationSchema.index({ receiverId: 1, createdAt: -1 });
// Covers unread count query: find all unread for a user
NotificationSchema.index({ receiverId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
