const express = require('express');
const router = express.Router();
const filesController = require('../controllers/files.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/resume', requireAuth, filesController.getResume);
router.get('/profile-image', requireAuth, filesController.getProfileImage);

module.exports = router;

