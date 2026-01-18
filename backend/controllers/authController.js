const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

// Génère un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    // Check validation errors
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { email, password, role, firstName, lastName, studentInfo, mentorInfo } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    // Créer le nouvel utilisateur
    const user = await User.create({
      email,
      password,
      role,
      firstName,
      lastName,
      studentInfo: role === 'student' ? studentInfo : undefined,
      mentorInfo: role === 'mentor' ? mentorInfo : undefined
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'inscription', error: error.message });
  }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    // Check validation errors
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Trouver l'utilisateur
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion', error: error.message });
  }
};

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du profil', error: error.message });
  }
};
