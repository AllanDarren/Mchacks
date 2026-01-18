const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Créer une room pour un appel vidéo
router.post('/create-room', protect, async (req, res) => {
  try {
    const { contactId } = req.body;
    
    // Générer un ID unique pour la room
    const roomName = `call-${uuidv4()}`;
    
    // URL de la room (sans API - utilise juste une URL unique)
    const roomUrl = `https://mentorconnect.daily.co/${roomName}`;
    
    // Tu peux aussi créer via l'API Daily.co si tu veux plus de contrôle
    // Pour l'instant, on utilise juste des URLs uniques
    
    res.json({
      roomUrl,
      roomName
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la room', error: error.message });
  }
});

module.exports = router;
