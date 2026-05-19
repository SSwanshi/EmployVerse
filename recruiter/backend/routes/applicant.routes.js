const express = require('express');
const { getApplicantDetails, getApplicantImage, getApplicantResume } = require('../controllers/applicant.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get applicant details by ID
router.get('/details/:applicantId', requireAuth, getApplicantDetails);

// Get applicant profile image by ID
router.get('/image/:applicantId', requireAuth, getApplicantImage);

// Get applicant resume by ID
router.get('/resume/:applicantId', requireAuth, getApplicantResume);

module.exports = router;