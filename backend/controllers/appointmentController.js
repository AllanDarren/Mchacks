const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { v4: uuidv4 } = require('uuid');

// @desc    Réserver une session avec un mentor
// @route   POST /api/appointments/book
// @access  Private (Student only)
exports.bookAppointment = async (req, res) => {
  try {
    const { mentorId, type, scheduledDate, duration, location, notes } = req.body;
    const studentId = req.user._id;

    // Vérifier que le mentor existe
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor non trouvé' });
    }

    // Vérifier que les utilisateurs sont connectés
    const student = await User.findById(studentId);
    if (!student.connections.includes(mentorId)) {
      return res.status(403).json({ message: 'Vous devez être connecté avec ce mentor pour réserver une session' });
    }

    // Vérifier la disponibilité
    const existingAppointment = await Appointment.findOne({
      mentorId,
      scheduledDate: new Date(scheduledDate),
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Ce créneau n\'est plus disponible' });
    }

    // Générer un lien de meeting si virtuel
    let meetingLink = '';
    if (type === 'virtual') {
      meetingLink = `https://meet.example.com/${uuidv4()}`; // À remplacer par une vraie intégration Zoom/Google Meet
    }

    // Créer le rendez-vous
    const appointment = await Appointment.create({
      studentId,
      mentorId,
      type,
      scheduledDate: new Date(scheduledDate),
      duration,
      location: type === 'in-person' ? location : '',
      meetingLink,
      notes,
      status: 'confirmed'
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('studentId', 'firstName lastName email profilePicture')
      .populate('mentorId', 'firstName lastName email profilePicture');

    // Créer des notifications pour les deux utilisateurs
    await Notification.create({
      userId: mentorId,
      type: 'appointment',
      title: 'Nouvelle réservation',
      content: `${student.firstName} ${student.lastName} a réservé une session avec vous`,
      relatedId: appointment._id,
      onModel: 'Appointment'
    });

    await Notification.create({
      userId: studentId,
      type: 'appointment',
      title: 'Réservation confirmée',
      content: `Votre session avec ${mentor.firstName} ${mentor.lastName} est confirmée`,
      relatedId: appointment._id,
      onModel: 'Appointment'
    });

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la réservation', error: error.message });
  }
};

// @desc    Obtenir les rendez-vous de l'utilisateur
// @route   GET /api/appointments/my-appointments
// @access  Private
exports.getMyAppointments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, upcoming } = req.query;

    let query = {
      $or: [{ studentId: userId }, { mentorId: userId }]
    };

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() };
    }

    const appointments = await Appointment.find(query)
      .populate('studentId', 'firstName lastName email profilePicture')
      .populate('mentorId', 'firstName lastName email profilePicture')
      .sort({ scheduledDate: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous', error: error.message });
  }
};

// @desc    Annuler un rendez-vous
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    // Vérifier que l'utilisateur est concerné par ce rendez-vous
    if (
      appointment.studentId.toString() !== req.user._id.toString() &&
      appointment.mentorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('studentId', 'firstName lastName email')
      .populate('mentorId', 'firstName lastName email');

    // Notifier l'autre partie
    const otherUserId = appointment.studentId.toString() === req.user._id.toString()
      ? appointment.mentorId
      : appointment.studentId;

    await Notification.create({
      userId: otherUserId,
      type: 'appointment',
      title: 'Rendez-vous annulé',
      content: 'Un rendez-vous a été annulé',
      relatedId: appointment._id,
      onModel: 'Appointment'
    });

    res.json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'annulation', error: error.message });
  }
};

// @desc    Obtenir les disponibilités d'un mentor
// @route   GET /api/appointments/mentor-availability/:mentorId
// @access  Public
exports.getMentorAvailability = async (req, res) => {
  try {
    const mentor = await User.findById(req.params.mentorId);

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor non trouvé' });
    }

    if (!mentor.mentorInfo.availability || !mentor.mentorInfo.availability.enabled) {
      return res.json({ available: false, slots: [] });
    }

    res.json({
      available: true,
      virtualCoffeeSlots: mentor.mentorInfo.availability.virtualCoffeeSlots || [],
      inPersonSlots: mentor.mentorInfo.availability.inPersonSlots || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des disponibilités', error: error.message });
  }
};

// @desc    Mettre à jour les disponibilités du mentor
// @route   PUT /api/appointments/availability
// @access  Private (Mentor only)
exports.updateAvailability = async (req, res) => {
  try {
    const mentor = await User.findById(req.user._id);

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(403).json({ message: 'Accès réservé aux mentors' });
    }

    const { enabled, virtualCoffeeSlots, inPersonSlots } = req.body;

    mentor.mentorInfo.availability = {
      enabled: enabled !== undefined ? enabled : mentor.mentorInfo.availability.enabled,
      virtualCoffeeSlots: virtualCoffeeSlots || mentor.mentorInfo.availability.virtualCoffeeSlots,
      inPersonSlots: inPersonSlots || mentor.mentorInfo.availability.inPersonSlots
    };

    await mentor.save();

    res.json({ message: 'Disponibilités mises à jour', availability: mentor.mentorInfo.availability });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des disponibilités', error: error.message });
  }
};
