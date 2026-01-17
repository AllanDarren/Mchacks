# MentorMatch

Une plateforme de mentoring ultra-moderne pour connecter mentors et apprenants.

## 🚀 Stack Technique

- **Frontend**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (à installer)
- **Auth/Backend**: Supabase
- **Icons**: Lucide React
- **Language**: TypeScript

## 📁 Structure du Projet

```
src/
├── app/
│   ├── (auth)/              # Routes d'authentification
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/         # Routes protégées
│   │   ├── dashboard/
│   │   └── profile/
│   ├── layout.tsx           # Layout root
│   ├── page.tsx             # Landing page
│   └── globals.css
├── components/
│   ├── ui/                  # Composants shadcn/ui
│   ├── common/              # Composants réutilisables
│   └── features/            # Composants métier
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Client-side Supabase
│   │   └── server.ts        # Server-side Supabase
│   ├── auth.ts              # Logique auth
│   └── utils.ts
├── types/
│   └── index.ts             # Types globaux
└── hooks/
    └── useAuth.ts           # Hook d'authentification
```

## ⚡ Quick Start

### 1. Installation

```bash
npm install
```

### 2. Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Copier l'URL et les clés d'API
3. Créer `.env.local` (copier `.env.local.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Setup Base de Données

1. Aller dans l'éditeur SQL de Supabase
2. Copier le contenu de `database.sql` et l'exécuter
3. Cela crée les tables `profiles`, `skills` et les politiques RLS

### 4. Démarrer le Dev Server

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000)

## 📋 Routes

### Publiques
- `/` - Landing page
- `/login` - Connexion
- `/signup` - Inscription

### Protégées (auth requise)
- `/dashboard` - Dashboard principal
- `/profile` - Profil utilisateur

## 🛡️ Middleware

Le `middleware.ts` protège automatiquement les routes `/dashboard` et `/profile`. Les utilisateurs non authentifiés sont redirigés vers `/login`.

## 🗄️ Modèle de Données

### profiles
```sql
id (UUID) - PK, lié à auth.users
full_name (TEXT)
avatar_url (TEXT)
role (TEXT) - 'student' | 'mentor'
bio (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### skills
```sql
id (UUID) - PK
name (TEXT) - UNIQUE
created_at (TIMESTAMP)
```

### profile_skills (junction)
```sql
profile_id (UUID) - FK
skill_id (UUID) - FK
created_at (TIMESTAMP)
```

## 🎨 Customisation

- Éditer les couleurs dans `tailwind.config.ts`
- Ajouter des composants shadcn/ui quand besoin: `npx shadcn-ui@latest add [component]`
- Les types TypeScript sont dans `src/types/`

## 📝 Prochaines Étapes pour le Hackathon

- [ ] Installer shadcn/ui: `npx shadcn-ui@latest init`
- [ ] Implémenter la logique d'auth (signup/login actions)
- [ ] Connecter les formulaires à Supabase
- [ ] Ajouter la logique de matching mentors/étudiants
- [ ] Créer les fonctionnalités de messaging
- [ ] Déployer sur Vercel

## 🚢 Déploiement

```bash
# Build
npm run build

# Vercel (recommandé)
npm i -g vercel
vercel
```

---

**Bon hackathon! 🎉**
