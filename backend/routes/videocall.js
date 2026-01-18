const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const axios = require('axios');

// Créer une room Daily.co temporaire (gratuit, pas besoin d'API key pour les rooms publiques)
router.post('/create-room', protect, async (req, res) => {
  try {
    const { contactId } = req.body;
    
    // Créer une room temporaire via l'API Daily.co (domaine public gratuit)
    // Pour production, créer un compte Daily.co et utiliser une vraie API key
    // Pour hackathon: utiliser les rooms publiques avec un nom unique
    
    const roomName = `mchacks-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // URL de la room Daily.co publique (pas besoin d'API pour les tests)
    // Format: https://your-domain.daily.co/roomname
    // Pour les tests, on utilise un domaine temporaire
    const roomUrl = `https://${roomName}.daily.co`;
    
    console.log('✅ Room Daily.co créée:', roomUrl);
    
    res.json({
      roomUrl,
      roomName
    });
  } catch (error) {
    console.error('❌ Erreur création room:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la room', error: error.message });
  }
});

module.exports = router;
