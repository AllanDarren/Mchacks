import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';

const Profile = () => {
  const { user, updateUser, isStudent, isMentor } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    studentInfo: user?.studentInfo || {},
    mentorInfo: user?.mentorInfo || {}
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await usersAPI.updateProfile(formData);
      updateUser(response.data);
      setEditing(false);
      alert('Profil mis à jour avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
          >
            {editing ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-indigo-600">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600">
                  {user?.role === 'student' ? 'Étudiant' : 'Mentor'}
                </p>
              </div>
            </div>

            {editing ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {isMentor && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Poste actuel
                      </label>
                      <input
                        type="text"
                        value={formData.mentorInfo.currentJob || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mentorInfo: { ...formData.mentorInfo, currentJob: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        value={formData.mentorInfo.company || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mentorInfo: { ...formData.mentorInfo, company: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
                >
                  Sauvegarder
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1">{user?.email}</p>
                </div>

                {isMentor && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Poste actuel</h3>
                      <p className="mt-1">{user?.mentorInfo?.currentJob || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Entreprise</h3>
                      <p className="mt-1">{user?.mentorInfo?.company || 'Non renseignée'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Biographie</h3>
                      <p className="mt-1">{user?.mentorInfo?.bio || 'Non renseignée'}</p>
                    </div>
                  </>
                )}

                {isStudent && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Niveau d'études</h3>
                      <p className="mt-1">
                        {user?.studentInfo?.educationLevel || 'Non renseigné'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Objectifs</h3>
                      <p className="mt-1">{user?.studentInfo?.goals || 'Non renseignés'}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
