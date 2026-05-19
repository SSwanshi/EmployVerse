const express = require('express');
const router = express.Router();
const recruiterController = require('../controllers/recruiter.controller');
const companiesController = require('../controllers/companies.controller');
const jobsController = require('../controllers/jobs.controller');
const internshipsController = require('../controllers/internships.controller');
const { requireAuth } = require('../middleware/auth');
const { logoUpload } = require('../middleware/multer');

// Companies
router.get('/companies', requireAuth, companiesController.getCompanies);
router.post('/add-company', requireAuth, logoUpload.fields([{ name: 'logo' }, { name: 'proofDocument' }]), companiesController.addCompany);
router.get('/edit-company/:id', requireAuth, companiesController.getEditCompany);
router.post('/edit-company/:id', requireAuth, logoUpload.fields([{ name: 'logo' }, { name: 'proofDocument' }]), companiesController.updateCompany);
router.delete('/delete-company/:companyId', requireAuth, companiesController.deleteCompany);

// Jobs
router.get('/jobs', requireAuth, jobsController.getJobs);
router.post('/add-job', requireAuth, jobsController.addJob);
router.get('/edit-job/:id', requireAuth, jobsController.getEditJob);
router.put('/edit-job/:id', requireAuth, jobsController.updateJob);
router.delete('/delete-job/:jobId', requireAuth, jobsController.deleteJob);

// Internships
router.get('/internships', requireAuth, internshipsController.getInternships);
router.post('/add-internship', requireAuth, internshipsController.addInternship);
router.get('/edit-internship/:id', requireAuth, internshipsController.getEditInternship);
router.put('/edit-internship/:id', requireAuth, internshipsController.updateInternship);
router.delete('/delete-intern/:intId', requireAuth, internshipsController.deleteInternship);

// Statistics
router.get('/home/statistics', requireAuth, recruiterController.getStatistics);

module.exports = router;

