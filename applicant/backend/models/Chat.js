const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  applicantId: {
    type: String,
    required: true
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

ChatSchema.index({ applicationId: 1 }, { unique: true });
ChatSchema.index({ applicantId: 1 });
ChatSchema.index({ recruiterId: 1 });

module.exports = mongoose.model('Chat', ChatSchema);
