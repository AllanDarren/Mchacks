import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const ConnectionRequests = () => {
  const { user, isMentor } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    if (isMentor) {
      fetchRequests();
    }
  }, [isMentor]);

  const fetchRequests = async () => {
    try {
      // Obtenir le profil du mentor avec les demandes en attente
      const response = await usersAPI.getProfile(user._id);
      
      if (response.data.pendingConnections && response.data.pendingConnections.length > 0) {
        // Récupérer les détails de chaque étudiant
        const studentsDetails = await Promise.all(
          response.data.pendingConnections.map(studentId => 
            usersAPI.getProfile(studentId)
          )
        );
        
        // Filtrer les étudiants qui ne sont pas déjà dans les connexions
        const myConnections = response.data.connections || [];
        const filteredRequests = studentsDetails
          .map(res => res.data)
          .filter(student => !myConnections.includes(student._id));
        
        setRequests(filteredRequests);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  const handleAccept = async (studentId) => {
    setAcceptingId(studentId);
    try {
      await usersAPI.acceptConnection(studentId);
      alert('Connexion acceptée !');
      // Retirer la demande de la liste
      setRequests(requests.filter(r => r._id !== studentId));
    } catch (error) {
      console.error('Erreur complète:', error);
      console.error('Réponse du serveur:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
      alert(`Erreur lors de l'acceptation: ${errorMessage}`);
    }
    setAcceptingId(null);
  };

  const handleReject = async (studentId) => {
    try {
      // Ici, vous pourriez implémenter une fonction de rejet
      setRequests(requests.filter(r => r._id !== studentId));
      alert('Demande rejetée');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (!isMentor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Cette page est réservée aux mentors
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Demandes de Connexion</h1>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">
            Vous n'avez aucune demande de connexion en attente
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y">
          {requests.map((student) => (
            <div key={student._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-indigo-600">
                    {student.firstName?.[0]}{student.lastName?.[0]}
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{student.email}</p>
                  
                  {student.studentInfo?.educationLevel && (
                    <p className="text-sm text-gray-600 mt-1">
                      📚 {student.studentInfo.educationLevel}
                    </p>
                  )}
                  
                  {student.studentInfo?.interests && student.studentInfo.interests.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {student.studentInfo.interests.slice(0, 3).map((interest, idx) => (
                        <span 
                          key={idx}
                          className="inline-block px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleAccept(student._id)}
                  disabled={acceptingId === student._id}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50"
                >
                  {acceptingId === student._id ? 'Acceptation...' : 'Accepter'}
                </button>
                <button
                  onClick={() => handleReject(student._id)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition"
                >
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {requests.length > 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            💡 <strong>{requests.length}</strong> demande(s) de connexion en attente
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectionRequests;
