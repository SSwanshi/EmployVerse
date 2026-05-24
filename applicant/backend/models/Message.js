const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['applicant', 'recruiter'],
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { timestamps: true });

MessageSchema.index({ chatId: 1 });
MessageSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);
