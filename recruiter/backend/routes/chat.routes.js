const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, chatController.createOrGetChat);
router.get('/:chatId/messages', requireAuth, chatController.getChatMessages);
router.post('/:chatId/message', requireAuth, chatController.sendMessage);

module.exports = router;
