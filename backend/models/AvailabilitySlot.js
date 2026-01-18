const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
  mentorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Date et heure de la plage
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  
  // Type de rencontre
  type: {
    type: String,
    enum: ['virtual', 'in-person'],
    required: true
  },
  
  // Localisation (pour les rencontres en personne)
  location: {
    type: String,
    default: ''
  },
  
  // Lien de réunion (pour les rencontres virtuelles)
  meetingLink: {
    type: String,
    default: ''
  },
  
  // État de la plage
  isBooked: {
    type: Boolean,
    default: false
  },
  
  // Réservation associée (si isBooked = true)
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  
  // Étudiant qui a réservé (si isBooked = true)
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Notes du mentor pour cette plage
  notes: {
    type: String,
    default: ''
  },
  
  // Durée en minutes
  duration: {
    type: Number,
    required: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour recherche rapide
availabilitySlotSchema.index({ mentorId: 1, startDateTime: 1 });
availabilitySlotSchema.index({ mentorId: 1, isBooked: 1 });

// Mise à jour automatique du champ updatedAt
availabilitySlotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('AvailabilitySlot', availabilitySlotSchema);
