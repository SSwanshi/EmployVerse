const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { requireAuth } = require('../middleware/auth');

router.post('/create-payment-intent', requireAuth, paymentController.createPaymentIntent);
router.get('/payment', requireAuth, paymentController.getPaymentPage);
router.post('/process-payment', requireAuth, paymentController.processPayment);
router.get('/receipt', requireAuth, paymentController.getReceipt);
router.get('/subscription', requireAuth, paymentController.getSubscription);
router.get('/terms', paymentController.getTerms);
router.get('/privacy', paymentController.getPrivacy);

module.exports = router;

