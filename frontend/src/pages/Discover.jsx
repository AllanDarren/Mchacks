import React, { useState, useEffect, useCallback } from 'react';
import { usersAPI } from '../services/api';
import MentorCard from '../components/Discovery/MentorCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Discover = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    industry: '',
    expertise: '',
    communicationType: ''
  });

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await usersAPI.searchMentors(filters);
      setMentors(response.data.mentors);
    } catch (error) {
      console.error('Erreur lors de la récupération des mentors:', error);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const handleConnect = async (mentorId) => {
    try {
      await usersAPI.requestConnection(mentorId);
      alert('Demande de connexion envoyée!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'envoi de la demande');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Découvrir des mentors</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Rechercher..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          value={filters.communicationType}
          onChange={(e) => setFilters({ ...filters, communicationType: e.target.value })}
        >
          <option value="">Type de communication</option>
          <option value="messaging">Messagerie</option>
          <option value="virtual">Rencontre virtuelle</option>
          <option value="in-person">En personne</option>
        </select>

        <input
          type="text"
          placeholder="Secteur d'activité"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          value={filters.industry}
          onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
        />

        <input
          type="text"
          placeholder="Expertise"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          value={filters.expertise}
          onChange={(e) => setFilters({ ...filters, expertise: e.target.value })}
        />
      </div>

      {loading ? (
        <LoadingSpinner size="large" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor) => (
            <MentorCard key={mentor._id} mentor={mentor} onConnect={handleConnect} />
          ))}
          {mentors.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12">
              Aucun mentor trouvé avec ces critères
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Discover;
