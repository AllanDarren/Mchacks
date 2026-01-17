const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Obtenir toutes les conversations de l'utilisateur
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Trouver tous les utilisateurs avec qui l'utilisateur a échangé
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
    .sort({ timestamp: -1 })
    .populate('senderId', 'firstName lastName profilePicture role')
    .populate('receiverId', 'firstName lastName profilePicture role');

    // Extraire les conversations uniques
    const conversationsMap = new Map();
    
    messages.forEach(message => {
      const otherUserId = message.senderId._id.toString() === userId.toString() 
        ? message.receiverId._id.toString() 
        : message.senderId._id.toString();
      
      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: message.senderId._id.toString() === userId.toString() 
            ? message.receiverId 
            : message.senderId,
          lastMessage: message,
          unreadCount: 0
        });
      }
    });

    // Compter les messages non lus pour chaque conversation
    for (let [otherUserId, conversation] of conversationsMap) {
      const unreadCount = await Message.countDocuments({
        senderId: otherUserId,
        receiverId: userId,
        read: false
      });
      conversation.unreadCount = unreadCount;
    }

    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des conversations', error: error.message });
  }
};

// @desc    Obtenir les messages avec un utilisateur spécifique
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    })
    .sort({ timestamp: 1 })
    .populate('senderId', 'firstName lastName profilePicture')
    .populate('receiverId', 'firstName lastName profilePicture');

    // Marquer les messages reçus comme lus
    await Message.updateMany(
      { senderId: otherUserId, receiverId: currentUserId, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des messages', error: error.message });
  }
};

// @desc    Envoyer un message
// @route   POST /api/messages/send
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    // Vérifier que les utilisateurs sont connectés
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: 'Destinataire non trouvé' });
    }

    // Créer le message
    const message = await Message.create({
      senderId,
      receiverId,
      content
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'firstName lastName profilePicture')
      .populate('receiverId', 'firstName lastName profilePicture');

    // Créer une notification pour le destinataire
    await Notification.create({
      userId: receiverId,
      type: 'message',
      title: 'Nouveau message',
      content: `${sender.firstName} ${sender.lastName} vous a envoyé un message`,
      relatedId: message._id,
      onModel: 'Message'
    });

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message', error: error.message });
  }
};

// @desc    Marquer un message comme lu
// @route   PUT /api/messages/read/:messageId
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message non trouvé' });
    }

    if (message.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    message.read = true;
    await message.save();

    res.json({ message: 'Message marqué comme lu' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du message', error: error.message });
  }
};
