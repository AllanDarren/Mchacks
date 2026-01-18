const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Créer une room pour un appel vidéo
router.post('/create-room', protect, async (req, res) => {
  try {
    const { contactId } = req.body;
    
    // Générer un ID unique pour la room
    const roomName = `mchacks-${uuidv4()}`;
    
    // Utiliser le domaine public Daily.co (gratuit, pas besoin d'API key)
    // Format: https://username.daily.co/roomname
    // Pour tester sans compte, on peut utiliser: https://daily.co/roomname
    const roomUrl = `https://daily.co/${roomName}`;
    
    console.log('Room créée:', roomUrl);
    
    res.json({
      roomUrl,
      roomName
    });
  } catch (error) {
    console.error('Erreur création room:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la room', error: error.message });
  }
});

module.exports = router;
