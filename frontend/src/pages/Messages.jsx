import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { messagesAPI, usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import JitsiVideoCall from '../components/VideoCall/JitsiVideoCall';

const Messages = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  
  // État pour les appels vidéo Jitsi
  const [callRoomName, setCallRoomName] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null); // {callerName, roomName}

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Écouter les appels entrants Jitsi
  useEffect(() => {
    if (!socket.socket) return;

    const handleIncomingCall = (data) => {
      console.log('📞 Appel Jitsi entrant:', data);
      
      // Ne pas afficher si déjà en appel
      if (callRoomName) {
        console.log('Déjà en appel, ignoré');
        return;
      }
      
      setIncomingCall({
        callerName: data.callerName || 'Utilisateur',
        roomName: data.roomName
      });
    };

    socket.socket.on('jitsi-call-invite', handleIncomingCall);

    return () => {
      socket.socket.off('jitsi-call-invite', handleIncomingCall);
    };
  }, [socket, callRoomName]);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  }, []);

  const openNewConversation = useCallback(async (contactId) => {
    try {
      // Récupérer les infos du contact
      const response = await usersAPI.getProfile(contactId);
      const contact = response.data;
      
      // Créer un objet conversation
      const newConv = {
        user: contact,
        lastMessage: { content: '' },
        unreadCount: 0
      };
      
      // Sélectionner cette conversation
      setSelectedConversation(newConv);
      setMessages([]);
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de la conversation:', error);
    }
  }, []);

  const selectConversation = useCallback(async (conversation) => {
    setSelectedConversation(conversation);
    try {
      const response = await messagesAPI.getMessages(conversation.user._id);
      setMessages(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    
    socket.onReceiveMessage((message) => {
      if (selectedConversation && 
          (message.senderId._id === selectedConversation.user._id || 
           message.receiverId._id === selectedConversation.user._id)) {
        setMessages(prev => [...prev, message]);
      }
      fetchConversations();
    });

    return () => {
      socket.off('receive-message');
    };
  }, [selectedConversation, socket, fetchConversations]);

  // Gérer l'ouverture automatique d'une conversation depuis l'URL
  useEffect(() => {
    const contactId = searchParams.get('contact');
    if (contactId && !loading) {
      // Chercher si une conversation existe déjà
      const existingConv = conversations.find(conv => conv.user._id === contactId);
      
      if (existingConv) {
        // Ouvrir la conversation existante
        selectConversation(existingConv);
      } else {
        // Créer une nouvelle conversation
        openNewConversation(contactId);
      }
    }
  }, [searchParams, conversations, loading, selectConversation, openNewConversation]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Vider le champ immédiatement pour une meilleure UX

    try {
      const response = await messagesAPI.sendMessage({
        receiverId: selectedConversation.user._id,
        content: messageContent
      });
      
      // Ajouter le message à la liste
      setMessages(prevMessages => [...prevMessages, response.data]);
      
      // Envoyer via socket
      socket.sendMessage(selectedConversation.user._id, response.data);
      
      // Rafraîchir la liste des conversations pour mettre à jour le dernier message
      fetchConversations();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      // Restaurer le message en cas d'erreur
      setNewMessage(messageContent);
      alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    }
  };

  const startCall = () => {
    if (!selectedConversation) return;
    
    console.log('🎥 Démarrage appel Jitsi vers:', selectedConversation.user._id);
    
    // Créer un nom de room unique
    const roomName = `mchacks-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Rejoindre la room immédiatement
    setCallRoomName(roomName);
    
    // Envoyer l'invitation via socket
    socket.socket.emit('jitsi-call-invite', {
      to: selectedConversation.user._id,
      roomName: roomName,
      callerName: `${user.firstName} ${user.lastName}`
    });
    
    console.log('📤 Invitation Jitsi envoyée - Room:', roomName);
  };

  const acceptIncomingCall = () => {
    console.log('✅ Acceptation de l\'appel de:', incomingCall?.callerName);
    if (incomingCall) {
      setCallRoomName(incomingCall.roomName);
      setIncomingCall(null);
    }
  };

  const rejectIncomingCall = () => {
    console.log('❌ Refus de l\'appel');
    setIncomingCall(null);
  };

  const closeCall = () => {
    console.log('📞 Fermeture de l\'appel vidéo');
    setCallRoomName(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Liste des conversations */}
      <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <div>
          {conversations.map((conv) => (
            <div
              key={conv.user._id}
              onClick={() => selectConversation(conv)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.user._id === conv.user._id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-600">
                    {conv.user.firstName?.[0]}{conv.user.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">
                    {conv.user.firstName} {conv.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage.content}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 bg-white border-b flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">
                  {selectedConversation.user.firstName} {selectedConversation.user.lastName}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedConversation.user.role === 'mentor' 
                    ? selectedConversation.user.mentorInfo?.currentJob 
                    : selectedConversation.user.studentInfo?.educationLevel}
                </p>
              </div>
              
              {/* Bouton d'appel vidéo */}
              <button
                onClick={startCall}
                className="p-3 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-colors"
                title="Démarrer un appel vidéo"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">Aucun message</p>
                    <p className="text-sm">Envoyez le premier message pour commencer la conversation !</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={message._id || index}
                      className={`mb-4 flex ${
                        message.senderId._id === user._id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                          message.senderId._id === user._id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId._id === user._id ? 'text-indigo-200' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                    newMessage.trim()
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Envoyer
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Sélectionnez une conversation
          </div>
        )}
      </div>

      {/* Composant d'appel vidéo Jitsi */}
      {callRoomName && (
        <JitsiVideoCall
          roomName={callRoomName}
          displayName={`${user.firstName} ${user.lastName}`}
          onLeave={closeCall}
        />
      )}

      {/* Notification d'appel entrant */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Appel vidéo entrant</h3>
              <p className="text-gray-600 mb-6">{incomingCall.callerName} vous appelle</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={rejectIncomingCall}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  Refuser
                </button>
                <button
                  onClick={acceptIncomingCall}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Accepter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
