const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

router.post('/', searchController.search);

module.exports = router;

