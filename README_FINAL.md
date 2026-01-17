# 🚀 MentorMatch - Hackathon Scaffold

Une structure **prête à coder** pour un hackathon de 24h avec **Next.js 14+**, **TypeScript**, **Supabase**, et **Tailwind CSS**.

## ⚡ Start Rapide (2 minutes)

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer .env.local
cp .env.local.example .env.local
# → Remplir avec tes clés Supabase

# 3. Setup BDD Supabase
# → Copier le contenu de database.sql dans l'SQL Editor de Supabase

# 4. Démarrer le dev server
npm run dev
```

👉 Ouvre **http://localhost:3000**

## 📁 Structure Prête à l'Emploi

```
✅ Routes d'auth       → /login, /signup
✅ Routes protégées    → /dashboard, /profile
✅ Middleware          → Protection automatique
✅ Supabase setup      → Client + Server
✅ Types TypeScript    → Prêts à étendre
✅ Tailwind CSS        → Déjà configuré
✅ Base de données     → Schéma complet avec RLS
```

## 📚 Documentation

| Fichier | Contenu |
|---------|---------|
| `QUICK_START.md` | **À lire en premier** - Checklist rapide |
| `README_SETUP.md` | Configuration détaillée |
| `database.sql` | Schéma BDD + politiques RLS |

## 🎯 Prochaines Étapes

### Immédiatement (pour débuter)
- [ ] Remplir `.env.local` avec tes credentiels Supabase
- [ ] Exécuter `database.sql` dans Supabase
- [ ] Lancer `npm run dev`

### Avant le premier commit
- [ ] Ajouter des composants shadcn/ui: `npx shadcn-ui@latest init`
- [ ] Implémenter la logique d'auth réelle
- [ ] Connecter les formulaires à Supabase

### Pour le MVP
- [ ] Ajouter la logique de matching
- [ ] Créer les pages de discovery
- [ ] Implémenter le messaging/chat

## 🛠️ Stack Détaillé

| Layer | Tech |
|-------|------|
| **Framework** | Next.js 14+ (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui (à ajouter) |
| **Icons** | Lucide React |
| **Auth/Backend** | Supabase (PostgreSQL + Auth) |
| **Deployment** | Vercel |

## 📂 Architecture

```
src/
├── app/                    # Routes et layouts
│   ├── (auth)/            # Routes d'authentification
│   ├── (dashboard)/       # Routes protégées
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── common/            # Header, Footer, Sidebar
│   └── features/          # Logique métier
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── auth.ts            # Logique auth
│   ├── auth-actions.ts    # Server actions
│   └── utils.ts           # Utilities
├── types/
│   └── index.ts           # Types TypeScript
└── hooks/
    └── useAuth.ts         # Hook d'authentification
```

## 🔐 Authentification

### Client-side
```tsx
import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  return <div>Hello {user?.email}</div>;
}
```

### Server-side
```tsx
import { createServerClient_ } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createServerClient_();
  const { data: { user } } = await supabase.auth.getUser();
  
  return <div>Welcome {user?.email}</div>;
}
```

## 🗄️ Modèle de Données

### `profiles`
- `id` (UUID) → lié à `auth.users`
- `full_name`, `avatar_url`, `role` (student|mentor), `bio`

### `skills`
- `id`, `name` (unique)

### `profile_skills` (junction)
- `profile_id`, `skill_id`

**Tous avec RLS et politiques d'accès configurées!**

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
npm i -g vercel
vercel
```

Configure les **Environment Variables** sur Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 💡 Tips pour le Hackathon

1. **UI rapide** - Utilise `shadcn/ui` pour les composants complexes
2. **Requêtes BD** - Supabase client directement depuis React
3. **Validation** - Les types TypeScript t'aident à valider
4. **Déploiement** - Vercel + Supabase = deployed en <2 min
5. **Real-time** - Supabase supporte les subscriptions pour du live

## 📞 Support

- **Supabase Docs** - https://supabase.com/docs
- **Next.js Docs** - https://nextjs.org/docs
- **Tailwind** - https://tailwindcss.com

---

**C'est tout! Tu as une base solide et prête pour coder.** 

**Bon hackathon! 🎉**
