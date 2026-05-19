const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Applicant API Server', status: 'running' });
});

module.exports = router;

