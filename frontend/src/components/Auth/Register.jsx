import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    firstName: '',
    lastName: '',
    // Student fields
    studentInfo: {
      educationLevel: '',
      interests: [],
      goals: '',
      age: ''
    },
    // Mentor fields
    mentorInfo: {
      currentJob: '',
      company: '',
      industry: '',
      expertise: [],
      bio: '',
      preferredCommunication: []
    }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtherCompany, setShowOtherCompany] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleArrayInput = (field, value, role) => {
    if (role === 'student') {
      setFormData({
        ...formData,
        studentInfo: {
          ...formData.studentInfo,
          [field]: value.split(',').map(item => item.trim())
        }
      });
    } else {
      setFormData({
        ...formData,
        mentorInfo: {
          ...formData.mentorInfo,
          [field]: value.split(',').map(item => item.trim())
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    const result = await register(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.role) {
        setError('Please select a role (Student or Mentor)');
        return;
      }
      if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must contain at least 6 characters');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign Up
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your account - Step {step} of 2
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, role: 'student' });
                      setError('');
                    }}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.role === 'student'
                        ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                        : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">🎓</span>
                    <p className="font-medium mt-2">Student</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, role: 'mentor' });
                      setError('');
                    }}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.role === 'mentor'
                        ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                        : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">👔</span>
                    <p className="font-medium mt-2">Mentor</p>

                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Your first name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Your last name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.password}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Repeat your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && formData.role === 'student' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.studentInfo.educationLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studentInfo: { ...formData.studentInfo, educationLevel: e.target.value }
                    })
                  }
                >
                  <option value="">Select...</option>
                  <option value="Secondaire">High School</option>
                  <option value="Cégep">College (CEGEP)</option>
                  <option value="Université - Baccalauréat">University - Bachelor's</option>
                  <option value="Université - Maîtrise">University - Master's</option>
                  <option value="Université - Doctorat">University - Doctorate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Areas of Interest (comma separated)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g.: Technology, Marketing, Finance"
                  onChange={(e) => handleArrayInput('interests', e.target.value, 'student')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objectifs professionnels</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  value={formData.studentInfo.goals}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studentInfo: { ...formData.studentInfo, goals: e.target.value }
                    })
                  }
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Inscription...' : 'S\'inscrire'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && formData.role === 'mentor' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Position</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.mentorInfo.currentJob}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mentorInfo: { ...formData.mentorInfo, currentJob: e.target.value }
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                <select
                  name="company"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.mentorInfo.company}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      mentorInfo: { ...formData.mentorInfo, company: e.target.value }
                    });
                    setShowOtherCompany(e.target.value === 'Autre');
                  }}
                  required
                >
                  <option value="">Select a company</option>
                  <option value="Holoray">Holoray</option>
                  <option value="Athena AI">Athena AI</option>
                  <option value="Gumloop">Gumloop</option>
                  <option value="Banque Nationale">Banque Nationale</option>
                  <option value="Bassilchat">Bassilchat</option>
                  <option value="Dobson Centre">Dobson Centre</option>
                  <option value="Desjardins">Desjardins</option>
                  <option value="Finitech">Finitech</option>
                  <option value="Backboard.io">Backboard.io</option>
                  <option value="Sourcebot">Sourcebot</option>
                  <option value="Nova">Nova</option>
                  <option value="Tail'ed">Tail'ed</option>
                  <option value="Aéum SSMU">Aéum SSMU</option>
                  <option value="Pure">Pure</option>
                  <option value="Google">Google</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Meta">Meta</option>
                  <option value="Apple">Apple</option>
                  <option value="IBM">IBM</option>
                  <option value="Salesforce">Salesforce</option>
                  <option value="Shopify">Shopify</option>
                  <option value="Deloitte">Deloitte</option>
                  <option value="PwC">PwC</option>
                  <option value="EY">EY</option>
                  <option value="KPMG">KPMG</option>
                  <option value="Accenture">Accenture</option>
                  <option value="Capgemini">Capgemini</option>
                  <option value="CGI">CGI</option>
                  <option value="Ubisoft">Ubisoft</option>
                  <option value="SAP">SAP</option>
                  <option value="Oracle">Oracle</option>
                  <option value="SNC-Lavalin">SNC-Lavalin</option>
                  <option value="Air Canada">Air Canada</option>
                  <option value="Bombardier">Bombardier</option>
                  <option value="Bell">Bell</option>
                  <option value="Rogers">Rogers</option>
                  <option value="Telus">Telus</option>
                  <option value="National Bank">National Bank</option>
                  <option value="TD">TD</option>
                  <option value="RBC">RBC</option>
                  <option value="Scotiabank">Scotiabank</option>
                  <option value="BMO">BMO</option>
                  <option value="L'Oréal">L'Oréal</option>
                  <option value="Danone">Danone</option>
                  <option value="Nestlé">Nestlé</option>
                  <option value="PepsiCo">PepsiCo</option>
                  <option value="Unilever">Unilever</option>
                  <option value="Morgan Stanley">Morgan Stanley</option>
                  <option value="Autre">Other</option>
                </select>
                {showOtherCompany && (
                  <input
                    type="text"
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Company name"
                    value={formData.mentorInfo.company !== 'Autre' ? formData.mentorInfo.company : ''}
                    onChange={e => setFormData({
                      ...formData,
                      mentorInfo: { ...formData.mentorInfo, company: e.target.value }
                    })}
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.mentorInfo.industry}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mentorInfo: { ...formData.mentorInfo, industry: e.target.value }
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Areas of Expertise (comma separated)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g.: Web Development, Project Management"
                  onChange={(e) => handleArrayInput('expertise', e.target.value, 'mentor')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  value={formData.mentorInfo.bio}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      mentorInfo: { ...formData.mentorInfo, bio: e.target.value }
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moyens de communication favoris *</label>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox text-indigo-600"
                      checked={formData.mentorInfo.preferredCommunication?.includes('messaging')}
                      onChange={e => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData,
                          mentorInfo: {
                            ...formData.mentorInfo,
                            preferredCommunication: checked
                              ? [...(formData.mentorInfo.preferredCommunication || []), 'messaging']
                              : (formData.mentorInfo.preferredCommunication || []).filter(val => val !== 'messaging')
                          }
                        });
                      }}
                    />
                    <span className="ml-2">Messaging</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox text-indigo-600"
                      checked={formData.mentorInfo.preferredCommunication?.includes('virtual')}
                      onChange={e => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData,
                          mentorInfo: {
                            ...formData.mentorInfo,
                            preferredCommunication: checked
                              ? [...(formData.mentorInfo.preferredCommunication || []), 'virtual']
                              : (formData.mentorInfo.preferredCommunication || []).filter(val => val !== 'virtual')
                          }
                        });
                      }}
                    />
                    <span className="ml-2">Virtual Meeting</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox text-indigo-600"
                      checked={formData.mentorInfo.preferredCommunication?.includes('in-person')}
                      onChange={e => {
                        const checked = e.target.checked;
                        setFormData({
                          ...formData,
                          mentorInfo: {
                            ...formData.mentorInfo,
                            preferredCommunication: checked
                              ? [...(formData.mentorInfo.preferredCommunication || []), 'in-person']
                              : (formData.mentorInfo.preferredCommunication || []).filter(val => val !== 'in-person')
                          }
                        });
                      }}
                    />
                    <span className="ml-2">In-person</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
