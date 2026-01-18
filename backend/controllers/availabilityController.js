const AvailabilitySlot = require('../models/AvailabilitySlot');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Créer une nouvelle plage de disponibilité
exports.createSlot = async (req, res) => {
  try {
    const { startDateTime, endDateTime, type, location, meetingLink, notes } = req.body;
    const mentorId = req.user._id;

    // Validation
    if (!startDateTime || !endDateTime) {
      return res.status(400).json({ message: 'Les dates sont requises' });
    }

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      return res.status(400).json({ message: 'La date de fin doit être après la date de début' });
    }

    // Calculer la durée en minutes
    const duration = Math.round(
      (new Date(endDateTime) - new Date(startDateTime)) / 60000
    );

    const slot = new AvailabilitySlot({
      mentorId,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      type,
      location,
      meetingLink,
      notes,
      duration
    });

    await slot.save();
    await slot.populate('mentorId', 'firstName lastName');

    res.status(201).json({
      message: 'Plage de disponibilité créée avec succès',
      slot
    });
  } catch (error) {
    console.error('Erreur lors de la création de la plage:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Obtenir toutes les plages d'un mentor
exports.getMentorSlots = async (req, res) => {
  try {
    const mentorId = req.params.mentorId;

    const slots = await AvailabilitySlot.find({ mentorId })
      .populate('mentorId', 'firstName lastName')
      .populate('studentId', 'firstName lastName email')
      .sort({ startDateTime: 1 });

    res.json(slots);
  } catch (error) {
    console.error('Erreur lors de la récupération des plages:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Obtenir les plages disponibles d'un mentor (non réservées)
exports.getAvailableSlots = async (req, res) => {
  try {
    const mentorId = req.params.mentorId;
    const { date } = req.query;

    let query = {
      mentorId,
      isBooked: false,
      startDateTime: { $gte: new Date() }
    };

    // Filtrer par date si fournie
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.startDateTime = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const slots = await AvailabilitySlot.find(query)
      .populate('mentorId', 'firstName lastName')
      .sort({ startDateTime: 1 });

    res.json(slots);
  } catch (error) {
    console.error('Erreur lors de la récupération des plages disponibles:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Mettre à jour une plage
exports.updateSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { startDateTime, endDateTime, type, location, meetingLink, notes } = req.body;
    const mentorId = req.user._id;

    const slot = await AvailabilitySlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ message: 'Plage non trouvée' });
    }

    if (slot.mentorId.toString() !== mentorId.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: 'Impossible de modifier une plage réservée' });
    }

    // Mise à jour
    if (startDateTime) slot.startDateTime = new Date(startDateTime);
    if (endDateTime) slot.endDateTime = new Date(endDateTime);
    if (type) slot.type = type;
    if (location !== undefined) slot.location = location;
    if (meetingLink !== undefined) slot.meetingLink = meetingLink;
    if (notes !== undefined) slot.notes = notes;

    // Recalculer la durée
    if (startDateTime || endDateTime) {
      slot.duration = Math.round(
        (new Date(slot.endDateTime) - new Date(slot.startDateTime)) / 60000
      );
    }

    await slot.save();
    await slot.populate('mentorId', 'firstName lastName');

    res.json({
      message: 'Plage mise à jour avec succès',
      slot
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la plage:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Déplacer une plage (drag and drop)
exports.moveSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { newStartDateTime, newEndDateTime } = req.body;
    const mentorId = req.user._id;

    const slot = await AvailabilitySlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ message: 'Plage non trouvée' });
    }

    if (slot.mentorId.toString() !== mentorId.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: 'Impossible de déplacer une plage réservée' });
    }

    slot.startDateTime = new Date(newStartDateTime);
    slot.endDateTime = new Date(newEndDateTime);
    slot.duration = Math.round(
      (new Date(slot.endDateTime) - new Date(slot.startDateTime)) / 60000
    );

    await slot.save();

    res.json({
      message: 'Plage déplacée avec succès',
      slot
    });
  } catch (error) {
    console.error('Erreur lors du déplacement de la plage:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer une plage
exports.deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const mentorId = req.user._id;

    const slot = await AvailabilitySlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ message: 'Plage non trouvée' });
    }

    if (slot.mentorId.toString() !== mentorId.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: 'Impossible de supprimer une plage réservée' });
    }

    await AvailabilitySlot.findByIdAndDelete(slotId);

    res.json({ message: 'Plage supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la plage:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Réserver une plage
exports.bookSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const studentId = req.user._id;
    const { notes } = req.body;

    const slot = await AvailabilitySlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ message: 'Plage non trouvée' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: 'Cette plage est déjà réservée' });
    }

    // Créer un rendez-vous
    const appointment = new Appointment({
      studentId,
      mentorId: slot.mentorId,
      type: slot.type,
      scheduledDate: slot.startDateTime,
      duration: slot.duration,
      location: slot.location,
      meetingLink: slot.meetingLink,
      notes: notes || slot.notes,
      status: 'confirmed'
    });

    await appointment.save();

    // Mettre à jour la plage
    slot.isBooked = true;
    slot.appointmentId = appointment._id;
    slot.studentId = studentId;
    await slot.save();

    await slot.populate([
      { path: 'mentorId', select: 'firstName lastName' },
      { path: 'studentId', select: 'firstName lastName' }
    ]);

    // Créer une notification pour le mentor
    const student = await User.findById(studentId);
    const mentor = await User.findById(slot.mentorId);

    const notification = new Notification({
      userId: slot.mentorId,
      type: 'appointment',
      title: 'Nouvelle réservation',
      content: `${student.firstName} ${student.lastName} a réservé une plage de ${slot.duration} minutes`,
      relatedId: appointment._id
    });

    await notification.save();

    // Émettre via Socket.io
    global.io.to(`user_${slot.mentorId}`).emit('slot:booked', {
      slotId: slot._id,
      mentorId: slot.mentorId,
      studentName: `${student.firstName} ${student.lastName}`
    });

    res.json({
      message: 'Plage réservée avec succès',
      appointment,
      slot
    });
  } catch (error) {
    console.error('Erreur lors de la réservation:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Annuler une réservation
exports.cancelBooking = async (req, res) => {
  try {
    const { slotId } = req.params;
    const userId = req.user._id;

    const slot = await AvailabilitySlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ message: 'Plage non trouvée' });
    }

    // Vérification des droits
    if (
      slot.mentorId.toString() !== userId.toString() &&
      slot.studentId.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    if (!slot.isBooked) {
      return res.status(400).json({ message: 'Cette plage n\'est pas réservée' });
    }

    // Supprimer le rendez-vous
    await Appointment.findByIdAndDelete(slot.appointmentId);

    // Réinitialiser la plage
    slot.isBooked = false;
    slot.appointmentId = null;
    slot.studentId = null;
    await slot.save();

    // Créer une notification
    const cancelledBy = await User.findById(userId);
    const recipient = slot.mentorId.toString() === userId.toString() ? slot.studentId : slot.mentorId;

    const notification = new Notification({
      userId: recipient,
      type: 'appointment',
      title: 'Réservation annulée',
      content: `${cancelledBy.firstName} ${cancelledBy.lastName} a annulé la réservation`,
      relatedId: slot._id
    });

    await notification.save();

    // Émettre via Socket.io
    global.io.to(`user_${recipient}`).emit('slot:cancelled', {
      slotId: slot._id
    });

    res.json({ message: 'Réservation annulée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Obtenir les réservations d'un étudiant
exports.getStudentBookings = async (req, res) => {
  try {
    const studentId = req.user._id;

    const slots = await AvailabilitySlot.find({
      studentId,
      isBooked: true
    })
      .populate('mentorId', 'firstName lastName email profilePicture mentorInfo')
      .populate('appointmentId')
      .sort({ startDateTime: 1 });

    res.json(slots);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
