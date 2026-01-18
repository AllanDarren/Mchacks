const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const axios = require('axios');

// Créer une room Daily.co temporaire avec l'API
router.post('/create-room', protect, async (req, res) => {
  try {
    const { contactId } = req.body;
    
    // Créer une room temporaire via l'API Daily.co
    const response = await axios.post(
      'https://api.daily.co/v1/rooms',
      {
        properties: {
          enable_screenshare: true,
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
          exp: Math.floor(Date.now() / 1000) + 3600 // Expire dans 1 heure
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const roomUrl = response.data.url;
    const roomName = response.data.name;
    
    console.log('✅ Room Daily.co créée:', roomUrl);
    
    res.json({
      roomUrl,
      roomName
    });
  } catch (error) {
    console.error('❌ Erreur création room Daily.co:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Erreur lors de la création de la room', 
      error: error.response?.data || error.message 
    });
  }
});

module.exports = router;
