const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const { requireAuth } = require('../middleware/auth');
const { resumeUpload, profileImageUpload } = require('../middleware/upload');

// Get profile
router.get('/', requireAuth, profileController.getProfile);

// Update profile
router.put('/', requireAuth, profileController.updateProfile);

// Delete profile
router.delete('/', requireAuth, profileController.deleteProfile);

// Upload resume
router.post('/resume', requireAuth, resumeUpload.single('resume'), profileController.uploadResume);

// Get resume
router.get('/resume', requireAuth, profileController.getResume);

// Delete resume
router.delete('/resume', requireAuth, profileController.deleteResume);

// Upload profile image
router.post('/image', requireAuth, profileImageUpload.single('profileImage'), profileController.uploadProfileImage);

// Get profile image
router.get('/image', requireAuth, profileController.getProfileImage);

// Delete profile image
router.delete('/image', requireAuth, profileController.deleteProfileImage);

module.exports = router;
