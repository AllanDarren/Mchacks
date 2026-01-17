const express = require('express');
const router = express.Router();
const {
  getInternships,
  createInternship,
  applyToInternship,
  manageApplication
} = require('../controllers/internshipController');
const { protect } = require('../middleware/auth');

router.get('/', getInternships);
router.post('/', protect, createInternship);
router.post('/:id/apply', protect, applyToInternship);
router.put('/:id/applicants/:studentId', protect, manageApplication);

module.exports = router;
