const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email invalide'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'mentor'],
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  
  // Informations spécifiques pour les étudiants
  studentInfo: {
    educationLevel: String,
    interests: [String],
    goals: String,
    age: Number
  },
  
  // Informations spécifiques pour les mentors
  mentorInfo: {
    currentJob: String,
    company: String,
    industry: String,
    expertise: [String],
    bio: String,
    professionalHistory: [{
      position: String,
      company: String,
      startDate: Date,
      endDate: Date,
      current: Boolean
    }],
    
    // Préférences de communication
    communicationPreferences: [{
      type: {
        type: String,
        enum: ['messaging', 'virtual', 'in-person']
      }
    }],
    
    // Disponibilités pour réservations
    availability: {
      enabled: {
        type: Boolean,
        default: false
      },
      virtualCoffeeSlots: [{
        dayOfWeek: {
          type: Number,
          min: 0,
          max: 6
        },
        startTime: String,
        endTime: String,
        duration: Number
      }],
      inPersonSlots: [{
        dayOfWeek: {
          type: Number,
          min: 0,
          max: 6
        },
        startTime: String,
        endTime: String,
        location: String
      }]
    },
    
    offersInternship: {
      type: Boolean,
      default: false
    }
  },
  
  // Connexions (étudiants connectés pour un mentor, mentors connectés pour un étudiant)
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Demandes de connexion en attente
  pendingConnections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Mise à jour automatique du champ updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
