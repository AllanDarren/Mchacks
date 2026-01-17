const Internship = require('../models/Internship');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Obtenir tous les stages disponibles
// @route   GET /api/internships
// @access  Public
exports.getInternships = async (req, res) => {
  try {
    const { industry, location, search, page = 1, limit = 10 } = req.query;
    
    let query = {};

    if (industry) {
      query.industry = industry;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const internships = await Internship.find(query)
      .populate('mentorId', 'firstName lastName profilePicture mentorInfo')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Internship.countDocuments(query);

    res.json({
      internships,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des stages', error: error.message });
  }
};

// @desc    Créer un nouveau stage
// @route   POST /api/internships
// @access  Private (Mentor only)
exports.createInternship = async (req, res) => {
  try {
    const mentorId = req.user._id;
    const mentor = await User.findById(mentorId);

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(403).json({ message: 'Seuls les mentors peuvent créer des stages' });
    }

    const { title, company, description, duration, location, industry, availableDates, maxStudents } = req.body;

    const internship = await Internship.create({
      mentorId,
      title,
      company,
      description,
      duration,
      location,
      industry,
      availableDates,
      maxStudents
    });

    const populatedInternship = await Internship.findById(internship._id)
      .populate('mentorId', 'firstName lastName profilePicture');

    res.status(201).json(populatedInternship);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du stage', error: error.message });
  }
};

// @desc    Postuler à un stage
// @route   POST /api/internships/:id/apply
// @access  Private (Student only)
exports.applyToInternship = async (req, res) => {
  try {
    const studentId = req.user._id;
    const student = await User.findById(studentId);

    if (!student || student.role !== 'student') {
      return res.status(403).json({ message: 'Seuls les étudiants peuvent postuler' });
    }

    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ message: 'Stage non trouvé' });
    }

    // Vérifier si l'étudiant a déjà postulé
    const alreadyApplied = internship.applicants.some(
      applicant => applicant.studentId.toString() === studentId.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'Vous avez déjà postulé à ce stage' });
    }

    // Vérifier le nombre maximum de participants
    const acceptedCount = internship.applicants.filter(a => a.status === 'accepted').length;
    if (acceptedCount >= internship.maxStudents) {
      return res.status(400).json({ message: 'Ce stage a atteint sa capacité maximale' });
    }

    internship.applicants.push({
      studentId,
      status: 'pending',
      appliedAt: new Date()
    });

    await internship.save();

    const mentor = await User.findById(internship.mentorId);

    // Créer une notification pour le mentor
    await Notification.create({
      userId: internship.mentorId,
      type: 'internship',
      title: 'Nouvelle candidature',
      content: `${student.firstName} ${student.lastName} a postulé pour votre stage "${internship.title}"`,
      relatedId: internship._id,
      onModel: 'Internship'
    });

    res.json({ message: 'Candidature envoyée avec succès', internship });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la candidature', error: error.message });
  }
};

// @desc    Gérer une candidature (accepter/refuser)
// @route   PUT /api/internships/:id/applicants/:studentId
// @access  Private (Mentor only)
exports.manageApplication = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' ou 'rejected'
    const mentorId = req.user._id;

    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ message: 'Stage non trouvé' });
    }

    if (internship.mentorId.toString() !== mentorId.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const applicant = internship.applicants.find(
      a => a.studentId.toString() === req.params.studentId
    );

    if (!applicant) {
      return res.status(404).json({ message: 'Candidature non trouvée' });
    }

    applicant.status = status;
    await internship.save();

    const student = await User.findById(req.params.studentId);
    const mentor = await User.findById(mentorId);

    // Créer une notification pour l'étudiant
    await Notification.create({
      userId: req.params.studentId,
      type: 'internship',
      title: status === 'accepted' ? 'Candidature acceptée' : 'Candidature refusée',
      content: `${mentor.firstName} ${mentor.lastName} a ${status === 'accepted' ? 'accepté' : 'refusé'} votre candidature pour "${internship.title}"`,
      relatedId: internship._id,
      onModel: 'Internship'
    });

    res.json({ message: 'Candidature mise à jour', internship });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la gestion de la candidature', error: error.message });
  }
};
