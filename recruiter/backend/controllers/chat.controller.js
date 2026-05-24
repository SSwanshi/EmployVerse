const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const AppliedJob = require('../models/AppliedJob');
const AppliedInternship = require('../models/AppliedInternship');
const Job = require('../models/Jobs');
const Internship = require('../models/Internship');
const User = require('../models/User'); // Recruiter User model on default connection
const { connectApplicantDB } = require('../config/applicantDb');

// Helper to find application and its associated recruiterId
const getApplicationAndRecruiter = async (applicationId) => {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    return null;
  }

  // Ensure connection
  await connectApplicantDB();

  // Try job applications
  let application = await AppliedJob.findOne({ _id: applicationId });
  let jobOrInternship = null;
  let type = 'job';

  if (application) {
    jobOrInternship = await Job.findById(application.jobId).populate('jobCompany');
  } else {
    // Try internship applications
    application = await AppliedInternship.findOne({ _id: applicationId });
    if (application) {
      jobOrInternship = await Internship.findById(application.internshipId).populate('intCompany');
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

    await connectApplicantDB();

    const appDetails = await getApplicationAndRecruiter(applicationId);
    if (!appDetails) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const { application, jobOrInternship, recruiterId, type } = appDetails;

    // Verify application status is selected
    if (!application.isSelected) {
      return res.status(400).json({ success: false, message: 'Chat is only allowed when application status is selected' });
    }

    // Access check
    const userId = req.userId; // recruiterId
    const userIdStr = userId.toString();
    if (application.userId !== userIdStr && recruiterId.toString() !== userIdStr) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Check if chat exists
    let chat = await Chat.findOne({ applicationId });
    if (!chat) {
      // Create chat
      chat = await Chat.create({
        applicationId,
        applicantId: application.userId,
        recruiterId
      });
    }

    // Fetch recruiter details
    const recruiterUser = await User.findById(recruiterId);

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
        applicantName,
        type: type // 'job' or 'internship'
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

    await connectApplicantDB();

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Access check
    const userId = req.userId;
    const userIdStr = userId.toString();
    if (chat.applicantId !== userIdStr && chat.recruiterId.toString() !== userIdStr) {
      return res.status(403).json({ success: false, message: 'Access denied' });
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

    await connectApplicantDB();

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Access check
    const userId = req.userId;
    const userIdStr = userId.toString();
    if (chat.applicantId !== userIdStr && chat.recruiterId.toString() !== userIdStr) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const senderRole = chat.applicantId === userIdStr ? 'applicant' : 'recruiter';

    const newMessage = await Message.create({
      chatId,
      senderId: userIdStr,
      senderRole,
      message: message.trim()
    });

    // Update last message in Chat
    await Chat.findOneAndUpdate(
      { _id: chatId },
      { lastMessage: message.trim(), lastMessageAt: new Date() }
    );

    // Publish to Redis so that the applicant backend's socket server can broadcast it to the room
    try {
      const redis = require('../config/redis');
      if (redis && typeof redis.publish === 'function') {
        console.log(`📢 Recruiter REST API publishing to Redis chat:messages for chatId: ${chatId}`);
        await redis.publish('chat:messages', JSON.stringify(newMessage));
      }
    } catch (pubErr) {
      console.warn('⚠️ Redis publish failed in recruiter REST API sendMessage:', pubErr.message);
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
