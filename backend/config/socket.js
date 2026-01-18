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

    // Daily.co - Invitation d'appel vidéo
    socket.on('daily-call-invite', ({ to, roomUrl, callerName }) => {
      console.log(`📞 Invitation Daily.co de ${callerName} vers ${to} - Room: ${roomUrl}`);
      io.to(to).emit('daily-call-invite', {
        roomUrl: roomUrl,
        callerName: callerName
      });
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
