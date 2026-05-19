const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { isAdmin } = require('../middleware/auth');

// Login
router.post('/login', authController.login);
router.post('/verify-2fa', authController.verify2FA);

// Logout
router.post('/logout', isAdmin, authController.logout);

// Get current user
router.get('/me', isAdmin, authController.getCurrentUser);

module.exports = router;

