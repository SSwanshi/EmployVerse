const express = require('express');
const router = express.Router();
const recruitersController = require('../controllers/recruiters.controller');
const { isAdmin } = require('../middleware/auth');

// Get all recruiters
router.get('/', isAdmin, recruitersController.getRecruiters);

// Get recruiter by ID
router.get('/:id', isAdmin, recruitersController.getRecruiterById);

// Delete recruiter
router.delete('/:id', isAdmin, recruitersController.deleteRecruiter);

module.exports = router;
