// Use Google Gemini AI
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemPrompt = `You are the virtual assistant for MentorConnect, a platform that connects students with professional mentors.

APPLICATION CONTEXT:
- Students can find mentors in the "Discover" section
- Mentors can create one-day job shadowing internship offers
- Students can apply to internships in the "Internships" section
- Mentors can set their availability and students can book appointments (virtual or in-person)
- An instant messaging system enables communication
- Virtual appointments use Jitsi Meet for video conferencing

APPLICATION SECTIONS:
- Dashboard: Overview with statistics
- Discover: Find and connect with mentors
- Connections: Manage existing connections
- Messages: Instant messaging
- Internships: Internship offers (create/apply/manage)
- My Appointments: View and manage appointments
- Profile: Manage profile and availability (for mentors)

ROLES:
- Students: Look for mentors, apply to internships, book appointments
- Mentors: Offer mentorship, create internship offers, set their availability

INSTRUCTIONS:
- Respond in English in a friendly and professional manner
- Give clear step-by-step instructions
- Use emojis to make responses more engaging
- If the question is not related to the application, politely redirect to MentorConnect features
- Be concise but complete
- Don't invent features that don't exist`;

exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const user = req.user; // From auth middleware

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    // Build context with user info
    const userContext = `
Current User:
- Name: ${user.firstName} ${user.lastName}
- Role: ${user.role === 'mentor' ? 'Mentor' : 'Student'}
${user.role === 'student' ? `- Program: ${user.studentInfo?.program || 'Not specified'}
- Year: ${user.studentInfo?.year || 'Not specified'}` : ''}
${user.role === 'mentor' ? `- Expertise: ${user.mentorInfo?.expertise?.join(', ') || 'Not specified'}
- Industry: ${user.mentorInfo?.industry || 'Not specified'}` : ''}
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
      parts: [{ text: `Understood! I'm the MentorConnect assistant and I'll help ${user.firstName}.` }]
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
  
  if (lowerMessage.includes('mentor') && (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('trouver') || lowerMessage.includes('chercher'))) {
    return `Hi ${user.firstName}! 👋\n\nTo find a mentor:\n\n1. Go to the "Discover" section 📍\n2. Use filters to refine your search\n3. Click "Connect" on the mentor you're interested in\n4. Wait for their acceptance ✅\n\nGood luck!`;
  }
  
  if (lowerMessage.includes('internship') || lowerMessage.includes('stage') && (lowerMessage.includes('apply') || lowerMessage.includes('postuler') || lowerMessage.includes('candidat'))) {
    return `To apply to an internship:\n\n1. Go to "Internships" 📋\n2. Search for offers that interest you\n3. Click "Apply"\n4. Fill out the form\n5. Send! ✉️\n\nIt's simple and fast!`;
  }
  
  if (lowerMessage.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('schedule') || lowerMessage.includes('rendez-vous') || lowerMessage.includes('réserver') || lowerMessage.includes('rdv')) {
    return `To book an appointment:\n\n1. Go to "Discover" or "Connections" 🔍\n2. Find a mentor with the 📅 icon\n3. Click "Book Appointment"\n4. Choose date and time\n5. Confirm! ✓\n\nYou'll receive a video link!`;
  }
  
  if (lowerMessage.includes('message') || lowerMessage.includes('chat') || lowerMessage.includes('discuter')) {
    return `To send a message:\n\n1. Go to "Messages" 💬\n2. Select your contact\n3. Type your message\n4. Send! 📨\n\nMessages are instant!`;
  }
  
  return `Hi ${user.firstName}! 👋\n\nI can help you with:\n\n📍 Finding mentors\n📋 Applying to internships\n📅 Booking appointments\n💬 Using messaging\n👤 Managing your profile\n\nWhat would you like to know?`;
}
