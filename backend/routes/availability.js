const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const availabilityController = require('../controllers/availabilityController');

// Routes protégées (authentifié requis)
router.use(protect);

// Créer une plage (mentor uniquement)
router.post('/', authorize('mentor'), availabilityController.createSlot);

// Obtenir toutes les plages d'un mentor
router.get('/mentor/:mentorId', availabilityController.getMentorSlots);

// Obtenir les réservations d'un étudiant
router.get('/my-bookings', availabilityController.getStudentBookings);

// Obtenir les plages disponibles d'un mentor
router.get('/available/:mentorId', availabilityController.getAvailableSlots);

// Mettre à jour une plage (mentor uniquement)
router.put('/:slotId', authorize('mentor'), availabilityController.updateSlot);

// Déplacer une plage (drag and drop - mentor uniquement)
router.patch('/:slotId/move', authorize('mentor'), availabilityController.moveSlot);

// Supprimer une plage (mentor uniquement)
router.delete('/:slotId', authorize('mentor'), availabilityController.deleteSlot);

// Réserver une plage (étudiant ou mentor)
router.post('/:slotId/book', authorize('student', 'mentor'), availabilityController.bookSlot);

// Annuler une réservation
router.post('/:slotId/cancel', availabilityController.cancelBooking);

module.exports = router;
