# 🔧 TROUBLESHOOTING - Solutions aux problèmes courants

## 🚨 Problèmes Backend

### ❌ "Cannot find module 'AvailabilitySlot'"

**Erreur:**
```
Error: Cannot find module '../models/AvailabilitySlot'
```

**Solution:**
1. Vérifier que le fichier existe: `backend/models/AvailabilitySlot.js`
2. Vérifier le chemin d'import dans `availability.js`:
   ```javascript
   const AvailabilitySlot = require('../models/AvailabilitySlot');
   ```
3. Vérifier qu'il n'y a pas de typo

---

### ❌ "Route not found" (404)

**Erreur:**
```
POST http://localhost:5001/api/availability → 404 Not Found
```

**Solutions:**
1. Vérifier que `availability.js` est enregistré dans `server.js`:
   ```javascript
   const availabilityRoutes = require('./routes/availability');
   app.use('/api/availability', availabilityRoutes);
   ```
2. Redémarrer le serveur: `npm start`
3. Vérifier qu'il n'y a pas d'erreur de syntaxe dans `server.js`

---

### ❌ "Unauthorized" (401)

**Erreur:**
```
401 Unauthorized - User is not authenticated
```

**Solutions:**
1. Vérifier que le token est envoyé dans les headers:
   ```bash
   Authorization: Bearer YOUR_TOKEN
   ```
2. Vérifier que le token est valide (pas expiré)
3. Vérifier le middleware `protect` dans `middleware/auth.js`:
   ```javascript
   const token = req.headers.authorization?.split(' ')[1];
   ```

---

### ❌ "Forbidden" (403)

**Erreur:**
```
403 Forbidden - You don't have permission
```

**Solutions:**
1. **Pour les mentors**: Vérifier que `req.user.role === 'mentor'`
   ```javascript
   // Connectez-vous en tant que mentor, pas étudiant
   ```
2. **Pour les étudiants**: Vérifier que `req.user.role === 'student'`
3. Vérifier le middleware `restrictTo`:
   ```javascript
   restrictTo('mentor') // ou 'student'
   ```

---

### ❌ "Cannot read property 'mentorId' of null"

**Erreur:**
```
TypeError: Cannot read property 'mentorId' of null
```

**Causes:**
- Slot n'existe pas
- SlotID est incorrect

**Solutions:**
```javascript
// Vérifier que le slot existe
const slot = await AvailabilitySlot.findById(slotId);
if (!slot) {
  return res.status(404).json({ message: 'Slot not found' });
}
```

---

### ❌ Plages réservées ne sauvegardent pas

**Symptôme:** La plage dit qu'elle est réservée mais elle ne l'est pas

**Solutions:**
1. Vérifier que `isBooked` est bien défini:
   ```javascript
   slot.isBooked = true;
   slot.studentId = studentId;
   slot.appointmentId = appointment._id;
   await slot.save();
   ```
2. Vérifier MongoDB:
   ```bash
   db.availabilityslots.findOne({_id: ObjectId("...")})
   ```

---

## 🎨 Problèmes Frontend

### ❌ Les plages ne s'affichent pas

**Symptôme:** Page blanche ou "Aucune plage"

**Solutions:**
1. Vérifier la console (F12 → Console):
   ```javascript
   console.log('Slots:', slots);
   ```
2. Vérifier que l'API call réussit:
   - F12 → Network → Chercher "availability"
   - Voir le statut (200, 401, 404, etc.)

3. Vérifier que le mentorId est correct:
   ```javascript
   const user = JSON.parse(localStorage.getItem('user'));
   console.log('Mentor ID:', user._id);
   ```

4. Si erreur 404:
   ```javascript
   // Vérifier la route:
   // http://localhost:5001/api/availability/mentor/[CORRECT_ID]
   ```

---

### ❌ Bouton "Ajouter plage" ne fonctionne pas

**Symptôme:** Clic mais rien ne se passe

**Solutions:**
1. Vérifier la console pour les erreurs
2. Vérifier que le form est rempli correctement:
   ```javascript
   if (!formData.startDateTime || !formData.endDateTime) {
     alert('Dates requises');
     return;
   }
   ```
3. Vérifier que les dates sont valides:
   ```javascript
   // Start doit être avant End
   new Date(startDateTime) < new Date(endDateTime)
   ```

---

### ❌ Drag-drop ne fonctionne pas

**Symptôme:** Les plages ne bougent pas

**Solutions:**
1. Vérifier que vous êtes mentor (pas étudiant)
2. Vérifier que la plage n'est pas réservée (sinon le drag est désactivé)
3. Vérifier que le navigateur supporte le drag-drop:
   - Chrome ✅ | Firefox ✅ | Safari ✅ | Edge ✅
4. Vérifier la console pour les erreurs de network

---

### ❌ Réservation échoue

**Erreur:** "Erreur lors de la réservation"

**Solutions:**
1. Vérifier que vous êtes étudiant (pas mentor)
2. Vérifier que la plage n'est pas déjà réservée:
   ```javascript
   if (slot.isBooked) {
     alert('Déjà réservée');
     return;
   }
   ```
3. Vérifier les logs du backend pour plus d'infos

---

### ❌ Import errors ("Cannot find module")

**Erreur:**
```
Module not found: Can't resolve './pages/MentorAvailability'
```

**Solutions:**
1. Vérifier que le fichier existe:
   ```bash
   ls frontend/src/pages/MentorAvailability.jsx
   ```
2. Vérifier le chemin d'import:
   ```javascript
   // ✅ Correct
   import MentorAvailability from './pages/MentorAvailability';
   
   // ❌ Incorrect
   import MentorAvailability from './pages/MentorAvailability.jsx';
   ```
3. Pas d'extension `.jsx` dans l'import!

---

### ❌ Erreur de compilation Tailwind

**Erreur:**
```
Module not found: Unknown
```

**Solutions:**
1. Arrêter le serveur dev
2. Nettoyer les caches:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```
3. Vérifier que Tailwind est configuré dans `tailwind.config.js`:
   ```javascript
   content: [
     './src/**/*.{js,jsx,ts,tsx}',
   ]
   ```

---

## 🔌 Problèmes Socket.io

### ❌ Notifications en temps réel ne fonctionnent pas

**Symptôme:** Pas de notification quand une plage est réservée

**Solutions:**
1. Vérifier que Socket.io est initialisé dans `server.js`:
   ```javascript
   const io = socketIo(server, { cors: { ... } });
   global.io = io;
   ```
2. Vérifier que le frontend se connecte:
   ```javascript
   // Dans SocketContext.jsx
   socket.on('connect', () => {
     console.log('Connected!');
   });
   ```
3. Vérifier les logs du serveur:
   ```bash
   # Vous devriez voir: "Connected" chaque fois qu'un client se connecte
   ```

---

## 📊 Problèmes MongoDB

### ❌ "Collection not found" ou données vides

**Solutions:**
1. Vérifier la connexion à MongoDB:
   ```bash
   mongo # Entrer dans le shell MongoDB
   use [YOUR_DB_NAME]
   db.availabilityslots.find().pretty()
   ```
2. Vérifier que les données existent:
   ```javascript
   // Si vide, créer une plage via l'API
   ```

---

### ❌ Duplicate key error

**Erreur:**
```
E11000 duplicate key error collection
```

**Solutions:**
1. MongoDB permet les doublons sauf si défini comme unique
2. Vérifier le schéma pour les indexes uniques
3. Vider et recréer la collection si besoin

---

## 🌐 Problèmes de Connexion

### ❌ CORS errors

**Erreur:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**
1. Vérifier que le backend a CORS activé:
   ```javascript
   // backend/server.js
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true
   }));
   ```
2. Vérifier que `FRONTEND_URL` est correcte dans `.env`
3. Redémarrer le serveur backend

---

### ❌ API returns 500

**Erreur:**
```
500 Internal Server Error
```

**Solutions:**
1. Vérifier les logs du backend:
   ```bash
   # Chercher le stacktrace dans le terminal
   ```
2. Vérifier les typos dans le code
3. Vérifier que les dépendances sont installées:
   ```bash
   cd backend
   npm install
   ```

---

## 🐛 Debugging Tips

### 1. Activer les logs détaillés

**Backend:**
```javascript
console.log('🔵 Creating slot:', formData);
console.log('📊 Slot saved:', slot);
```

**Frontend:**
```javascript
console.log('🔷 Available slots:', slots);
console.log('📅 Selected slot:', selectedSlot);
```

### 2. Utiliser le Network Inspector

```
F12 → Network tab
→ Filtrer par "availability"
→ Voir les requêtes et réponses
```

### 3. Utiliser MongoDB Compass

```
Visuel pour voir les données:
https://www.mongodb.com/try/download/compass
```

### 4. Utiliser Postman

```
Tester les API sans UI:
https://www.postman.com/

Créer une plage:
POST http://localhost:5001/api/availability
Headers: Authorization: Bearer YOUR_TOKEN
Body: { startDateTime, endDateTime, type, ... }
```

---

## ✅ Checklist de vérification

Avant de demander de l'aide, vérifier:

- [ ] Backend est démarré (`npm start` dans `backend/`)
- [ ] Frontend est démarré (`npm start` dans `frontend/`)
- [ ] Pas d'erreurs dans la console (F12)
- [ ] Pas d'erreurs dans les logs du terminal
- [ ] Token est présent (`localStorage.getItem('token')`)
- [ ] Rôle utilisateur est correct (mentor vs student)
- [ ] API URL est correct (F12 → Network)
- [ ] MongoDB est connecté
- [ ] Fichiers sont dans les bons répertoires

---

## 📞 Si toujours bloqué

1. **Relire** la documentation:
   - `IMPLEMENTATION_GUIDE.md`
   - `INTEGRATION_CHECKLIST.md`

2. **Chercher** dans les logs:
   ```bash
   # Backend
   grep -i "error\|fail\|warn" backend_output.txt
   
   # Frontend (F12)
   Voir tous les messages rouges
   ```

3. **Tester** avec Postman les endpoints directement

4. **Isoler** le problème:
   - Quel page? Quel bouton?
   - Quel navigateur?
   - Quel rôle utilisateur?

---

**Bon debugging! 🔍**

*La plupart des problèmes viennent d'imports oubliés ou de chemins incorrects.*
