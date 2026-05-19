const User = require('../models/user');
const { getBucket } = require('../config/db');
const { ObjectId } = require('mongodb');

const getResume = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).send('Not logged in');

    const user = await User.findOne({ userId });
    if (!user?.resumeId) return res.status(404).send('No resume found');

    const bucket = getBucket();
    const files = await bucket.find({ _id: new ObjectId(user.resumeId) }).toArray();
    if (files.length === 0) return res.status(404).send('File not found');

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${files[0].filename}"`);

    const downloadStream = bucket.openDownloadStream(new ObjectId(user.resumeId));
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).send('Error downloading resume');
  }
};

const getProfileImage = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).send('Not logged in');

    const user = await User.findOne({ userId });
    if (!user?.profileImageId) return res.status(404).send('No profile image found');

    const bucket = getBucket();
    const files = await bucket.find({ _id: new ObjectId(user.profileImageId) }).toArray();
    if (files.length === 0) return res.status(404).send('File not found');

    res.set('Content-Type', files[0].contentType || 'image/jpeg');
    const downloadStream = bucket.openDownloadStream(new ObjectId(user.profileImageId));
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).send('Error downloading profile image');
  }
};

module.exports = {
  getResume,
  getProfileImage
};

