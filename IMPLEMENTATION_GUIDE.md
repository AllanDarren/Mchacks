# 📅 Guide d'Intégration - Système de Réservation de Plages de Disponibilité

## Vue d'ensemble

Ce système permet aux mentors de créer et gérer leurs plages de disponibilité, et aux étudiants de réserver ces plages de manière visuelle avec drag-and-drop.

## 🎯 Fonctionnalités principales

### Pour les Mentors
- ✅ Créer des plages de disponibilité (virtuel ou en personne)
- ✅ Visualiser les plages en calendrier (vue semaine ou liste)
- ✅ Drag-and-drop pour déplacer les plages
- ✅ Éditer/supprimer les plages (sauf les réservées)
- ✅ Voir les réservations et qui a réservé
- ✅ Annuler les réservations

### Pour les Étudiants
- ✅ Consulter les plages disponibles d'un mentor
- ✅ Filtrer par type (virtuel/en personne)
- ✅ Trier par date ou durée
- ✅ Réserver une plage en un clic
- ✅ Ajouter des notes à la réservation
- ✅ Consulter et annuler ses rendez-vous

## 📁 Fichiers créés/modifiés

### Backend

```
backend/
├── models/
│   └── AvailabilitySlot.js          [CRÉÉ] - Modèle pour les plages
├── controllers/
│   └── availabilityController.js     [CRÉÉ] - Logique métier
├── routes/
│   └── availability.js               [CRÉÉ] - Endpoints API
└── server.js                         [MODIFIÉ] - Enregistrement des routes
```

### Frontend

```
frontend/src/
├── pages/
│   ├── MentorAvailability.jsx        [CRÉÉ] - Gestionnaire pour mentors
│   ├── StudentBookAvailability.jsx   [CRÉÉ] - Réservation pour étudiants
│   └── MyBookings.jsx                [CRÉÉ] - Affichage des réservations
├── components/
│   └── Availability/
│       └── AvailabilityPreview.jsx   [CRÉÉ] - Widget pour les cartes
└── services/
    └── api.js                        [MODIFIÉ] - API availability ajoutée
```

## 🔌 Endpoints API

### Créer une plage (Mentor)
```
POST /api/availability
Authorization: Bearer token
Content-Type: application/json

{
  "startDateTime": "2024-01-20T14:00:00Z",
  "endDateTime": "2024-01-20T15:00:00Z",
  "type": "virtual",           // ou "in-person"
  "meetingLink": "https://...", // pour virtuel
  "location": "Café",          // pour en personne
  "notes": "Amener CV"
}
```

### Obtenir les plages d'un mentor
```
GET /api/availability/mentor/:mentorId
```

### Obtenir les plages disponibles (non réservées)
```
GET /api/availability/available/:mentorId?date=2024-01-20
```

### Réserver une plage (Étudiant)
```
POST /api/availability/:slotId/book
Authorization: Bearer token

{
  "notes": "J'aimerais discuter de..."
}
```

### Déplacer une plage (Drag-drop)
```
PATCH /api/availability/:slotId/move
Authorization: Bearer token

{
  "newStartDateTime": "2024-01-20T15:00:00Z",
  "newEndDateTime": "2024-01-20T16:00:00Z"
}
```

### Annuler une réservation
```
POST /api/availability/:slotId/cancel
Authorization: Bearer token
```

## 🛣️ Routes à ajouter au Frontend

Ajoutez ces routes dans votre `App.jsx`:

```jsx
import MentorAvailability from './pages/MentorAvailability';
import StudentBookAvailability from './pages/StudentBookAvailability';
import MyBookings from './pages/MyBookings';

// Dans vos routes protégées:
<Route path="/availability" element={<MentorAvailability />} />
<Route path="/book-availability/:mentorId" element={<StudentBookAvailability />} />
<Route path="/my-bookings" element={<MyBookings />} />
```

## 🔐 Middleware d'authentification

Le contrôleur utilise `restrictTo('mentor')` et `restrictTo('student')`.

Assurez-vous que votre middleware d'auth en `backend/middleware/auth.js` a:

```javascript
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Vous n\'avez pas accès à cette ressource' 
      });
    }
    next();
  };
};
```

## 📊 Structure de données AvailabilitySlot

```javascript
{
  _id: ObjectId,
  mentorId: ObjectId,              // Référence au mentor
  startDateTime: Date,              // Date/heure de début
  endDateTime: Date,                // Date/heure de fin
  type: String,                     // "virtual" ou "in-person"
  location: String,                 // Localisation (si in-person)
  meetingLink: String,              // Lien Zoom/Teams (si virtual)
  isBooked: Boolean,                // Est-ce réservée?
  appointmentId: ObjectId,          // Référence au rendez-vous
  studentId: ObjectId,              // Étudiant qui a réservé
  notes: String,                    // Notes du mentor
  duration: Number,                 // Durée en minutes
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Intégration aux pages existantes

### Dans Discover (Page de découverte des mentors)

Modifier `components/Discovery/MentorCard.jsx`:

```jsx
import AvailabilityPreview from '../Availability/AvailabilityPreview';

// Dans le composant MentorCard, charger les plages disponibles:
useEffect(() => {
  const loadAvailableSlots = async () => {
    try {
      const response = await availabilityAPI.getAvailableSlots(mentor._id);
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };
  
  loadAvailableSlots();
}, [mentor._id]);

// Ajouter le composant:
<AvailabilityPreview 
  mentorId={mentor._id}
  availableSlots={availableSlots}
/>
```

### Dans le Dashboard (Accueil)

Ajouter un widget pour accéder rapidement:

```jsx
// Pour les mentors
<button 
  onClick={() => navigate('/availability')}
  className="..."
>
  Gérer ma disponibilité
</button>

// Pour les étudiants
<button 
  onClick={() => navigate('/my-bookings')}
  className="..."
>
  Mes rendez-vous ({bookingCount})
</button>
```

## 🔔 Notifications en temps réel

Lorsqu'une plage est réservée, une notification est créée automatiquement pour le mentor via Socket.io:

```javascript
// Le front reçoit:
socket.on('slot:booked', (data) => {
  // Afficher notification
});
```

## ⚡ Points importants

1. **Permissions**: Les mentors ne peuvent modifier que leurs propres plages
2. **Plages réservées**: Les plages réservées ne peuvent pas être modifiées/supprimées
3. **Durée**: Calculée automatiquement à partir de startDateTime et endDateTime
4. **Fuseau horaire**: Utilisez toujours ISO 8601 (UTC) en base de données
5. **Drag-drop**: Fonctionne uniquement pour les plages non réservées

## 🧪 Test rapide en Terminal

```bash
# Créer une plage
curl -X POST http://localhost:5001/api/availability \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDateTime": "2024-01-20T14:00:00Z",
    "endDateTime": "2024-01-20T15:00:00Z",
    "type": "virtual"
  }'

# Obtenir les plages disponibles
curl http://localhost:5001/api/availability/available/MENTOR_ID
```

## 🚀 Prochaines étapes

1. ✅ Backend API implémenté
2. ✅ Frontend pages créées
3. ⏳ Tester le flow complet (mentor crée → étudiant réserve)
4. ⏳ Intégrer aux pages existantes (Discover, Dashboard)
5. ⏳ Ajouter les notifications visuelles
6. ⏳ Implémenter le rappel par email 24h avant

## 📝 Notes

- Les plages sont créées en UTC mais affichées en heure locale du navigateur
- Le système crée automatiquement un Appointment lors d'une réservation
- Les plages passées restent dans la BD à titre historique
