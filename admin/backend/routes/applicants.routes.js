const express = require('express');
const router = express.Router();
const applicantsController = require('../controllers/applicants.controller');
const { isAdmin } = require('../middleware/auth');

// Get all applicants
router.get('/', isAdmin, applicantsController.getApplicants);

// Get applicant by ID
router.get('/:id', isAdmin, applicantsController.getApplicantById);

// Delete applicant
router.delete('/:id', isAdmin, applicantsController.deleteApplicant);

module.exports = router;
