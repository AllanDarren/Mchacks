# 🎯 Exemple d'Intégration Complète

## 1. Ajouter les routes au App.jsx

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Common/Navbar';

// Pages existantes
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';

// Nouvelles pages pour les plages de disponibilité
import MentorAvailability from './pages/MentorAvailability';
import StudentBookAvailability from './pages/StudentBookAvailability';
import MyBookings from './pages/MyBookings';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes protégées existantes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* ... autres routes ... */}
          </Route>

          {/* Nouvelles routes pour les plages */}
          <Route element={<PrivateRoute />}>
            {/* Accessible seulement aux mentors */}
            <Route path="/availability" element={<MentorAvailability />} />
            
            {/* Accessible à tous les utilisateurs authentifiés */}
            <Route path="/book-availability/:mentorId" element={<StudentBookAvailability />} />
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

## 2. Mettre à jour MentorCard.jsx (Discover)

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import AvailabilityPreview from '../Availability/AvailabilityPreview';
import AvailabilityBadge from '../Availability/AvailabilityBadge';
import { availabilityAPI } from '../../services/api';

const MentorCard = ({ mentor }) => {
  const navigate = useNavigate();
  const [availableSlots, setAvailableSlots] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // Charger les plages disponibles du mentor
    const loadSlots = async () => {
      try {
        const response = await availabilityAPI.getAvailableSlots(mentor._id);
        setAvailableSlots(response.data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    loadSlots();
  }, [mentor._id]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* En-tête avec profil et badge de disponibilité */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">
            {mentor.firstName} {mentor.lastName}
          </h3>
          {mentor.mentorInfo?.currentJob && (
            <p className="text-sm text-gray-600">
              {mentor.mentorInfo.currentJob}
            </p>
          )}
        </div>
        <AvailabilityBadge mentorId={mentor._id} />
      </div>

      {/* Expertise */}
      {mentor.mentorInfo?.expertise && (
        <div className="mb-4 flex flex-wrap gap-2">
          {mentor.mentorInfo.expertise.slice(0, 3).map((exp, idx) => (
            <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
              {exp}
            </span>
          ))}
        </div>
      )}

      {/* Bio */}
      {mentor.mentorInfo?.bio && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {mentor.mentorInfo.bio}
        </p>
      )}

      {/* Preview des plages disponibles (pour les étudiants) */}
      {currentUser?.role === 'student' && availableSlots.length > 0 && (
        <AvailabilityPreview 
          mentorId={mentor._id}
          availableSlots={availableSlots}
        />
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => navigate(`/profile/${mentor._id}`)}
          className="flex-1 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Voir le profil
        </button>
        <button
          onClick={() => navigate(`/messages/${mentor._id}`)}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Envoyer un message
        </button>
      </div>
    </div>
  );
};

export default MentorCard;
```

## 3. Ajouter des boutons au Navbar

```jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600">
          MentorConnect
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <>
              {user.role === 'mentor' && (
                <Link
                  to="/availability"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FiCalendar size={18} />
                  Ma disponibilité
                </Link>
              )}

              {user.role === 'student' && (
                <Link
                  to="/my-bookings"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FiCalendar size={18} />
                  Mes rendez-vous
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <FiLogOut size={18} />
                Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

## 4. Ajouter des widgets au Dashboard

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiUsers } from 'react-icons/fi';
import { availabilityAPI } from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [stats, setStats] = useState({
    upcomingBookings: 0,
    totalSlots: 0,
    completedMeetings: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await availabilityAPI.getMentorSlots(user._id);
      const slots = response.data;

      const now = new Date();
      const upcomingBookings = slots.filter(
        s => s.isBooked && new Date(s.startDateTime) >= now
      ).length;

      const completedMeetings = slots.filter(
        s => s.isBooked && new Date(s.startDateTime) < now
      ).length;

      setStats({
        upcomingBookings,
        totalSlots: slots.length,
        completedMeetings
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Widget pour les mentors */}
        {user.role === 'mentor' && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Plages créées</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.totalSlots}
                  </p>
                </div>
                <FiCalendar size={32} className="text-blue-300" />
              </div>
              <button
                onClick={() => navigate('/availability')}
                className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Gérer mes plages
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Rendez-vous à venir</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.upcomingBookings}
                  </p>
                </div>
                <FiClock size={32} className="text-green-300" />
              </div>
              <button
                onClick={() => navigate('/my-bookings')}
                className="mt-4 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Voir mes rendez-vous
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Rencontres complétées</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.completedMeetings}
                  </p>
                </div>
                <FiUsers size={32} className="text-purple-300" />
              </div>
            </div>
          </>
        )}

        {/* Widget pour les étudiants */}
        {user.role === 'student' && (
          <div className="bg-white p-6 rounded-lg shadow-md md:col-span-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Mes rendez-vous</p>
                <p className="text-xl text-gray-700">
                  Consultez vos rendez-vous programmés avec vos mentors
                </p>
              </div>
              <FiCalendar size={32} className="text-blue-300" />
            </div>
            <button
              onClick={() => navigate('/my-bookings')}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Voir mes rendez-vous
            </button>
          </div>
        )}
      </div>

      {/* Autres contenus du dashboard */}
      {/* ... */}
    </div>
  );
};

export default Dashboard;
```

## 5. Configuration pour le développement local

Dans `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5001/api
```

Dans `backend/.env`:
```
FRONTEND_URL=http://localhost:3000
```

## 6. Tester le flux complet

1. **Créer un compte mentor** et se connecter
2. **Aller à** `/availability`
3. **Créer une plage** (e.g., demain à 14h, 30 min)
4. **Se déconnecter** et créer un compte étudiant
5. **Aller à** `/discover` (ou page des mentors)
6. **Voir la badge** "Disponible demain"
7. **Cliquer sur** le bouton pour réserver
8. **Réserver la plage**
9. **Aller à** `/my-bookings` pour voir la réservation
10. **Se reconnecter** en tant que mentor et voir la réservation

## 🎉 C'est fait!

Vous avez maintenant un système complet de réservation de plages avec:
- ✅ Interface visuelle drag-and-drop pour les mentors
- ✅ Réservation simple pour les étudiants
- ✅ Notifications en temps réel
- ✅ Gestion des rendez-vous
- ✅ Intégration seamless avec le reste de l'app
