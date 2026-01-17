import React, { useState, useEffect, useCallback } from 'react';
import { messagesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Messages = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

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

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    try {
      const response = await messagesAPI.getMessages(conversation.user._id);
      setMessages(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await messagesAPI.sendMessage({
        receiverId: selectedConversation.user._id,
        content: newMessage
      });
      
      setMessages([...messages, response.data]);
      socket.sendMessage(selectedConversation.user._id, response.data);
      setNewMessage('');
    } catch (error) {
      console.error('Erreur:', error);
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
            <div className="p-4 bg-white border-b">
              <h2 className="font-bold text-lg">
                {selectedConversation.user.firstName} {selectedConversation.user.lastName}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedConversation.user.role === 'mentor' 
                  ? selectedConversation.user.mentorInfo?.currentJob 
                  : selectedConversation.user.studentInfo?.educationLevel}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`mb-4 flex ${
                    message.senderId._id === user._id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.senderId._id === user._id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
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
    </div>
  );
};

export default Messages;
