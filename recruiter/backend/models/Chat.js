const mongoose = require('mongoose');
const { getApplicantConnection } = require('../config/applicantDb');

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
}, { 
  timestamps: true,
  collection: 'chats'
});

function getChatModel() {
  const applicantConn = getApplicantConnection();
  const connection = applicantConn || mongoose;
  if (connection.models && connection.models['Chat']) {
    return connection.models['Chat'];
  }
  return connection.model('Chat', ChatSchema);
}

module.exports = {
  findOne: (query) => getChatModel().findOne(query),
  findById: (id) => getChatModel().findById(id),
  create: (data) => getChatModel().create(data),
  findOneAndUpdate: (query, update, options) => getChatModel().findOneAndUpdate(query, update, options),
  getChatModel
};
