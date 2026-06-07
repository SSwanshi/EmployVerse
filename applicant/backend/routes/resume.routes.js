const express = require('express');
const router = express.Router();
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const atsController = require('../controllers/ats.controller');

// Configure multer to use memory storage for temporary parsing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Calculate ATS Score
// requireAuth is optional depending on if we allow anonymous testing
router.post('/ats-score', requireAuth, upload.single('resumeFile'), atsController.atsScore);

module.exports = router;
