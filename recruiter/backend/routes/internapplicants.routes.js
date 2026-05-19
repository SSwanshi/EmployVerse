const express = require('express');
const router = express.Router();
const internapplicantsController = require('../controllers/internapplicants.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/:internshipId', requireAuth, internapplicantsController.getInternshipApplications);
router.post('/:internshipId/select/:applicantId', requireAuth, internapplicantsController.selectApplicant);
router.post('/:internshipId/reject/:applicantId', requireAuth, internapplicantsController.rejectApplicant);
router.get('/:internshipId/resume/:resumeId', requireAuth, internapplicantsController.getResume);

module.exports = router;

