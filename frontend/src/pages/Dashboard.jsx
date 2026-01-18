import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentsAPI, usersAPI } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Dashboard = () => {
  const { user, isStudent, isMentor } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const appointmentsRes = await appointmentsAPI.getMyAppointments({ upcoming: 'true' });
      setAppointments(appointmentsRes.data);

      // Récupérer les connexions
      const profileRes = await usersAPI.getProfile(user._id);
      setConnections(profileRes.data.connections || []);
      setPendingRequests(profileRes.data.pendingConnections || []);

      if (isStudent) {
        const recsRes = await usersAPI.getRecommendations();
        setRecommendations(recsRes.data.mentors || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  }, [isStudent, user._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Bienvenue, {user?.firstName} !
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition" onClick={() => navigate('/connections')}>
          <h3 className="text-sm font-medium text-gray-500">Connexions acceptées</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{connections.length}</p>
          <p className="text-xs text-gray-500 mt-2">Cliquez pour voir vos contacts</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">
            {isStudent ? 'Mentors connectés' : 'Étudiants aidés'}
          </h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {connections.length}
          </p>
        </div>

        {isMentor && (
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition border-2 border-red-200" onClick={() => navigate('/connection-requests')}>
            <h3 className="text-sm font-medium text-gray-500">Demandes en attente</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{pendingRequests.length}</p>
          </div>
        )}

        {!isMentor && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Profil complété</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">85%</p>
          </div>
        )}
      </div>

      {/* Prochaines sessions */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Prochaines sessions</h2>
        </div>
        <div className="p-6">
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.slice(0, 5).map((apt) => (
                <div key={apt._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">
                      {isStudent 
                        ? `${apt.mentorId.firstName} ${apt.mentorId.lastName}`
                        : `${apt.studentId.firstName} ${apt.studentId.lastName}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(apt.scheduledDate).toLocaleDateString()} à{' '}
                      {new Date(apt.scheduledDate).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    apt.type === 'virtual' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {apt.type === 'virtual' ? 'Virtuel' : 'En personne'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune session planifiée</p>
          )}
        </div>
      </div>

      {/* Recommandations pour étudiants */}
      {isStudent && recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Mentors recommandés pour vous</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((mentor) => (
              <div key={mentor._id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-indigo-600">
                      {mentor.firstName?.[0]}{mentor.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">{mentor.firstName} {mentor.lastName}</h3>
                    <p className="text-sm text-gray-500">{mentor.mentorInfo?.currentJob}</p>
                  </div>
                </div>
                <button className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">
                  Voir le profil
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
