import React, { useState, useEffect } from 'react';
import { internshipsAPI } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      const response = await internshipsAPI.getInternships({});
      setInternships(response.data.internships);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  const applyToInternship = async (internshipId) => {
    try {
      await internshipsAPI.applyToInternship(internshipId);
      alert('Candidature envoyée avec succès!');
      fetchInternships();
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la candidature');
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mini-stages</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internships.map((internship) => (
          <div key={internship._id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-2">{internship.title}</h3>
            <p className="text-gray-600 mb-2">{internship.company}</p>
            
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                {internship.industry}
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-4">{internship.description}</p>

            <div className="text-sm text-gray-600 mb-4">
              <p>📍 {internship.location}</p>
              <p>⏱️ {internship.duration}</p>
            </div>

            <button
              onClick={() => applyToInternship(internship._id)}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
            >
              Postuler
            </button>
          </div>
        ))}

        {internships.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">
            Aucun stage disponible pour le moment
          </div>
        )}
      </div>
    </div>
  );
};

export default Internships;
