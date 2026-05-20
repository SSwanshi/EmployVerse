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
      'APPLICATION_SHORTLISTED',
      'APPLICATION_REJECTED',
      'INTERVIEW_SCHEDULED',
      'PAYMENT_SUCCESS',
      'APPLICATION_VIEWED',
      'SYSTEM'
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

// Create separate indexes just in case
NotificationSchema.index({ receiverId: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
