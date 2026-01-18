import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, messagesAPI } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Connections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    fetchConnections();
    fetchConversations();
  }, []);

  const fetchConnections = async () => {
    try {
      // Récupérer le profil de l'utilisateur qui contient la liste des connexions
      const response = await usersAPI.getProfile(user._id);
      
      if (response.data.connections && response.data.connections.length > 0) {
        // Récupérer les détails de chaque connexion
        const connectionDetails = await Promise.all(
          response.data.connections.map(connectionId => 
            usersAPI.getProfile(connectionId)
          )
        );
        setConnections(connectionDetails.map(res => res.data));
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await messagesAPI.getConversations();
      // Créer une map pour un accès rapide aux derniers messages
      const conversationMap = {};
      response.data.forEach(conv => {
        conversationMap[conv.user._id] = conv;
      });
      setConversations(conversationMap);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleOpenChat = (connectionId) => {
    navigate(`/messages?contact=${connectionId}`);
  };

  const getLastMessage = (connectionId) => {
    const conv = conversations[connectionId];
    if (!conv) return null;
    return conv.lastMessage;
  };

  const getUnreadCount = (connectionId) => {
    const conv = conversations[connectionId];
    return conv ? conv.unreadCount : 0;
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Connexions</h1>
        <p className="text-gray-600 mt-2">
          Vous avez <span className="font-semibold text-indigo-600">{connections.length}</span> connexion{connections.length > 1 ? 's' : ''}
        </p>
      </div>

      {connections.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune connexion pour le moment</h2>
          <p className="text-gray-600 mb-6">
            Allez dans "Découvrir" pour trouver des mentors et envoyer des demandes de connexion !
          </p>
          <button
            onClick={() => navigate('/discover')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
          >
            Découvrir des mentors
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection) => {
            const lastMessage = getLastMessage(connection._id);
            const unreadCount = getUnreadCount(connection._id);

            return (
              <div
                key={connection._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* En-tête avec avatar */}
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-indigo-600">
                        {connection.firstName?.[0]}{connection.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {connection.firstName} {connection.lastName}
                      </h3>
                      <p className="text-indigo-100 text-sm">
                        {connection.role === 'mentor' ? ' Mentor' : ' Étudiant'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-6">
                  {/* Info professionnel/étudiant */}
                  {connection.role === 'mentor' && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        {connection.mentorInfo?.currentJob && (
                          <>
                            <span className="font-medium">{connection.mentorInfo.currentJob}</span>
                            {connection.mentorInfo.company && (
                              <span> @ {connection.mentorInfo.company}</span>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  {connection.role === 'student' && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">
                        {connection.studentInfo?.educationLevel && (
                          <>Niveau: <span className="font-medium">{connection.studentInfo.educationLevel}</span></>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Dernier message */}
                  {lastMessage ? (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Dernier message:</p>
                      <p className="text-sm text-gray-700 truncate">
                        {lastMessage.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(lastMessage.timestamp).toLocaleDateString()} 
                        {' à '} 
                        {new Date(lastMessage.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 italic">
                        Aucun message pour le moment - Démarrez une conversation !
                      </p>
                    </div>
                  )}

                  {/* Messages non lus */}
                  {unreadCount > 0 && (
                    <div className="mb-4 flex items-center gap-2">
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        {unreadCount} message{unreadCount > 1 ? 's' : ''} non lu{unreadCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Bouton de messagerie */}
                  <div className="flex gap-2">
                    {connection.role === 'mentor' && (
                      <button
                        onClick={() => navigate(`/book-availability/${connection._id}`)}
                        className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <span>📅</span>
                        <span>Voir les disponibilités</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenChat(connection._id)}
                      className={`${connection.role === 'mentor' ? 'flex-1' : 'w-full'} py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2`}
                    >
                      <span>Envoyer un message</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info utile */}
      {connections.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            💡 Cliquez sur une connexion pour accéder à la messagerie et communiquer en temps réel !
          </p>
        </div>
      )}
    </div>
  );
};

export default Connections;
