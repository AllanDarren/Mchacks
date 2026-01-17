const Notification = require('../models/Notification');

// Créer une notification
exports.createNotification = async (userId, type, title, content, relatedId = null, onModel = null) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      content,
      relatedId,
      onModel
    });
    return notification;
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    return null;
  }
};

// Envoyer une notification en temps réel via Socket.io
exports.sendRealTimeNotification = (io, userId, notification) => {
  io.to(userId.toString()).emit('notification', notification);
};
