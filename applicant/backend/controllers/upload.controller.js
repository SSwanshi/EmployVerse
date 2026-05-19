const User = require('../models/user');
const { getBucket } = require('../config/db');
const { ObjectId } = require('mongodb');

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    const user = await User.findOne({ userId: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const bucket = getBucket();

    if (user.resumeId) {
      await bucket.delete(new ObjectId(user.resumeId));
    }

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: 'application/pdf'
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async () => {
      user.resumeId = uploadStream.id;
      await user.save();
      res.json({ success: true, message: 'Resume uploaded successfully' });
    });

    uploadStream.on('error', (err) => {
      console.error('Upload stream error:', err);
      res.status(500).json({ success: false, message: 'Upload failed' });
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    const user = await User.findOne({ userId: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const bucket = getBucket();

    if (user.profileImageId) {
      await bucket.delete(new ObjectId(user.profileImageId));
    }

    const uploadStream = bucket.openUploadStream(`profile-${Date.now()}`, {
      contentType: req.file.mimetype
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async () => {
      user.profileImageId = uploadStream.id;
      await user.save();
      res.json({ success: true, message: 'Profile image uploaded successfully' });
    });

    uploadStream.on('error', (err) => {
      console.error('Upload stream error:', err);
      res.status(500).json({ success: false, message: 'Upload failed' });
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

module.exports = {
  uploadResume,
  uploadProfileImage
};

