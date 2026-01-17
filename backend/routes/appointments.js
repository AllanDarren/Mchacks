const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  cancelAppointment,
  getMentorAvailability,
  updateAvailability
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

router.post('/book', protect, bookAppointment);
router.get('/my-appointments', protect, getMyAppointments);
router.put('/:id/cancel', protect, cancelAppointment);
router.get('/mentor-availability/:mentorId', getMentorAvailability);
router.put('/availability', protect, updateAvailability);

module.exports = router;
