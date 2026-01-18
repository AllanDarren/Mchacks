import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { messagesAPI, usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';

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

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="h-full flex">
          {/* Liste des conversations */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
            </div>
            <div>
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Aucune conversation</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.user._id}
                    onClick={() => selectConversation(conv)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.user._id === conv.user._id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-indigo-600">
                          {conv.user.firstName?.[0]}{conv.user.lastName?.[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900">
                          {conv.user.firstName} {conv.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {conv.lastMessage.content}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Zone de chat */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 bg-gray-50 border-b">
                  <h2 className="font-bold text-lg text-gray-900">
                    {selectedConversation.user.firstName} {selectedConversation.user.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.user.role === 'mentor' 
                      ? selectedConversation.user.mentorInfo?.currentJob 
                      : selectedConversation.user.studentInfo?.educationLevel}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
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
              <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-lg font-medium">Sélectionnez une conversation</p>
                  <p className="text-sm text-gray-400 mt-1">Choisissez un contact dans la liste</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
