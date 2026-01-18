# 🚀 QUICK START - Commencer en 5 minutes

## ⚡ TL;DR - Les 3 trucs à faire

### 1️⃣ Dans `App.jsx`, ajouter les routes:

```jsx
// Au top du fichier
import MentorAvailability from './pages/MentorAvailability';
import StudentBookAvailability from './pages/StudentBookAvailability';
import MyBookings from './pages/MyBookings';

// Dans <Routes>, ajouter:
<Route element={<PrivateRoute />}>
  <Route path="/availability" element={<MentorAvailability />} />
  <Route path="/book-availability/:mentorId" element={<StudentBookAvailability />} />
  <Route path="/my-bookings" element={<MyBookings />} />
</Route>
```

### 2️⃣ Dans `Navbar.jsx`, ajouter les boutons:

```jsx
import { FiCalendar } from 'react-icons/fi';

// Dans le menu, ajouter:
{user?.role === 'mentor' && (
  <Link to="/availability" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded">
    <FiCalendar /> Disponibilité
  </Link>
)}

{user?.role === 'student' && (
  <Link to="/my-bookings" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded">
    <FiCalendar /> Mes rendez-vous
  </Link>
)}
```

### 3️⃣ Dans `MentorCard.jsx`, ajouter le preview:

```jsx
import { useState, useEffect } from 'react';
import AvailabilityPreview from '../Availability/AvailabilityPreview';
import AvailabilityBadge from '../Availability/AvailabilityBadge';
import { availabilityAPI } from '../../services/api';

// Dans le composant:
const [slots, setSlots] = useState([]);

useEffect(() => {
  availabilityAPI.getAvailableSlots(mentor._id)
    .then(res => setSlots(res.data))
    .catch(e => console.error(e));
}, [mentor._id]);

// Dans le JSX:
<AvailabilityBadge mentorId={mentor._id} />

{/* Plus bas dans la card */}
{slots.length > 0 && (
  <AvailabilityPreview mentorId={mentor._id} availableSlots={slots} />
)}
```

---

## ✅ C'est tout!

Le reste du système est déjà implémenté. Maintenant vous pouvez:

1. **Mentor** → Va à `/availability` → Crée des plages
2. **Étudiant** → Voit les plages sur les cartes mentors
3. **Étudiant** → Clique "Voir toutes les plages"
4. **Étudiant** → Réserve une plage
5. **Toutes** → Voir les rendez-vous à `/my-bookings`

---

## 🧪 Test rapide

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm start

# Puis:
1. Créer compte mentor
2. Aller à http://localhost:3000/availability
3. Créer une plage
4. Créer compte étudiant
5. Voir la plage sur une mentor card
6. Réserver
7. Vérifier dans /my-bookings
```

---

## 📖 Pour plus de détails

- `INTEGRATION_CHECKLIST.md` - Checklist complète pas à pas
- `IMPLEMENTATION_GUIDE.md` - Guide technique détaillé
- `INTEGRATION_EXAMPLE.md` - Exemples de code pour chaque page
- `UI_MOCKUPS.md` - Visuels et interactions

---

## 🎨 Fichiers créés (ne pas modifier)

```
✅ backend/models/AvailabilitySlot.js
✅ backend/controllers/availabilityController.js
✅ backend/routes/availability.js
✅ frontend/pages/MentorAvailability.jsx
✅ frontend/pages/StudentBookAvailability.jsx
✅ frontend/pages/MyBookings.jsx
✅ frontend/components/Availability/AvailabilityPreview.jsx
✅ frontend/components/Availability/AvailabilityBadge.jsx
```

Tous les autres fichiers (`App.jsx`, `Navbar.jsx`, etc.) = À modifier par vous

---

**Allez-y! C'est par là que ça commence:** `frontend/src/App.jsx`
