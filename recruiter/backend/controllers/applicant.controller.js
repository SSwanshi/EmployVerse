const { getApplicantConnection, getApplicantBucket } = require('../config/applicantDb');
const mongoose = require('mongoose');

// Schema matching the actual applicant User model
const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  password: { type: String },
  memberSince: { type: Date, default: Date.now },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files' },
  profileImageId: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files' },
  collegeName: { type: String, default: '' },
  skills: { type: String, default: '' },
  about: { type: String, default: '' },
  linkedinProfile: { type: String, default: '' },
  githubProfile: { type: String, default: '' },
  portfolioWebsite: { type: String, default: '' },
  workExperience: { type: String, default: '' },
  achievements: { type: String, default: '' },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  twoFactorEnabled: { type: Boolean, default: true }
}, { timestamps: true });

// Helper function to get or create the User model
const getApplicantUserModel = (connection) => {
  if (connection.models.User) {
    return connection.models.User;
  }
  return connection.model('User', UserSchema);
};

// Controller to get applicant details from applicant database
const getApplicantDetails = async (req, res) => {
  try {
    // Only premium recruiters can view applicant profiles
    if (!req.user?.isPremium) {
      return res.status(403).json({
        success: false,
        message: 'Upgrade to Pro to view applicant profiles',
        requiresPremium: true
      });
    }

    const { applicantId } = req.params;
    console.log('Fetching applicant details for ID:', applicantId);
    
    if (!applicantId) {
      return res.status(400).json({
        success: false,
        message: 'Applicant ID is required'
      });
    }

    // Get applicant database connection
    const applicantDB = getApplicantConnection();
    if (!applicantDB) {
      console.error('No applicant database connection available');
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to applicant database'
      });
    }

    // Get the User model for applicant database
    const ApplicantUser = getApplicantUserModel(applicantDB);

    // The applicantId from the frontend is the custom userId field (not MongoDB _id)
    // Try finding by custom userId first, then by _id as fallback
    let applicant = await ApplicantUser.findOne({ userId: applicantId }).select('-password -otp -otpExpiry');
    
    if (!applicant) {
      // Fallback: try by MongoDB _id
      if (mongoose.Types.ObjectId.isValid(applicantId)) {
        applicant = await ApplicantUser.findById(applicantId).select('-password -otp -otpExpiry');
      }
    }

    if (!applicant) {
      console.log('Applicant not found for ID:', applicantId);
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }

    console.log('Applicant found:', applicant.email);

    // Build a clean response object with hasProfileImage flag
    const applicantData = {
      _id: applicant._id,
      userId: applicant.userId,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      phone: applicant.phone,
      gender: applicant.gender,
      memberSince: applicant.memberSince,
      collegeName: applicant.collegeName,
      skills: applicant.skills,
      about: applicant.about,
      linkedinProfile: applicant.linkedinProfile,
      githubProfile: applicant.githubProfile,
      portfolioWebsite: applicant.portfolioWebsite,
      workExperience: applicant.workExperience,
      achievements: applicant.achievements,
      hasProfileImage: !!applicant.profileImageId,
      hasResume: !!applicant.resumeId,
      resumeId: applicant.resumeId || null,
      createdAt: applicant.createdAt,
      updatedAt: applicant.updatedAt
    };
    
    if (!applicant) {
      console.log('Applicant not found for ID:', applicantId);
      return res.status(404).json({
        success: false,
        message: 'Applicant not found'
      });
    }

    console.log('Applicant found:', applicant.email);

    // Set cache control headers to prevent 304 responses
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.json({
      success: true,
      applicant: applicantData
    });

  } catch (error) {
    console.error('Error fetching applicant details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Controller to get applicant profile image (streamed from GridFS)
const getApplicantImage = async (req, res) => {
  try {
    const { applicantId } = req.params;
    console.log('Fetching applicant image for ID:', applicantId);
    
    if (!applicantId) {
      return res.status(400).json({
        success: false,
        message: 'Applicant ID is required'
      });
    }

    // Get applicant database connection
    const applicantDB = getApplicantConnection();
    if (!applicantDB) {
      console.error('No applicant database connection available');
      return res.status(500).json({
        success: false,
        message: 'Failed to connect to applicant database'
      });
    }

    // Get the User model for applicant database
    const ApplicantUser = getApplicantUserModel(applicantDB);

    // Find applicant by custom userId first, then by _id
    let applicant = await ApplicantUser.findOne({ userId: applicantId }).select('profileImageId');
    if (!applicant && mongoose.Types.ObjectId.isValid(applicantId)) {
      applicant = await ApplicantUser.findById(applicantId).select('profileImageId');
    }

    if (!applicant || !applicant.profileImageId) {
      return res.status(404).json({
        success: false,
        message: 'Profile image not found'
      });
    }

    // Get GridFS bucket from applicant DB
    const bucket = getApplicantBucket();
    if (!bucket) {
      return res.status(500).json({
        success: false,
        message: 'GridFS bucket not available'
      });
    }

    // Find the file metadata in GridFS
    const files = await applicantDB.db.collection('uploads.files').findOne({
      _id: applicant.profileImageId
    });

    if (!files) {
      return res.status(404).json({
        success: false,
        message: 'Image file not found in storage'
      });
    }

    // Set appropriate headers
    res.set({
      'Content-Type': files.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400'
    });

    // Stream the file from GridFS
    const downloadStream = bucket.openDownloadStream(applicant.profileImageId);
    downloadStream.pipe(res);

    downloadStream.on('error', (err) => {
      console.error('Error streaming image:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error streaming image' });
      }
    });

  } catch (error) {
    console.error('Error fetching applicant image:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Controller to get applicant resume (streamed from GridFS)
const getApplicantResume = async (req, res) => {
  try {
    const { applicantId } = req.params;

    if (!applicantId) {
      return res.status(400).json({ success: false, message: 'Applicant ID is required' });
    }

    const applicantDB = getApplicantConnection();
    if (!applicantDB) {
      return res.status(500).json({ success: false, message: 'Failed to connect to applicant database' });
    }

    const ApplicantUser = getApplicantUserModel(applicantDB);

    let applicant = await ApplicantUser.findOne({ userId: applicantId }).select('resumeId');
    if (!applicant && mongoose.Types.ObjectId.isValid(applicantId)) {
      applicant = await ApplicantUser.findById(applicantId).select('resumeId');
    }

    if (!applicant || !applicant.resumeId) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    const bucket = getApplicantBucket();
    if (!bucket) {
      return res.status(500).json({ success: false, message: 'GridFS bucket not available' });
    }

    const files = await bucket.find({ _id: applicant.resumeId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({ success: false, message: 'Resume file not found in storage' });
    }

    const file = files[0];
    res.set({
      'Content-Type': file.contentType || 'application/pdf',
      'Content-Disposition': `inline; filename="${file.filename || 'resume.pdf'}"`,
      'Content-Length': file.length
    });

    const downloadStream = bucket.openDownloadStream(applicant.resumeId);
    downloadStream.pipe(res);

    downloadStream.on('error', (err) => {
      console.error('Error streaming resume:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error streaming resume' });
      }
    });

  } catch (error) {
    console.error('Error fetching applicant resume:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getApplicantDetails,
  getApplicantImage,
  getApplicantResume
};