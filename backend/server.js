require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');

// Import des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const appointmentRoutes = require('./routes/appointments');
const internshipRoutes = require('./routes/internships');
const notificationRoutes = require('./routes/notifications');

// Connexion à la base de données
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middlewares
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL + '/',
  'http://localhost:3000',
  'http://localhost:3000/'
];
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/notifications', notificationRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API de mentorat - Bienvenue!' });
});

// Gestion des connexions Socket.io
const connectedUsers = new Map();

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
    const receiverSocketId = connectedUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverId).emit('receive-message', message);
    }
  });

  // Notification d'écriture en cours
  socket.on('typing', (data) => {
    const { receiverId, isTyping } = data;
    io.to(receiverId).emit('user-typing', { 
      userId: data.senderId, 
      isTyping 
    });
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

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Une erreur est survenue sur le serveur', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = { app, io };
