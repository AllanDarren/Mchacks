import React, { useState, useEffect } from 'react';
import { internshipsAPI } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Toast from '../components/Common/Toast';
import { useAuth } from '../contexts/AuthContext';

// Hardcoded options for job titles
const JOB_TITLES = [
  'Développeur Full Stack',
  'Développeur Frontend',
  'Développeur Backend',
  'Designer UX/UI',
  'Designer Graphique',
  'Chef de Projet',
  'Product Manager',
  'Data Scientist',
  'Data Analyst',
  'Marketing Digital',
  'Chargé de Communication',
  'Ressources Humaines',
  'Comptable',
  'Analyste Financier',
  'Consultant',
  'Ingénieur Logiciel',
  'DevOps Engineer',
  'Architecte Cloud',
  'Cybersécurité',
  'Business Analyst'
];

// Hardcoded options for organizations
const ORGANIZATIONS = [
  'Google',
  'Microsoft',
  'Apple',
  'Amazon',
  'Meta',
  'Netflix',
  'Shopify',
  'Spotify',
  'Adobe',
  'Salesforce',
  'IBM',
  'Ubisoft',
  'Bombardier',
  'Air Canada',
  'Banque Nationale',
  'Desjardins',
  'CGI',
  'Bell',
  'Rogers',
  'Hydro-Québec'
];

const Internships = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Autocomplete states
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  
  // Search filter autocomplete states
  const [searchTitleSuggestions, setSearchTitleSuggestions] = useState([]);
  const [searchCompanySuggestions, setSearchCompanySuggestions] = useState([]);
  const [showSearchTitleDropdown, setShowSearchTitleDropdown] = useState(false);
  const [showSearchCompanyDropdown, setShowSearchCompanyDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    duration: '1 jour',
    location: '',
    industry: '',
    availableDates: '',
    maxStudents: 1
  });
  
  // Modal states
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [applicationAnswers, setApplicationAnswers] = useState({
    motivation: '',
    availability: '',
    expectations: ''
  });
  
  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    fetchInternships();
  }, [searchTerm, organizationFilter]);

  const fetchInternships = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      const response = await internshipsAPI.getInternships(params);
      
      let filteredInternships = response.data.internships;
      
      // Filter by organization if specified
      if (organizationFilter) {
        filteredInternships = filteredInternships.filter(internship =>
          internship.company.toLowerCase().includes(organizationFilter.toLowerCase())
        );
      }
      
      setInternships(filteredInternships);
    } catch (error) {
      console.error('Erreur:', error);
    }
    setLoading(false);
  };

  const openApplicantsModal = (internship) => {
    setSelectedInternship(internship);
    setShowApplicantsModal(true);
  };

  const openDetailsModal = (internship) => {
    setSelectedInternship(internship);
    setShowDetailsModal(true);
  };

  const closeModals = () => {
    setShowApplicantsModal(false);
    setShowDetailsModal(false);
    setSelectedInternship(null);
    setApplicationAnswers({
      motivation: '',
      availability: '',
      expectations: ''
    });
  };

  const applyToInternship = async () => {
    if (!selectedInternship) return;
    
    try {
      await internshipsAPI.applyToInternship(selectedInternship._id);
      showToast('Candidature envoyée avec succès!', 'success');
      closeModals();
      fetchInternships();
    } catch (error) {
      showToast(error.response?.data?.message || 'Erreur lors de la candidature', 'error');
    }
  };

  const handleStatusChange = async (studentId, newStatus) => {
    if (!selectedInternship) return;
    
    try {
      await internshipsAPI.manageApplication(selectedInternship._id, studentId, newStatus);
      showToast('Statut mis à jour avec succès!', 'success');
      
      // Update the selected internship with new status
      const updatedApplicants = selectedInternship.applicants.map(applicant =>
        applicant.studentId._id === studentId
          ? { ...applicant, status: newStatus }
          : applicant
      );
      setSelectedInternship({
        ...selectedInternship,
        applicants: updatedApplicants
      });
      
      // Refresh the internships list
      fetchInternships();
    } catch (error) {
      showToast(error.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Handle autocomplete for title
    if (name === 'title') {
      const filtered = value.length > 0 
        ? JOB_TITLES.filter(title => title.toLowerCase().includes(value.toLowerCase()))
        : JOB_TITLES;
      setTitleSuggestions(filtered);
      setShowTitleDropdown(filtered.length > 0);
    }
    
    // Handle autocomplete for company
    if (name === 'company') {
      const filtered = value.length > 0
        ? ORGANIZATIONS.filter(org => org.toLowerCase().includes(value.toLowerCase()))
        : ORGANIZATIONS;
      setCompanySuggestions(filtered);
      setShowCompanyDropdown(filtered.length > 0);
    }
  };

  const handleSearchTermChange = (value) => {
    setSearchTerm(value);
    const filtered = value.length > 0
      ? JOB_TITLES.filter(title => title.toLowerCase().includes(value.toLowerCase()))
      : JOB_TITLES;
    setSearchTitleSuggestions(filtered);
    setShowSearchTitleDropdown(filtered.length > 0);
  };

  const handleOrganizationFilterChange = (value) => {
    setOrganizationFilter(value);
    const filtered = value.length > 0
      ? ORGANIZATIONS.filter(org => org.toLowerCase().includes(value.toLowerCase()))
      : ORGANIZATIONS;
    setSearchCompanySuggestions(filtered);
    setShowSearchCompanyDropdown(filtered.length > 0);
  };

  const handleCreateInternship = async (e) => {
    e.preventDefault();
    try {
      const internshipData = {
        ...formData,
        availableDates: formData.availableDates.split(',').map(date => date.trim())
      };
      
      await internshipsAPI.createInternship(internshipData);
      showToast('Offre de stage créée avec succès!', 'success');
      setShowCreateForm(false);
      setFormData({
        title: '',
        company: '',
        description: '',
        duration: '1 jour',
        location: '',
        industry: '',
        availableDates: '',
        maxStudents: 1
      });
      fetchInternships();
    } catch (error) {
      showToast(error.response?.data?.message || 'Erreur lors de la création', 'error');
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Stages d'un jour</h1>
        {user?.role === 'mentor' && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
          >
            {showCreateForm ? 'Annuler' : '+ Créer une offre'}
          </button>
        )}
      </div>

      {/* Create Internship Form (Mentors Only) */}
      {showCreateForm && user?.role === 'mentor' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Nouvelle offre de stage</h2>
          <form onSubmit={handleCreateInternship} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du poste *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      const value = e.target.value;
                      const filtered = value.length > 0
                        ? JOB_TITLES.filter(title => title.toLowerCase().includes(value.toLowerCase()))
                        : JOB_TITLES;
                      setTitleSuggestions(filtered);
                      setShowTitleDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowTitleDropdown(false), 300)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="ex: Développeur Full Stack"
                    autoComplete="off"
                  />
                  {showTitleDropdown && titleSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {titleSuggestions.map((title, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, title }));
                            setShowTitleDropdown(false);
                          }}
                          className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                        >
                          {title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organisation *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    onFocus={(e) => {
                      const value = e.target.value;
                      const filtered = value.length > 0
                        ? ORGANIZATIONS.filter(org => org.toLowerCase().includes(value.toLowerCase()))
                        : ORGANIZATIONS;
                      setCompanySuggestions(filtered);
                      setShowCompanyDropdown(true);
                    }}
                    onBlur={() => setTimeout(() => setShowCompanyDropdown(false), 300)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Nom de l'entreprise"
                    autoComplete="off"
                  />
                  {showCompanyDropdown && companySuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {companySuggestions.map((company, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, company }));
                            setShowCompanyDropdown(false);
                          }}
                          className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                        >
                          {company}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secteur *
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="ex: Technologie, Finance, Santé"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localisation *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ville, Pays"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dates disponibles *
                </label>
                <input
                  type="text"
                  name="availableDates"
                  value={formData.availableDates}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="ex: 2026-02-15, 2026-02-22"
                />
                <p className="text-xs text-gray-500 mt-1">Séparez les dates par des virgules</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Places disponibles
                </label>
                <input
                  type="number"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Décrivez l'expérience d'observation, les tâches, ce que l'étudiant apprendra..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
            >
              Créer l'offre
            </button>
          </form>
        </div>
      )}

      {/* Search Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poste
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchTermChange(e.target.value)}
                onFocus={(e) => {
                  const value = e.target.value;
                  const filtered = value.length > 0
                    ? JOB_TITLES.filter(title => title.toLowerCase().includes(value.toLowerCase()))
                    : JOB_TITLES;
                  setSearchTitleSuggestions(filtered);
                  setShowSearchTitleDropdown(true);
                }}
                onBlur={() => setTimeout(() => setShowSearchTitleDropdown(false), 300)}
                placeholder="ex: Développeur, Marketing, Designer..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                autoComplete="off"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearchTermChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  ✕
                </button>
              )}
              {showSearchTitleDropdown && searchTitleSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchTitleSuggestions.map((title, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSearchTerm(title);
                        setShowSearchTitleDropdown(false);
                      }}
                      className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                    >
                      {title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organisation
            </label>
            <div className="relative">
              <input
                type="text"
                value={organizationFilter}
                onChange={(e) => handleOrganizationFilterChange(e.target.value)}
                onFocus={(e) => {
                  const value = e.target.value;
                  const filtered = value.length > 0
                    ? ORGANIZATIONS.filter(org => org.toLowerCase().includes(value.toLowerCase()))
                    : ORGANIZATIONS;
                  setSearchCompanySuggestions(filtered);
                  setShowSearchCompanyDropdown(true);
                }}
                onBlur={() => setTimeout(() => setShowSearchCompanyDropdown(false), 300)}
                placeholder="Nom de l'entreprise..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                autoComplete="off"
              />
              {organizationFilter && (
                <button
                  onClick={() => handleOrganizationFilterChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  type="button"
                >
                  ✕
                </button>
              )}
              {showSearchCompanyDropdown && searchCompanySuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchCompanySuggestions.map((company, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setOrganizationFilter(company);
                        setShowSearchCompanyDropdown(false);
                      }}
                      className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                    >
                      {company}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Internships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internships.map((internship) => (
          <div key={internship._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold text-gray-900">{internship.title}</h3>
              <span className="inline-block px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                {internship.industry}
              </span>
            </div>
            
            <p className="text-gray-600 font-medium mb-3">{internship.company}</p>
            
            <p className="text-sm text-gray-700 mb-4 line-clamp-3">{internship.description}</p>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <p>📍 {internship.location}</p>
              <p>⏱️ {internship.duration}</p>
              <p>👥 {internship.maxStudents} place(s) disponible(s)</p>
              {internship.availableDates && internship.availableDates.length > 0 && (
                <p>📅 {new Date(internship.availableDates[0]).toLocaleDateString('fr-FR')}</p>
              )}
            </div>

            {user?.role === 'student' && (
              <button
                onClick={() => openDetailsModal(internship)}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Postuler
              </button>
            )}
            
            {user?.role === 'mentor' && internship.mentorId?._id === user._id && (
              <button
                onClick={() => openApplicantsModal(internship)}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>Infos</span>
                {internship.applicants && internship.applicants.length > 0 && (
                  <span className="bg-white text-green-600 px-2 py-1 rounded-full text-xs font-bold">
                    {internship.applicants.length}
                  </span>
                )}
              </button>
            )}
          </div>
        ))}

        {internships.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">
            <p className="text-lg">Aucun stage d'un jour disponible pour le moment</p>
          </div>
        )}
      </div>

      {/* Applicants Info Modal (Mentor) */}
      {showApplicantsModal && selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Candidatures - {selectedInternship.title}</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 text-2xl">
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600"><strong>Entreprise:</strong> {selectedInternship.company}</p>
                <p className="text-gray-600"><strong>Localisation:</strong> {selectedInternship.location}</p>
                <p className="text-gray-600 mt-2">{selectedInternship.description}</p>
              </div>

              <h3 className="text-xl font-bold mb-4">
                Candidats ({selectedInternship.applicants?.length || 0})
              </h3>

              {selectedInternship.applicants && selectedInternship.applicants.length > 0 ? (
                <div className="space-y-4">
                  {selectedInternship.applicants.map((applicant, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-lg">
                            {applicant.studentId?.firstName} {applicant.studentId?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{applicant.studentId?.email}</p>
                          {applicant.studentId?.studentInfo?.school && (
                            <p className="text-sm text-gray-600">🎓 {applicant.studentId.studentInfo.school}</p>
                          )}
                          {applicant.studentId?.studentInfo?.fieldOfStudy && (
                            <p className="text-sm text-gray-600">📚 {applicant.studentId.studentInfo.fieldOfStudy}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Candidature envoyée le {new Date(applicant.appliedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        
                        {/* Status selector dropdown */}
                        <div className="flex-shrink-0">
                          <label className="block text-xs text-gray-600 mb-1">Statut:</label>
                          <select
                            value={applicant.status}
                            onChange={(e) => handleStatusChange(applicant.studentId._id, e.target.value)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium border-2 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500                            
                            `
                          }
                          >
                            <option value="pending">  En attente</option>
                            <option value="accepted">✓ Accepté</option>
                            <option value="rejected">✕ Refusé</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune candidature pour le moment</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Internship Details Modal (Student) */}
      {showDetailsModal && selectedInternship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedInternship.title}</h2>
                <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 text-2xl">
                  ✕
                </button>
              </div>

              <div className="mb-6 space-y-3">
                <p className="text-lg font-semibold text-indigo-600">{selectedInternship.company}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    {selectedInternship.industry}
                  </span>
                </div>
                <div className="space-y-2 text-gray-700">
                  <p>📍 <strong>Localisation:</strong> {selectedInternship.location}</p>
                  <p>⏱️ <strong>Durée:</strong> {selectedInternship.duration}</p>
                  <p>👥 <strong>Places disponibles:</strong> {selectedInternship.maxStudents}</p>
                  {selectedInternship.availableDates && selectedInternship.availableDates.length > 0 && (
                    <div>
                      <p><strong>📅 Dates disponibles:</strong></p>
                      <ul className="ml-6 list-disc">
                        {selectedInternship.availableDates.map((date, index) => (
                          <li key={index}>{new Date(date).toLocaleDateString('fr-FR')}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedInternship.description}</p>
              </div>

              <div className="mb-6 space-y-4">
                <h3 className="text-lg font-bold">Questions de candidature</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pourquoi souhaitez-vous faire ce stage d'observation? *
                  </label>
                  <textarea
                    value={applicationAnswers.motivation}
                    onChange={(e) => setApplicationAnswers(prev => ({ ...prev, motivation: e.target.value }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Expliquez vos motivations..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Avez-vous del'expérience dans le domaine choisi? *
                  </label>
                  <textarea
                    value={applicationAnswers.availability}
                    onChange={(e) => setApplicationAnswers(prev => ({ ...prev, availability: e.target.value }))}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Précisez vos disponibilités..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qu'espérez-vous apprendre durant ce stage? *
                  </label>
                  <textarea
                    value={applicationAnswers.expectations}
                    onChange={(e) => setApplicationAnswers(prev => ({ ...prev, expectations: e.target.value }))}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Vos attentes et objectifs d'apprentissage..."
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeModals}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={applyToInternship}
                  disabled={!applicationAnswers.motivation || !applicationAnswers.availability || !applicationAnswers.expectations}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  Envoyer la candidature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Internships;
