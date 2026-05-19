const express = require('express');
const router = express.Router();
const applicationsController = require('../controllers/applications.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/:jobId', requireAuth, applicationsController.getJobApplications);
router.post('/:jobId/select/:applicantId', requireAuth, applicationsController.selectApplicant);
router.post('/:jobId/reject/:applicantId', requireAuth, applicationsController.rejectApplicant);
router.get('/:jobId/resume/:resumeId', requireAuth, applicationsController.getResume);

module.exports = router;

// testing ci

