import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me')
};

// Users API
export const usersAPI = {
  getProfile: (userId) => api.get(`/users/profile/${userId}`),
  updateProfile: (userData) => api.put('/users/profile', userData),
  searchMentors: (params) => api.get('/users/mentors', { params }),
  requestConnection: (mentorId) => api.post(`/users/connect/${mentorId}`),
  acceptConnection: (studentId) => api.put(`/users/accept-connection/${studentId}`),
  getRecommendations: () => api.get('/users/recommendations')
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId) => api.get(`/messages/${userId}`),
  sendMessage: (messageData) => api.post('/messages/send', messageData),
  markAsRead: (messageId) => api.put(`/messages/read/${messageId}`)
};

// Appointments API
export const appointmentsAPI = {
  bookAppointment: (appointmentData) => api.post('/appointments/book', appointmentData),
  getMyAppointments: (params) => api.get('/appointments/my-appointments', { params }),
  cancelAppointment: (appointmentId) => api.put(`/appointments/${appointmentId}/cancel`),
  getMentorAvailability: (mentorId) => api.get(`/appointments/mentor-availability/${mentorId}`),
  updateAvailability: (availabilityData) => api.put('/appointments/availability', availabilityData)
};

// Internships API
export const internshipsAPI = {
  getInternships: (params) => api.get('/internships', { params }),
  createInternship: (internshipData) => api.post('/internships', internshipData),
  applyToInternship: (internshipId) => api.post(`/internships/${internshipId}/apply`),
  manageApplication: (internshipId, studentId, status) => 
    api.put(`/internships/${internshipId}/applicants/${studentId}`, { status })
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`)
};

export default api;
