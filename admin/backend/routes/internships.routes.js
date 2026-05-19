const express = require('express');
const router = express.Router();
const internshipsController = require('../controllers/internships.controller');
const { isAdmin } = require('../middleware/auth');

// Get all internships
router.get('/', isAdmin, internshipsController.getInternships);

// Get internship by ID
router.get('/:id', isAdmin, internshipsController.getInternshipById);

// Delete internship
router.delete('/:id', isAdmin, internshipsController.deleteInternship);

module.exports = router;
