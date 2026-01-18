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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secteur d'activité
                      </label>
                      <input
                        type="text"
                        value={formData.mentorInfo.industry || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mentorInfo: { ...formData.mentorInfo, industry: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ex: Technologie, Finance, Santé..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Biographie
                      </label>
                      <textarea
                        value={formData.mentorInfo.bio || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mentorInfo: { ...formData.mentorInfo, bio: e.target.value }
                          })
                        }
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Parlez de votre parcours et de votre expérience..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Domaines d'expertise (séparés par des virgules)
                      </label>
                      <input
                        type="text"
                        value={formData.mentorInfo.expertise?.join(', ') || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mentorInfo: {
                              ...formData.mentorInfo,
                              expertise: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                            }
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ex: JavaScript, Management, Marketing..."
                      />
                    </div>
                  </>
                )}

                {isStudent && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Niveau d'études
                      </label>
                      <select
                        value={formData.studentInfo.educationLevel || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            studentInfo: { ...formData.studentInfo, educationLevel: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Sélectionnez un niveau</option>
                        <option value="Secondaire">Secondaire</option>
                        <option value="Cégep">Cégep</option>
                        <option value="Université - 1er cycle">Université - 1er cycle</option>
                        <option value="Université - 2e cycle">Université - 2e cycle</option>
                        <option value="Université - 3e cycle">Université - 3e cycle</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Centres d'intérêt (séparés par des virgules)
                      </label>
                      <input
                        type="text"
                        value={formData.studentInfo.interests?.join(', ') || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            studentInfo: {
                              ...formData.studentInfo,
                              interests: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                            }
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ex: Programmation, Design, Entrepreneuriat..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Objectifs
                      </label>
                      <textarea
                        value={formData.studentInfo.goals || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            studentInfo: { ...formData.studentInfo, goals: e.target.value }
                          })
                        }
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Décrivez vos objectifs professionnels et académiques..."
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
                      <h3 className="text-sm font-medium text-gray-500">Secteur d'activité</h3>
                      <p className="mt-1">{user?.mentorInfo?.industry || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Biographie</h3>
                      <p className="mt-1">{user?.mentorInfo?.bio || 'Non renseignée'}</p>
                    </div>
                    {user?.mentorInfo?.expertise && user.mentorInfo.expertise.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Domaines d'expertise</h3>
                        <div className="flex flex-wrap gap-2">
                          {user.mentorInfo.expertise.map((exp, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                            >
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
                    {user?.studentInfo?.interests && user.studentInfo.interests.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Centres d'intérêt</h3>
                        <div className="flex flex-wrap gap-2">
                          {user.studentInfo.interests.map((interest, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
