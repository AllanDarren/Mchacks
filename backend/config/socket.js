// Map pour tracker les utilisateurs connectés
const connectedUsers = new Map();

// Fonction pour initialiser les événements Socket.io
const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Nouvelle connexion Socket.io:', socket.id);

    // Enregistrer l'utilisateur
    socket.on('register', (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.join(userId);
      console.log(`Utilisateur ${userId} enregistré avec socket ${socket.id}`);
      
      // Notifier le statut en ligne
      socket.broadcast.emit('user-online', userId);
    });

    // Gérer les messages en temps réel
    socket.on('send-message', (data) => {
      const { receiverId, message } = data;
      // Émettre au destinataire dans sa room
      io.to(receiverId).emit('receive-message', message);
      console.log(`Message envoyé à ${receiverId}`);
    });

    // Notification d'écriture en cours
    socket.on('typing', (data) => {
      const { receiverId, isTyping, senderId } = data;
      io.to(receiverId).emit('user-typing', { 
        userId: senderId, 
        isTyping 
      });
    });

    // WebRTC - Offre d'appel vidéo
    socket.on('webrtc-offer', ({ to, offer, callerName }) => {
      const callerId = Array.from(connectedUsers.entries()).find(([_, socketId]) => socketId === socket.id)?.[0];
      console.log(`📞 Offre WebRTC de ${callerName} (${callerId}) vers ${to}`);
      io.to(to).emit('webrtc-offer', {
        from: callerId,
        offer: offer,
        callerName: callerName
      });
    });

    // WebRTC - Réponse à l'appel
    socket.on('webrtc-answer', ({ to, answer }) => {
      console.log(`📞 Réponse WebRTC vers ${to}`);
      io.to(to).emit('webrtc-answer', {
        answer: answer
      });
    });

    // WebRTC - Candidat ICE
    socket.on('ice-candidate', ({ to, candidate }) => {
      console.log(`🧊 ICE candidate vers ${to}`);
      io.to(to).emit('ice-candidate', {
        candidate: candidate
      });
    });

    // Fin d'appel
    socket.on('end-call', ({ to }) => {
      console.log(`📞 Fin d'appel vers ${to}`);
      io.to(to).emit('call-ended');
    });

    socket.on('accept-call', ({ to }) => {
      console.log(`Appel accepté par ${socket.id}`);
      io.to(to).emit('call-accepted', {
        from: Array.from(connectedUsers.entries()).find(([_, socketId]) => socketId === socket.id)?.[0]
      });
    });

    socket.on('reject-call', ({ to }) => {
      console.log(`Appel refusé par ${socket.id}`);
      io.to(to).emit('call-rejected');
    });

    socket.on('end-call', ({ to }) => {
      console.log(`Appel terminé par ${socket.id}`);
      io.to(to).emit('call-ended');
    });

    // Déconnexion
    socket.on('disconnect', () => {
      let disconnectedUserId;
      for (let [userId, socketId] of connectedUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          connectedUsers.delete(userId);
          break;
        }
      }
      
      if (disconnectedUserId) {
        socket.broadcast.emit('user-offline', disconnectedUserId);
        console.log(`Utilisateur ${disconnectedUserId} déconnecté`);
      }
    });
  });
};

// Exporter les fonctions et la map
module.exports = {
  initializeSocket,
  connectedUsers
};
