const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/jobs', requireAuth, recommendationController.recommendJobs);
router.get('/internships', requireAuth, recommendationController.recommendInternships);

module.exports = router;
