# Architecture de la Communication - MentorConnect

## 📊 Modèle de Données

```
User (Mentor ou Étudiant)
├── _id
├── firstName
├── lastName
├── email
├── role: 'student' | 'mentor'
├── connections: [User._id]        ← Connexions ACCEPTÉES
├── pendingConnections: [User._id] ← Demandes EN ATTENTE
└── ...autres champs

Message
├── _id
├── senderId: User._id
├── receiverId: User._id
├── content: String
├── read: Boolean
├── timestamp: Date

Notification
├── userId: User._id
├── type: 'connection' | 'message' | 'appointment' | etc
├── title
├── content
├── relatedId: ID de l'entité concernée
└── ...
```

## 🔄 Flux de Communication

### Étape 1: DEMANDER UNE CONNEXION
```
1. Étudiant clique "Se connecter" sur la carte d'un mentor
2. POST /api/users/connect/:mentorId
3. Backend ajoute étudiantId à mentor.pendingConnections
4. Notification créée pour le mentor: "X souhaite se connecter"
5. Mentor voit la demande dans "Demandes de connexion"
```

### Étape 2: ACCEPTER LA CONNEXION
```
1. Mentor clique "Accepter" sur une demande
2. PUT /api/users/accept-connection/:studentId
3. Backend:
   - Supprime studentId de pendingConnections
   - Ajoute studentId à mentor.connections
   - Ajoute mentorId à student.connections
4. Les deux utilisateurs sont maintenant CONNECTÉS
5. Notification créée pour l'étudiant: "Mentor a accepté"
```

### Étape 3: VOIR SES CONNEXIONS
```
1. Utilisateur accède à "/connections"
2. Affiche la liste de tous les users dans connections[]
3. Pour chaque connection:
   - Nom, rôle, profil
   - Dernier message échangé
   - Nombre de messages non lus
   - Bouton pour ouvrir la messagerie
```

### Étape 4: ENVOYER UN MESSAGE
```
1. Utilisateur clique sur une connexion
2. Ouvre la page Messages avec cette personne
3. Tape et envoie un message
4. Backend:
   - Crée le message en BD
   - Émet via Socket.io au destinataire
   - Crée une notification
5. Destinataire reçoit le message EN TEMPS RÉEL
```

## 🎯 Pages à Créer/Modifier

### 1. `/connections` - Page Connexions (NOUVELLE)
**Pour les deux rôles (étudiant et mentor)**
- Liste de toutes les connexions acceptées
- Affiche: nom, rôle, dernier message, badge "non lus"
- Action: clic pour ouvrir la messagerie

### 2. `/connection-requests` - EXISTANTE mais À AMÉLIORER
**Pour les mentors uniquement**
- Liste des demandes EN ATTENTE
- Actions: Accepter / Refuser

### 3. `/messages` - EXISTANTE À ADAPTER
**Pour les deux rôles**
- Si pas de connexions: message "Aucune connexion, allez dans Découvrir"
- Sinon: affiche les conversations existantes

### 4. `/dashboard` - EXISTANTE À AMÉLIORER
**Widgets rapides:**
- "X connexions acceptées" → lien vers /connections
- "X demandes en attente" (mentor) → lien vers /connection-requests
- "Derniers messages" (préview)

## 🔌 Appels API Existants

✅ POST /api/users/connect/:mentorId
✅ PUT /api/users/accept-connection/:studentId
✅ GET /api/users/profile/:id
✅ POST /api/messages/send
✅ GET /api/messages/conversations
✅ GET /api/messages/:userId

## ✨ Nouvelles Routes à Ajouter (Optionnel)

```
GET /api/users/connections  → Récupérer la liste des connexions
GET /api/users/pending-connections → Récupérer les demandes en attente
```

## 📱 Flux Utilisateur Complet

```
ÉTUDIANT:
1. Accueil → Login
2. Dashboard → Voir les widgets de connexions
3. Découvrir → Trouver des mentors
4. Clic "Se connecter" → Demande envoyée
5. Attendre acceptation...
6. Notification "Mentor a accepté"
7. Aller dans Connexions
8. Clic sur le mentor → Ouvre Messages
9. Envoyer/recevoir messages en temps réel

MENTOR:
1. Accueil → Login
2. Dashboard → Voir les demandes en attente
3. Aller dans "Demandes de connexion"
4. Voir la liste des demandes
5. Accepter une demande
6. La connexion apparaît dans "Connexions"
7. Envoyer/recevoir messages
```

## 🚀 Plan d'Implémentation

1. **Créer page `/connections`** (voir tous les contacts acceptés)
2. **Améliorer page `/connection-requests`** (voir les demandes)
3. **Ajouter widgets au Dashboard** (afficher les stats)
4. **Tester le flux complet** avec 2 comptes

---

**Commençons par créer la page Connexions (étape 1) ! 🎯**
