# ✅ Checklist d'Intégration Complète

## 📋 Backend - Déjà fait ✅

- [x] Créer modèle `AvailabilitySlot.js`
  - [x] Champs pour date/heure
  - [x] Champs pour type (virtual/in-person)
  - [x] Champs pour réservation
  - [x] Indexes MongoDB

- [x] Créer contrôleur `availabilityController.js`
  - [x] `createSlot()` - Créer plage
  - [x] `getMentorSlots()` - Voir toutes les plages
  - [x] `getAvailableSlots()` - Voir plages libres
  - [x] `updateSlot()` - Modifier
  - [x] `moveSlot()` - Drag-drop
  - [x] `deleteSlot()` - Supprimer
  - [x] `bookSlot()` - Réserver
  - [x] `cancelBooking()` - Annuler réservation

- [x] Créer routes `availability.js`
  - [x] POST `/` - créer (mentor)
  - [x] GET `/mentor/:id` - voir toutes
  - [x] GET `/available/:id` - libres
  - [x] PUT `/:id` - modifier (mentor)
  - [x] PATCH `/:id/move` - déplacer (mentor)
  - [x] DELETE `/:id` - supprimer (mentor)
  - [x] POST `/:id/book` - réserver (étudiant)
  - [x] POST `/:id/cancel` - annuler

- [x] Enregistrer routes dans `server.js`
  - [x] Import `availabilityRoutes`
  - [x] `app.use('/api/availability', availabilityRoutes)`

## 🎨 Frontend - Services - Déjà fait ✅

- [x] Ajouter API methods dans `services/api.js`
  - [x] `createSlot()`
  - [x] `getMentorSlots()`
  - [x] `getAvailableSlots()`
  - [x] `updateSlot()`
  - [x] `moveSlot()`
  - [x] `deleteSlot()`
  - [x] `bookSlot()`
  - [x] `cancelBooking()`

## 📄 Frontend - Pages - Déjà fait ✅

- [x] Créer `pages/MentorAvailability.jsx`
  - [x] Vue semaine (calendrier 7 jours)
  - [x] Vue liste
  - [x] Drag-and-drop pour déplacer
  - [x] Modal pour créer/éditer
  - [x] Boutons delete/edit
  - [x] Afficher les réservations

- [x] Créer `pages/StudentBookAvailability.jsx`
  - [x] Charger les plages d'un mentor
  - [x] Afficher profil du mentor
  - [x] Filtres (type, tri)
  - [x] Cards des plages
  - [x] Modal de réservation
  - [x] Champ notes

- [x] Créer `pages/MyBookings.jsx`
  - [x] Charger mes réservations
  - [x] Filtrer (à venir, passés, tous)
  - [x] Afficher détails
  - [x] Bouton annuler
  - [x] Modal de confirmation

## 🧩 Frontend - Composants - Déjà fait ✅

- [x] Créer `components/Availability/AvailabilityPreview.jsx`
  - [x] Afficher 3 prochaines plages
  - [x] Badge du type
  - [x] Bouton "Voir toutes"

- [x] Créer `components/Availability/AvailabilityBadge.jsx`
  - [x] Petit badge "Disponible"
  - [x] Statut en temps réel
  - [x] À intégrer sur MentorCard

## 📍 À FAIRE - Intégration dans l'app existante

### Step 1: Routes dans App.jsx
- [ ] Ouvrir `frontend/src/App.jsx`
- [ ] Importer les 3 pages:
  ```jsx
  import MentorAvailability from './pages/MentorAvailability';
  import StudentBookAvailability from './pages/StudentBookAvailability';
  import MyBookings from './pages/MyBookings';
  ```
- [ ] Ajouter les routes dans `<Routes>`:
  ```jsx
  <Route path="/availability" element={<MentorAvailability />} />
  <Route path="/book-availability/:mentorId" element={<StudentBookAvailability />} />
  <Route path="/my-bookings" element={<MyBookings />} />
  ```

### Step 2: Ajouter les boutons au Navbar
- [ ] Ouvrir `frontend/src/components/Common/Navbar.jsx`
- [ ] Ajouter imports:
  ```jsx
  import { FiCalendar } from 'react-icons/fi';
  ```
- [ ] Ajouter boutons dans le menu:
  ```jsx
  {user.role === 'mentor' && (
    <Link to="/availability" className="...">
      <FiCalendar /> Ma disponibilité
    </Link>
  )}
  
  {user.role === 'student' && (
    <Link to="/my-bookings" className="...">
      <FiCalendar /> Mes rendez-vous
    </Link>
  )}
  ```

### Step 3: Intégrer à MentorCard (Discover)
- [ ] Ouvrir `frontend/src/components/Discovery/MentorCard.jsx`
- [ ] Ajouter imports:
  ```jsx
  import AvailabilityPreview from '../Availability/AvailabilityPreview';
  import AvailabilityBadge from '../Availability/AvailabilityBadge';
  import { availabilityAPI } from '../../services/api';
  ```
- [ ] Ajouter state:
  ```jsx
  const [availableSlots, setAvailableSlots] = useState([]);
  ```
- [ ] Charger les plages:
  ```jsx
  useEffect(() => {
    const loadSlots = async () => {
      try {
        const response = await availabilityAPI.getAvailableSlots(mentor._id);
        setAvailableSlots(response.data);
      } catch (error) {}
    };
    loadSlots();
  }, [mentor._id]);
  ```
- [ ] Ajouter le badge dans le header:
  ```jsx
  <AvailabilityBadge mentorId={mentor._id} />
  ```
- [ ] Ajouter l'aperçu (si étudiant):
  ```jsx
  {currentUser?.role === 'student' && availableSlots.length > 0 && (
    <AvailabilityPreview mentorId={mentor._id} availableSlots={availableSlots} />
  )}
  ```

### Step 4: Ajouter widgets au Dashboard
- [ ] Ouvrir `frontend/src/pages/Dashboard.jsx`
- [ ] Ajouter imports:
  ```jsx
  import { availabilityAPI } from '../../services/api';
  ```
- [ ] Ajouter state et effet:
  ```jsx
  const [stats, setStats] = useState({
    upcomingBookings: 0,
    totalSlots: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await availabilityAPI.getMentorSlots(user._id);
        const slots = response.data;
        const now = new Date();
        
        setStats({
          upcomingBookings: slots.filter(
            s => s.isBooked && new Date(s.startDateTime) >= now
          ).length,
          totalSlots: slots.length
        });
      } catch (error) {}
    };
    loadStats();
  }, [user._id]);
  ```
- [ ] Ajouter les cards:
  ```jsx
  {user.role === 'mentor' && (
    <>
      <div className="bg-white p-6 rounded-lg">
        <p>Plages créées</p>
        <p className="text-3xl font-bold">{stats.totalSlots}</p>
        <button onClick={() => navigate('/availability')}>
          Gérer mes plages
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg">
        <p>Rendez-vous à venir</p>
        <p className="text-3xl font-bold">{stats.upcomingBookings}</p>
        <button onClick={() => navigate('/my-bookings')}>
          Voir mes rendez-vous
        </button>
      </div>
    </>
  )}
  ```

### Step 5: Tester le flux complet
- [ ] Démarrer le backend: `cd backend && npm start`
- [ ] Démarrer le frontend: `cd frontend && npm start`
- [ ] Créer un compte mentor
- [ ] Aller à `/availability`
- [ ] Créer une plage (e.g., demain 14h, 30 min)
- [ ] Créer un compte étudiant
- [ ] Chercher le mentor dans Discover
- [ ] Voir le badge "Disponible demain"
- [ ] Cliquer sur la plage
- [ ] Vérifier le preview
- [ ] Réserver la plage
- [ ] Aller à `/my-bookings`
- [ ] Voir la réservation
- [ ] Se reconnecter en tant que mentor
- [ ] Aller à `/availability` ou `/my-bookings`
- [ ] Voir que la plage est réservée

### Step 6: Ajouter les notifications (optionnel)
- [ ] Vérifier que Socket.io reçoit les événements
- [ ] Ajouter écouteurs dans SocketContext.jsx:
  ```jsx
  socket.on('slot:booked', (data) => {
    // Afficher notification toast
  });
  
  socket.on('slot:cancelled', (data) => {
    // Afficher notification toast
  });
  ```

## 🧪 Test des endpoints API

```bash
# 1. Se connecter et obtenir un token
TOKEN="votre_token_ici"
MENTOR_ID="votre_mentor_id"

# 2. Créer une plage
curl -X POST http://localhost:5001/api/availability \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "startDateTime": "2024-01-25T14:00:00Z",
    "endDateTime": "2024-01-25T15:00:00Z",
    "type": "virtual",
    "meetingLink": "https://zoom.us/..."
  }'

# 3. Obtenir les plages du mentor
curl http://localhost:5001/api/availability/mentor/$MENTOR_ID

# 4. Obtenir les plages disponibles
curl http://localhost:5001/api/availability/available/$MENTOR_ID

# 5. Réserver une plage (remplacer SLOT_ID)
SLOT_ID="votre_slot_id"
curl -X POST http://localhost:5001/api/availability/$SLOT_ID/book \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Hâte de discuter!"}'
```

## 📝 Fichiers de documentation

- [x] `AVAILABILITY_README.md` - Vue d'ensemble
- [x] `IMPLEMENTATION_GUIDE.md` - Guide technique détaillé
- [x] `INTEGRATION_EXAMPLE.md` - Exemples de code
- [x] `UI_MOCKUPS.md` - Mockups visuels
- [x] Cette checklist!

## 🎯 État d'avancement

```
BACKEND     ████████████████████ 100% ✅
FRONTEND    ████████████████████ 100% ✅
INTÉGRATION ░░░░░░░░░░░░░░░░░░░░   0% ⏳

À FAIRE:
- [ ] Intégrer aux pages existantes (App.jsx, Navbar, etc.)
- [ ] Tester le flux mentor → étudiant → réservation
- [ ] Ajouter les notifications en temps réel
- [ ] Personnaliser les couleurs/styles
- [ ] Déployer en production
```

## 💡 Tips & Tricks

1. **Pour débuguer les plages non affichées**:
   ```jsx
   console.log('Slots reçues:', slots);
   console.log('User:', localStorage.getItem('user'));
   ```

2. **Pour voir les requêtes API**:
   - F12 → Network → Filtrer par "availability"

3. **Pour tester sans UI**:
   - Utiliser Postman avec les endpoints listés ci-dessus

4. **Pour améliorer la performance**:
   - Ajouter pagination aux grandes listes
   - Mettre en cache les plages (30sec)

## 🚀 Prochaines améliorations (post-MVP)

- [ ] Exportation calendar (iCal, Google Calendar)
- [ ] Disponibilités récurrentes (chaque lundi)
- [ ] Intégration Zoom/Google Meet
- [ ] Rappels par email 24h avant
- [ ] Statistiques d'utilisation
- [ ] Review/évaluation post-rencontre
- [ ] Paiement/facturation
- [ ] SMS de confirmation

## 📞 Troubleshooting

**Erreur 401 (Unauthorized)**
→ Vérifier le token dans localStorage

**Erreur 403 (Forbidden)**
→ Vérifier votre rôle (mentor/student)

**Les plages ne se chargent pas**
→ Vérifier que mentorId est correct

**Drag-drop ne fonctionne pas**
→ Vérifier que la plage n'est pas réservée

**Socket.io ne marche pas**
→ Vérifier FRONTEND_URL dans .env

---

**Bonne chance! 🎉**

Commencez par la Step 1 (App.jsx) et progressez étape par étape.
