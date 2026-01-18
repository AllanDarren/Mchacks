const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Obtenir le profil d'un utilisateur
// @route   GET /api/users/profile/:id
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Nettoyer les pendingConnections qui sont déjà dans connections
    if (user.role === 'mentor' && user.pendingConnections && user.pendingConnections.length > 0) {
      const originalLength = user.pendingConnections.length;
      user.pendingConnections = user.pendingConnections.filter(
        pendingId => !user.connections.some(connId => connId.toString() === pendingId.toString())
      );
      
      // Sauvegarder si des changements ont été faits
      if (user.pendingConnections.length !== originalLength) {
        await user.save();
      }
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du profil', error: error.message });
  }
};

// @desc    Mettre à jour le profil de l'utilisateur connecté
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mettre à jour les champs communs
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.profilePicture = req.body.profilePicture || user.profilePicture;

    // Mettre à jour les champs spécifiques au rôle
    if (user.role === 'student' && req.body.studentInfo) {
      user.studentInfo = { ...user.studentInfo, ...req.body.studentInfo };
    }

    if (user.role === 'mentor' && req.body.mentorInfo) {
      user.mentorInfo = { ...user.mentorInfo, ...req.body.mentorInfo };
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error: error.message });
  }
};

// @desc    Rechercher des mentors avec filtres
// @route   GET /api/users/mentors
// @access  Private
exports.searchMentors = async (req, res) => {
  try {
    const { search, industry, expertise, communicationType, offersInternship, page = 1, limit = 20 } = req.query;
    
    let query = { role: 'mentor' };

    // Filtres de recherche
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { 'mentorInfo.currentJob': { $regex: search, $options: 'i' } },
        { 'mentorInfo.company': { $regex: search, $options: 'i' } }
      ];
    }

    if (industry) {
      query['mentorInfo.industry'] = { $regex: industry, $options: 'i' };
    }

    if (expertise) {
      query['mentorInfo.expertise'] = { $elemMatch: { $regex: expertise, $options: 'i' } };
    }

    if (communicationType) {
      query['mentorInfo.preferredCommunication'] = communicationType;
    }

    if (offersInternship === 'true') {
      query['mentorInfo.offersInternship'] = true;
    }

    const mentors = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      mentors,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la recherche de mentors', error: error.message });
  }
};

// @desc    Demander une connexion avec un mentor
// @route   POST /api/users/connect/:mentorId
// @access  Private (Student only)
exports.requestConnection = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const mentor = await User.findById(req.params.mentorId);

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ message: 'Mentor non trouvé' });
    }

    // Vérifier si la connexion existe déjà
    if (student.connections.includes(mentor._id)) {
      return res.status(400).json({ message: 'Vous êtes déjà connecté avec ce mentor' });
    }

    // Vérifier si une demande est déjà en attente
    if (mentor.pendingConnections.includes(student._id)) {
      return res.status(400).json({ message: 'Demande de connexion déjà envoyée' });
    }

    // Ajouter à la liste des demandes en attente
    mentor.pendingConnections.push(student._id);
    await mentor.save();

    // Créer une notification pour le mentor
    await Notification.create({
      userId: mentor._id,
      type: 'connection',
      title: 'Nouvelle demande de connexion',
      content: `${student.firstName} ${student.lastName} souhaite se connecter avec vous`,
      relatedId: student._id,
      onModel: 'User'
    });

    res.json({ message: 'Demande de connexion envoyée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi de la demande', error: error.message });
  }
};

// @desc    Accepter une demande de connexion
// @route   PUT /api/users/accept-connection/:studentId
// @access  Private (Mentor only)
exports.acceptConnection = async (req, res) => {
  try {
    console.log('=== DÉBUT ACCEPTATION CONNEXION ===');
    console.log('Mentor ID:', req.user._id);
    console.log('Student ID:', req.params.studentId);
    
    const mentor = await User.findById(req.user._id);
    const student = await User.findById(req.params.studentId);

    console.log('Mentor trouvé:', mentor ? 'Oui' : 'Non');
    console.log('Student trouvé:', student ? 'Oui' : 'Non');
    console.log('Student role:', student?.role);

    if (!student) {
      console.log('ERREUR: Étudiant non trouvé');
      return res.status(404).json({ message: 'Étudiant non trouvé' });
    }
    
    if (student.role !== 'student') {
      console.log('ERREUR: Ce n\'est pas un étudiant, role:', student.role);
      return res.status(404).json({ message: 'Cet utilisateur n\'est pas un étudiant' });
    }

    // Vérifier si déjà connecté
    const alreadyConnected = mentor.connections.some(
      connId => connId.toString() === student._id.toString()
    );
    console.log('Déjà connecté?', alreadyConnected);
    
    if (alreadyConnected) {
      console.log('ATTENTION: Déjà connecté, nettoyage de pendingConnections');
      // Retirer de pendingConnections si présent
      mentor.pendingConnections = mentor.pendingConnections.filter(
        id => id.toString() !== student._id.toString()
      );
      await mentor.save();
      return res.status(400).json({ message: 'Vous êtes déjà connecté avec cet étudiant' });
    }

    console.log('Avant - Mentor connections:', mentor.connections.length);
    console.log('Avant - Mentor pending:', mentor.pendingConnections.length);
    console.log('Avant - Student connections:', student.connections.length);

    // Retirer de la liste d'attente
    mentor.pendingConnections = mentor.pendingConnections.filter(
      id => id.toString() !== student._id.toString()
    );

    // Ajouter aux connexions des deux utilisateurs
    if (!mentor.connections.includes(student._id)) {
      mentor.connections.push(student._id);
    }
    
    if (!student.connections.includes(mentor._id)) {
      student.connections.push(mentor._id);
    }

    await mentor.save();
    await student.save();

    console.log('Après - Mentor connections:', mentor.connections.length);
    console.log('Après - Mentor pending:', mentor.pendingConnections.length);
    console.log('Après - Student connections:', student.connections.length);

    // Créer une notification pour l'étudiant
    await Notification.create({
      userId: student._id,
      type: 'connection',
      title: 'Connexion acceptée',
      content: `${mentor.firstName} ${mentor.lastName} a accepté votre demande de connexion`,
      relatedId: mentor._id,
      onModel: 'User'
    });

    console.log('=== SUCCÈS ACCEPTATION ===');
    res.json({ message: 'Connexion acceptée avec succès' });
  } catch (error) {
    console.error('=== ERREUR ACCEPTATION ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Erreur lors de l\'acceptation de la connexion', error: error.message });
  }
};

// @desc    Obtenir les recommandations de mentors pour un étudiant
// @route   GET /api/users/recommendations
// @access  Private (Student only)
exports.getRecommendations = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    
    if (!student || !student.studentInfo || !student.studentInfo.interests) {
      return res.json({ mentors: [] });
    }

    const studentInterests = student.studentInfo.interests;

    // Trouver des mentors dont l'expertise correspond aux intérêts de l'étudiant
    const recommendedMentors = await User.find({
      role: 'mentor',
      _id: { $nin: [...student.connections, student._id] },
      $or: [
        { 'mentorInfo.expertise': { $in: studentInterests } },
        { 'mentorInfo.industry': { $in: studentInterests } }
      ]
    })
    .select('-password')
    .limit(10);

    res.json({ mentors: recommendedMentors });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des recommandations', error: error.message });
  }
};
