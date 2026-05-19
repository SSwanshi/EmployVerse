const express = require('express');
const router = express.Router();
const applicantController = require('../controllers/applicant.controller');
const { requireAuth } = require('../middleware/auth');
const { resumeUpload } = require('../middleware/upload');

// Get jobs
router.get('/jobs', applicantController.getJobs);

// Get internships
router.get('/internships', applicantController.getInternships);

// Get companies
router.get('/companies', applicantController.getCompanies);

// Filter jobs
router.post('/jobs/filter', applicantController.filterJobs);

// Filter internships
router.post('/internships/filter', applicantController.filterInternships);

// Get job by ID
router.get('/jobs/:jobId', applicantController.getJobById);

// Get internship by ID
router.get('/internships/:internshipId', applicantController.getInternshipById);

// Upload job-specific resume (must be before /apply so route matches first)
router.post('/jobs/:jobId/apply/resume', requireAuth, resumeUpload.single('resume'), applicantController.uploadJobApplicationResume);

// Apply for job
router.post('/jobs/:jobId/apply', requireAuth, applicantController.applyForJob);

// Apply for internship
router.get('/internships/:internshipId/apply', requireAuth, applicantController.checkInternshipApplication);

// Upload internship-specific resume (must be before /apply POST)
router.post('/internships/:internshipId/apply/resume', requireAuth, resumeUpload.single('resume'), applicantController.uploadInternshipApplicationResume);

router.post('/internships/:internshipId/apply', requireAuth, applicantController.applyForInternship);

// Get applied jobs
router.get('/applied-jobs', requireAuth, applicantController.getAppliedJobs);

// Get applied internships
router.get('/applied-internships', requireAuth, applicantController.getAppliedInternships);

// Proxy logo
router.get('/logo/:logoId', applicantController.getLogo);

// Dashboard stats
router.get('/dashboard/stats', requireAuth, applicantController.getDashboardStats);

module.exports = router;

