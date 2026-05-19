const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { isAdmin } = require('../middleware/auth');

// Get premium users
router.get('/premium-users', isAdmin, adminController.getPremiumUsers);

// Get proof document - handle OPTIONS for CORS preflight
router.options('/company/proof/:proofId', (req, res) => {
  res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

router.get('/company/proof/:proofId', isAdmin, adminController.getProofDocument);

module.exports = router;

