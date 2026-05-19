const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { requireAuth } = require('../middleware/auth');
const { resumeUpload, profileImageUpload } = require('../middleware/upload');

router.post('/resume', requireAuth, resumeUpload.single('resume'), uploadController.uploadResume);
router.post('/profile-image', requireAuth, profileImageUpload.single('profileImage'), uploadController.uploadProfileImage);

module.exports = router;

