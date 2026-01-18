import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import MentorCard from '../components/Discovery/MentorCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Dialog from '../components/Common/Dialog';

const Discover = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [filters, setFilters] = useState({
    search: '',
    industry: '',
    expertise: '',
    communicationType: ''
  });

  const fetchMyConnections = useCallback(async () => {
    try {
      const response = await usersAPI.getProfile(user._id);
      setMyConnections(response.data.connections || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des connexions:', error);
    }
  }, [user._id]);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await usersAPI.searchMentors(filters);
      // Filtrer les mentors déjà connectés
      const filteredMentors = response.data.mentors.filter(
        mentor => !myConnections.includes(mentor._id)
      );
      setMentors(filteredMentors);
    } catch (error) {
      console.error('Erreur lors de la récupération des mentors:', error);
    }
    setLoading(false);
  }, [filters, myConnections]);

  useEffect(() => {
    fetchMyConnections();
  }, [fetchMyConnections]);

  useEffect(() => {
    if (myConnections.length >= 0) {
      fetchMentors();
    }
  }, [fetchMentors, myConnections]);

  const handleConnect = async (mentorId) => {
    try {
      await usersAPI.requestConnection(mentorId);
      setDialog({ isOpen: true, title: 'Success', message: 'Connection request sent!', type: 'success' });
      // Refresh connections and mentors
      await fetchMyConnections();
      await fetchMentors();
    } catch (error) {
      console.error('Error:', error);
      setDialog({ isOpen: true, title: 'Error', message: 'Error sending request', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Mentors</h1>
      <p className="text-gray-600 mb-6">Find the ideal mentor for your needs</p>

      {/* Section de filtres améliorée */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Filters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recherche générale */}
          {/* <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recherche par nom
            </label>
            <input
              type="text"
              placeholder="Nom, prénom..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div> */}

          {/* Type de communication */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type of communication
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filters.communicationType}
              onChange={(e) => setFilters({ ...filters, communicationType: e.target.value })}
            >
              <option value="">All types</option>
              <option value="messaging">Messaging</option>
              <option value="virtual">Virtual Meeting</option>
              <option value="in-person">In-person</option>
            </select>
          </div>

          {/* Bouton reset */}


          {/* Secteur d'activité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <input
              type="text"
              placeholder="Ex: Finance, Technology..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
            />
          </div>

          {/* Expertise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expertise
            </label>
            <input
              type="text"
              placeholder="Ex: Marketing, App Dev..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filters.expertise}
              onChange={(e) => setFilters({ ...filters, expertise: e.target.value })}
            />
          </div>
                    <div className="flex items-end">
            <button
              onClick={() => setFilters({ search: '', industry: '', expertise: '', communicationType: '' })}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </div>
        </div>

        {/* Filtres actifs */}
        {(filters.search || filters.industry || filters.expertise || filters.communicationType) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Active filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                  Name: {filters.search}
                </span>
              )}
              {filters.industry && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                  Industry: {filters.industry}
                </span>
              )}
              {filters.expertise && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                  Expertise: {filters.expertise}
                </span>
              )}
              {filters.communicationType && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full">
                  Type: {filters.communicationType === 'messaging' ? 'Messaging' : filters.communicationType === 'virtual' ? 'Virtual' : 'In-person'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Résultats */}
      <div className="mb-4">
        <p className="text-gray-600">
          {loading ? 'Loading...' : `${mentors.length} mentor${mentors.length > 1 ? 's' : ''} found`}
        </p>
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
              No mentors found with these criteria
            </div>
          )}
        </div>
      )}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />
    </div>
  );
};

export default Discover;
