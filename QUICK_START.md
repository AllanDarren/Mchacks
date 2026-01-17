# Checklist d'Installation Rapide

## 1️⃣ Dépendances

```bash
npm install
```

## 2️⃣ Supabase Setup

### a. Configuration .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyXxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyXxxxxxxxxxxx
```

### b. Exécuter le SQL
- Aller sur https://app.supabase.com
- Naviguer vers "SQL Editor"
- Copier le contenu de `database.sql`
- Exécuter pour créer les tables et les politiques RLS

## 3️⃣ shadcn/ui Installation (Optionnel mais recommandé)

```bash
# Init shadcn/ui
npx shadcn-ui@latest init

# Ajouter les composants que tu veux
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
```

## 4️⃣ Démarrer le Dev

```bash
npm run dev
```

Ouvre http://localhost:3000

## 📋 Routes Existantes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Page de connexion |
| `/signup` | Page d'inscription |
| `/dashboard` | Dashboard (protégé) |
| `/profile` | Profil utilisateur (protégé) |

## 🛠️ Fichiers Importants

- `src/lib/supabase/client.ts` - Client-side Supabase
- `src/lib/supabase/server.ts` - Server-side Supabase
- `middleware.ts` - Protection des routes
- `src/types/index.ts` - Types TypeScript
- `database.sql` - Schéma BDD

## ⚡ Tips Hackathon

1. **Authentification** - Utilise `useAuth()` hook pour accéder à l'utilisateur
2. **Composants** - Copie/modifie les composants dans `src/components/`
3. **Styles** - Tailwind est déjà configured, utilise les classes
4. **API** - Utilise directement Supabase client pour les requêtes
5. **Types** - Définis tes types dans `src/types/index.ts`

## 🚀 Déploiement (Quand t'es prêt)

### Vercel (recommandé)
```bash
npm i -g vercel
vercel
# Follow les prompts
```

### Variables d'env sur Vercel
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

**Tu es prêt! Bon code! 🎉**
