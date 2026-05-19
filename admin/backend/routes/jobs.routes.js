const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobs.controller');
const { isAdmin } = require('../middleware/auth');

// Get all jobs
router.get('/', isAdmin, jobsController.getJobs);

// Get job by ID
router.get('/:id', isAdmin, jobsController.getJobById);

// Delete job
router.delete('/:id', isAdmin, jobsController.deleteJob);

module.exports = router;

