const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify-2fa', authController.verify2FA);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getCurrentUser);

// Forgot password routes
router.post('/forgot-password', authController.sendForgotPasswordOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

module.exports = router;

