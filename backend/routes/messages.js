const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getMessages);
router.post('/send', protect, sendMessage);
router.put('/read/:messageId', protect, markAsRead);

module.exports = router;
