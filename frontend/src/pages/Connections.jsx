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
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
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
                  {/* Informations détaillées */}
                  {connection.role === 'mentor' && connection.mentorInfo && (
                    <div className="space-y-3 mb-4">
                      {/* Poste et entreprise */}
                      {connection.mentorInfo.currentJob && (
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {connection.mentorInfo.currentJob}
                            </p>
                            {connection.mentorInfo.company && (
                              <p className="text-sm text-gray-600">
                                {connection.mentorInfo.company}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Secteur */}
                      {connection.mentorInfo.industry && (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Secteur:</span> {connection.mentorInfo.industry}
                          </p>
                        </div>
                      )}

                      {/* Expertise */}
                      {connection.mentorInfo.expertise && connection.mentorInfo.expertise.length > 0 && (
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 mb-1">Expertise:</p>
                            <div className="flex flex-wrap gap-1">
                              {connection.mentorInfo.expertise.slice(0, 3).map((exp, idx) => (
                                <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full">
                                  {exp}
                                </span>
                              ))}
                              {connection.mentorInfo.expertise.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{connection.mentorInfo.expertise.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Années d'expérience */}
                      {connection.mentorInfo.yearsOfExperience && (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{connection.mentorInfo.yearsOfExperience} ans</span> d'expérience
                          </p>
                        </div>
                      )}

                      {/* Bio */}
                      {connection.mentorInfo.bio && (
                        <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {connection.mentorInfo.bio}
                          </p>
                        </div>
                      )}

                      {/* Type de communication préféré */}
                      {connection.mentorInfo.preferredCommunication && connection.mentorInfo.preferredCommunication.length > 0 && (
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 mb-1">Préfère:</p>
                            <div className="flex flex-wrap gap-1">
                              {connection.mentorInfo.preferredCommunication.map((comm, idx) => (
                                <span key={idx} className="text-xs text-gray-600">
                                  {comm === 'messaging' ? 'Messagerie' : comm === 'virtual' ? 'Virtuel' : 'En personne'}
                                  {idx < connection.mentorInfo.preferredCommunication.length - 1 && ', '}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {connection.role === 'student' && connection.studentInfo && (
                    <div className="space-y-3 mb-4">
                      {/* Niveau d'études */}
                      {connection.studentInfo.educationLevel && (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
                          </svg>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Niveau:</span> {connection.studentInfo.educationLevel}
                          </p>
                        </div>
                      )}

                      {/* Programme */}
                      {connection.studentInfo.program && (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Programme:</span> {connection.studentInfo.program}
                          </p>
                        </div>
                      )}

                      {/* Année */}
                      {connection.studentInfo.year && (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Année:</span> {connection.studentInfo.year}
                          </p>
                        </div>
                      )}

                      {/* École */}
                      {connection.studentInfo.school && (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <p className="text-sm text-gray-700">
                            {connection.studentInfo.school}
                          </p>
                        </div>
                      )}

                      {/* Intérêts */}
                      {connection.studentInfo.interests && connection.studentInfo.interests.length > 0 && (
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700 mb-1">Intérêts:</p>
                            <div className="flex flex-wrap gap-1">
                              {connection.studentInfo.interests.slice(0, 3).map((interest, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                  {interest}
                                </span>
                              ))}
                              {connection.studentInfo.interests.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{connection.studentInfo.interests.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Email */}
                  {connection.email && (
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a 
                        href={`mailto:${connection.email}`}
                        className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        {connection.email}
                      </a>
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

      
    </div>
  );
};

export default Connections;
