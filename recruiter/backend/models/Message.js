const mongoose = require('mongoose');
const { getApplicantConnection } = require('../config/applicantDb');

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
}, { 
  timestamps: true,
  collection: 'messages'
});

function getMessageModel() {
  const applicantConn = getApplicantConnection();
  const connection = applicantConn || mongoose;
  if (connection.models && connection.models['Message']) {
    return connection.models['Message'];
  }
  return connection.model('Message', MessageSchema);
}

module.exports = {
  find: (query) => getMessageModel().find(query),
  create: (data) => getMessageModel().create(data),
  getMessageModel
};
