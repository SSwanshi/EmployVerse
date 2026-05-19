const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companies.controller');
const { isAdmin } = require('../middleware/auth');

// Get all companies
router.get('/', isAdmin, companiesController.getCompanies);

// Get companies awaiting verification
router.get('/awaiting-verification', isAdmin, companiesController.getCompaniesAwaitingVerification);

// Verify company
router.post('/verify/:id', isAdmin, companiesController.verifyCompany);

// Get company by ID
router.get('/:id', isAdmin, companiesController.getCompanyById);

// Delete company
router.delete('/:id', isAdmin, companiesController.deleteCompany);

module.exports = router;

