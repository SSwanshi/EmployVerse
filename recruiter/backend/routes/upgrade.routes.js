const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const upgradeController = require('../controllers/upgrade.controller');

router.post('/create-checkout-session', requireAuth, upgradeController.createCheckoutSession);
router.post('/verify-session', requireAuth, upgradeController.verifySession);

module.exports = router;
