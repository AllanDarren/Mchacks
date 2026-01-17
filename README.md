# MentorConnect - Plateforme de Mentorat Professionnel

Application web complète de mentorat permettant aux étudiants de se connecter avec des mentors professionnels.

## 🎯 Fonctionnalités Principales

- **Authentification sécurisée** (JWT) avec rôles Étudiant/Mentor
- **Découverte de mentors** avec système de recherche et filtres avancés
- **Messagerie en temps réel** (Socket.io)
- **Système de réservation** de sessions (virtuelles et en personne)
- **Stages d'un jour** proposés par les mentors
- **Recommandations intelligentes** basées sur les intérêts
- **Tableau de bord personnalisé** pour chaque utilisateur
- **Notifications en temps réel**

## 🚀 Technologies Utilisées

### Backend
- Node.js & Express
- MongoDB Atlas (Base de données)
- Socket.io (Temps réel)
- JWT (Authentification)
- Bcrypt (Sécurité)

### Frontend
- React 18
- React Router v6
- Axios (API calls)
- Socket.io Client
- Tailwind CSS

## 📦 Installation

### 1. Cloner le projet
```bash
cd Mchacks
```

### 2. Installer le backend
```bash
cd backend
npm install
```

### 3. Installer le frontend
```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

Les fichiers `.env` sont déjà configurés avec les informations MongoDB Atlas fournies.

**Backend** (backend/.env):
- MongoDB URI configuré
- JWT Secret défini
- Port 5000

**Frontend** (frontend/.env):
- API URL: http://localhost:5000/api
- Socket URL: http://localhost:5000

## 🏃 Démarrage de l'application

### Démarrer le backend (Terminal 1)
```bash
cd backend
npm run dev
```
Le serveur démarre sur http://localhost:5000

### Démarrer le frontend (Terminal 2)
```bash
cd frontend
npm start
```
L'application s'ouvre sur http://localhost:3000

## 👥 Utilisation

### Pour les Étudiants
1. Créer un compte étudiant
2. Compléter son profil avec centres d'intérêt
3. Découvrir et se connecter avec des mentors
4. Échanger par messagerie
5. Réserver des sessions de mentorat
6. Postuler aux stages d'un jour

### Pour les Mentors
1. Créer un compte mentor
2. Compléter son profil professionnel
3. Définir ses préférences de communication
4. Gérer ses disponibilités
5. Accepter les demandes de connexion
6. Proposer des stages d'un jour (optionnel)

## 📱 Pages de l'Application

- **/** - Page d'accueil
- **/register** - Inscription
- **/login** - Connexion
- **/dashboard** - Tableau de bord personnalisé
- **/discover** - Découvrir des mentors
- **/messages** - Messagerie en temps réel
- **/internships** - Stages d'un jour
- **/profile** - Gestion du profil

## 🔐 Connexion MongoDB

L'application est connectée à MongoDB Atlas avec les credentials fournis:
- **Database**: McHacks cluster
- **User**: samybenchaar_db_user
- Connexion automatique au démarrage du serveur

## 🛠️ Structure du Projet

```
Mchacks/
├── backend/
│   ├── config/         # Configuration DB
│   ├── models/         # Modèles Mongoose
│   ├── routes/         # Routes API
│   ├── controllers/    # Logique métier
│   ├── middleware/     # Auth & Upload
│   ├── utils/          # Utilitaires
│   └── server.js       # Point d'entrée
│
└── frontend/
    ├── public/
    └── src/
        ├── components/ # Composants React
        ├── pages/      # Pages principales
        ├── contexts/   # Auth & Socket
        ├── services/   # API & Socket
        └── App.jsx     # Application principale
```

## 🎨 Design

- Design moderne et responsive
- Utilisation de Tailwind CSS
- Interface intuitive et accessible
- Thème cohérent avec palette indigo/bleu

## 📝 Notes pour le Hackathon

- Tous les modèles de données sont prêts
- API RESTful complète et fonctionnelle
- Messagerie temps réel opérationnelle
- Système de réservation implémenté
- Prêt pour démonstration et tests

## 🚨 Dépannage

Si vous rencontrez des erreurs:

1. Vérifier que MongoDB Atlas est accessible
2. S'assurer que les ports 3000 et 5000 sont libres
3. Vider le cache: `npm cache clean --force`
4. Réinstaller les dépendances

## 👨‍💻 Développement

Pour le développement:
- Le backend utilise `nodemon` pour le hot-reload
- Le frontend utilise `react-scripts` avec hot-reload automatique
- Les deux serveurs peuvent tourner simultanément

## 🎓 Créé pour McHacks

Application développée dans le cadre du hackathon McHacks 2025.

---

**Bon hackathon! 🚀**