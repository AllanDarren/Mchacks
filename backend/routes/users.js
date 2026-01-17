const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  searchMentors,
  requestConnection,
  acceptConnection,
  getRecommendations
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/profile/:id', getUserProfile);
router.put('/profile', protect, updateProfile);
router.get('/mentors', protect, searchMentors);
router.post('/connect/:mentorId', protect, requestConnection);
router.put('/accept-connection/:studentId', protect, acceptConnection);
router.get('/recommendations', protect, getRecommendations);

module.exports = router;
