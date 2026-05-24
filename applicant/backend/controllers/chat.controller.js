const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Applied_for_Jobs = require('../models/Applied_for_Jobs');
const Applied_for_Internships = require('../models/Applied_for_Internships');
const connectRecruiterDB = require('../config/recruiterDB');
const createJobModel = require('../models/recruiter/Job');
const createInternshipModel = require('../models/recruiter/Internships');
const createCompanyModel = require('../models/recruiter/Company');

// Helper to find application and its associated job/internship recruiterId
const getApplicationAndRecruiter = async (applicationId) => {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    return null;
  }

  // 1. Search in Job Applications
  let application = await Applied_for_Jobs.findById(applicationId);
  let jobOrInternship = null;
  let type = 'job';

  if (application) {
    const recruiterConn = await connectRecruiterDB();
    const JobModel = createJobModel(recruiterConn);
    createCompanyModel(recruiterConn);
    jobOrInternship = await JobModel.findById(application.jobId).populate('jobCompany');
  } else {
    // 2. Search in Internship Applications
    application = await Applied_for_Internships.findById(applicationId);
    if (application) {
      const recruiterConn = await connectRecruiterDB();
      const InternshipModel = createInternshipModel(recruiterConn);
      createCompanyModel(recruiterConn);
      jobOrInternship = await InternshipModel.findById(application.internshipId).populate('intCompany');
      type = 'internship';
    }
  }

  if (!application || !jobOrInternship) {
    return null;
  }

  return {
    application,
    jobOrInternship,
    recruiterId: jobOrInternship.createdBy,
    type
  };
};

const createOrGetChat = async (req, res) => {
  try {
    const { applicationId } = req.body;
    if (!applicationId) {
      return res.status(400).json({ success: false, message: 'applicationId is required' });
    }

    // Verify application
    const appDetails = await getApplicationAndRecruiter(applicationId);
    if (!appDetails) {
      return res.status(404).json({ success: false, message: 'Application or Opportunity not found' });
    }

    const { application, jobOrInternship, recruiterId, type } = appDetails;

    // Verify application status is selected
    if (!application.isSelected) {
      return res.status(400).json({ success: false, message: 'Chat is only allowed when application status is selected' });
    }

    // Access check
    const userId = req.user.id || req.user._id;
    const userIdStr = userId.toString();
    if (application.userId !== userIdStr && recruiterId.toString() !== userIdStr) {
      return res.status(403).json({ success: false, message: 'Access denied to this chat' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({ applicationId });
    if (!chat) {
      // Create new chat
      chat = new Chat({
        applicationId,
        applicantId: application.userId,
        recruiterId
      });
      await chat.save();
    }

    // Fetch extra details for response
    const recruiterConn = await connectRecruiterDB();
    const RecruiterModel = recruiterConn.models.User || recruiterConn.model('User', new mongoose.Schema({
      firstName: String,
      lastName: String
    }));
    const recruiterUser = await RecruiterModel.findById(recruiterId);

    const jobTitle = type === 'job' ? jobOrInternship.jobTitle : jobOrInternship.intTitle;
    const companyName = type === 'job' ? jobOrInternship.jobCompany?.companyName : jobOrInternship.intCompany?.companyName;
    const recruiterName = recruiterUser ? `${recruiterUser.firstName} ${recruiterUser.lastName}` : 'Recruiter';
    const applicantName = `${application.firstName} ${application.lastName}`;

    res.json({
      success: true,
      chat,
      details: {
        jobTitle: jobTitle || 'N/A',
        companyName: companyName || 'N/A',
        recruiterName,
        applicantName
      }
    });
  } catch (error) {
    console.error('Error in createOrGetChat:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ success: false, message: 'Invalid chatId' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Access check
    const userId = req.user.id || req.user._id;
    const userIdStr = userId.toString();
    if (chat.applicantId !== userIdStr && chat.recruiterId.toString() !== userIdStr) {
      return res.status(403).json({ success: false, message: 'Access denied to this chat messages' });
    }

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error in getChatMessages:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ success: false, message: 'Invalid chatId' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Access check
    const userId = req.user.id || req.user._id;
    const userIdStr = userId.toString();
    if (chat.applicantId !== userIdStr && chat.recruiterId.toString() !== userIdStr) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const senderRole = chat.applicantId === userIdStr ? 'applicant' : 'recruiter';

    const newMessage = new Message({
      chatId,
      senderId: userIdStr,
      senderRole,
      message: message.trim()
    });

    await newMessage.save();

    // Update last message in Chat
    chat.lastMessage = message.trim();
    chat.lastMessageAt = new Date();
    await chat.save();

    // Publish to Redis to broadcast to everyone
    try {
      const redis = require('../config/redis');
      if (redis && typeof redis.publish === 'function') {
        console.log(`📢 REST API publishing to Redis chat:messages for chatId: ${chatId}`);
        await redis.publish('chat:messages', JSON.stringify(newMessage));
      } else {
        throw new Error('Redis client not available');
      }
    } catch (pubErr) {
      console.warn('⚠️ Redis publish failed in REST API sendMessage. Falling back to local Socket.IO broadcast:', pubErr.message);
      try {
        const { getIO } = require('../config/socket');
        const io = getIO();
        const roomId = chat.applicationId.toString();
        io.to(roomId).emit('receive_message', newMessage);
      } catch (socketErr) {
        console.warn('⚠️ Socket broadcast fallback skipped in REST API sendMessage:', socketErr.message);
      }
    }

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = {
  createOrGetChat,
  getChatMessages,
  sendMessage,
  getApplicationAndRecruiter
};
