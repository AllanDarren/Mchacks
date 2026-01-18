// Use Google Gemini AI
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `Tu es l'assistant virtuel de MentorConnect, une plateforme qui connecte des étudiants avec des mentors professionnels.

CONTEXTE DE L'APPLICATION:
- Les étudiants peuvent trouver des mentors dans la section "Découvrir"
- Les mentors peuvent créer des offres de stages d'observation d'une journée
- Les étudiants peuvent postuler aux stages dans la section "Stages"
- Les mentors peuvent définir leurs disponibilités et les étudiants peuvent réserver des rendez-vous (virtuels ou en personne)
- Un système de messagerie instantanée permet la communication
- Les rendez-vous virtuels utilisent Jitsi Meet pour la visioconférence

SECTIONS DE L'APPLICATION:
- Dashboard: Vue d'ensemble avec statistiques
- Découvrir: Trouver et se connecter avec des mentors
- Connexions: Gérer les connexions existantes
- Messages: Messagerie instantanée
- Stages: Offres de stages d'observation (créer/postuler/gérer)
- Rendez-vous: Voir et gérer les rendez-vous
- Profile: Gérer son profil et disponibilités (pour mentors)

RÔLES:
- Étudiants: Cherchent des mentors, postulent aux stages, réservent des rendez-vous
- Mentors: Offrent du mentorat, créent des offres de stages, définissent leurs disponibilités

INSTRUCTIONS:
- Réponds en français de manière amicale et professionnelle
- Donne des instructions claires et étape par étape
- Utilise des emojis pour rendre les réponses plus engageantes
- Si la question n'est pas liée à l'application, redirige poliment vers les fonctionnalités de MentorConnect
- Sois concis mais complet
- N'invente pas de fonctionnalités qui n'existent pas`;

exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const user = req.user; // From auth middleware

    if (!message) {
      return res.status(400).json({ error: 'Message requis' });
    }

    // Build context with user info
    const userContext = `
Utilisateur actuel:
- Nom: ${user.firstName} ${user.lastName}
- Rôle: ${user.role === 'mentor' ? 'Mentor' : 'Étudiant'}
${user.role === 'student' ? `- Programme: ${user.studentInfo?.program || 'Non spécifié'}
- Année: ${user.studentInfo?.year || 'Non spécifié'}` : ''}
${user.role === 'mentor' ? `- Expertise: ${user.mentorInfo?.expertise?.join(', ') || 'Non spécifié'}
- Secteur: ${user.mentorInfo?.industry || 'Non spécifié'}` : ''}
`;

    // Build conversation history for Gemini
    const chatHistory = [];
    
    // Add system prompt and user context
    chatHistory.push({
      role: 'user',
      parts: [{ text: systemPrompt + '\n\n' + userContext }]
    });
    chatHistory.push({
      role: 'model',
      parts: [{ text: `Compris! Je suis l'assistant MentorConnect et je vais aider ${user.firstName}.` }]
    });

    // Add previous conversation if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.slice(-10).forEach(msg => {
        if (msg.sender === 'user') {
          chatHistory.push({
            role: 'user',
            parts: [{ text: msg.text }]
          });
        } else if (msg.sender === 'bot') {
          chatHistory.push({
            role: 'model',
            parts: [{ text: msg.text }]
          });
        }
      });
    }

    // Try to get AI response from Gemini
    let botResponse;
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'models/gemini-2.5-flash'
      });

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(message);
      const response = result.response;
      botResponse = response.text();
    } catch (apiError) {
      console.log('Gemini API error, using fallback:', apiError.message);
      // Use intelligent fallback
      botResponse = getFallbackResponse(message, user);
    }

    res.json({
      success: true,
      message: botResponse,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Final fallback response
    const fallbackResponse = getFallbackResponse(req.body.message, req.user);
    
    res.json({
      success: true,
      message: fallbackResponse,
      timestamp: new Date(),
      fallback: true
    });
  }
};

// Intelligent fallback function
function getFallbackResponse(message, user) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('mentor') && (lowerMessage.includes('trouver') || lowerMessage.includes('chercher'))) {
    return `Salut ${user.firstName}! 👋\n\nPour trouver un mentor:\n\n1. Va dans la section "Découvrir" 📍\n2. Utilise les filtres pour affiner ta recherche\n3. Clique sur "Se connecter" sur le mentor qui t'intéresse\n4. Attends son acceptation ✅\n\nBonne chance!`;
  }
  
  if (lowerMessage.includes('stage') && (lowerMessage.includes('postuler') || lowerMessage.includes('candidat'))) {
    return `Pour postuler à un stage:\n\n1. Va dans "Stages" 📋\n2. Cherche les offres qui t'intéressent\n3. Clique sur "Postuler"\n4. Remplis le formulaire\n5. Envoie! ✉️\n\nC'est simple et rapide!`;
  }
  
  if (lowerMessage.includes('rendez-vous') || lowerMessage.includes('réserver') || lowerMessage.includes('rdv')) {
    return `Pour réserver un rendez-vous:\n\n1. Va dans "Découvrir" ou "Connexions" 🔍\n2. Trouve un mentor avec l'icône 📅\n3. Clique sur "Réserver un rendez-vous"\n4. Choisis date et heure\n5. Confirme! ✓\n\nTu recevras un lien de visio!`;
  }
  
  if (lowerMessage.includes('message') || lowerMessage.includes('discuter') || lowerMessage.includes('chat')) {
    return `Pour envoyer un message:\n\n1. Va dans "Messages" 💬\n2. Sélectionne ton contact\n3. Tape ton message\n4. Envoie! 📨\n\nLes messages sont instantanés!`;
  }
  
  return `Salut ${user.firstName}! 👋\n\nJe peux t'aider avec:\n\n📍 Trouver des mentors\n📋 Postuler aux stages\n📅 Réserver des rendez-vous\n💬 Utiliser la messagerie\n👤 Gérer ton profil\n\nQue veux-tu savoir?`;
}
