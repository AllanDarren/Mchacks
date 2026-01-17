'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CurrentUser {
  id: string;
  name: string;
  role: 'student' | 'mentor';
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem(`user_${userId}`);
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (e) {
        console.error('Erreur lors de la lecture de l\'utilisateur', e);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUserId');
    router.push('/');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Chargement...</div>;
  }

  if (!currentUser) {
    return null;
  }

  const roleEmoji = currentUser.role === 'mentor' ? '👨‍🏫' : '👨‍🎓';
  const roleLabel = currentUser.role === 'mentor' ? 'Mentor' : 'Étudiant';

  return (
    <div className="py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
            {roleEmoji} {roleLabel}
          </div>
          <h2 className="text-2xl font-bold mt-2">{currentUser.name}</h2>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Déconnexion
        </button>
      </div>

      <h1 className="text-4xl font-bold mb-2">Bienvenue, {currentUser.name}!</h1>
      <p className="text-gray-600 mb-8">
        {currentUser.role === 'mentor'
          ? 'Aide les étudiants à apprendre et à grandir'
          : 'Apprends auprès de mentors expérimentés'}
      </p>

      {/* Actions principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/messages"
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg hover:shadow-lg transition"
        >
          <div className="text-4xl mb-3">💬</div>
          <h2 className="text-xl font-semibold mb-2">Messages</h2>
          <p className="text-blue-100">
            {currentUser.role === 'mentor'
              ? 'Communique avec tes étudiants'
              : 'Discute avec tes mentors'}
          </p>
        </Link>

        <Link
          href="/profile"
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg hover:shadow-lg transition"
        >
          <div className="text-4xl mb-3">👤</div>
          <h2 className="text-xl font-semibold mb-2">Mon Profil</h2>
          <p className="text-purple-100">
            Affiche tes compétences et ton bio
          </p>
        </Link>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="text-xl font-semibold mb-2">Découverte</h2>
          <p className="text-green-100">
            {currentUser.role === 'mentor'
              ? 'Trouve des étudiants'
              : 'Trouve des mentors'}
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-secondary p-4 rounded-lg border border-border text-center">
          <div className="text-3xl font-bold text-blue-600">5</div>
          <p className="text-gray-600 text-sm">Conversations</p>
        </div>
        <div className="bg-secondary p-4 rounded-lg border border-border text-center">
          <div className="text-3xl font-bold text-purple-600">3</div>
          <p className="text-gray-600 text-sm">Connexions</p>
        </div>
        <div className="bg-secondary p-4 rounded-lg border border-border text-center">
          <div className="text-3xl font-bold text-green-600">8</div>
          <p className="text-gray-600 text-sm">Compétences</p>
        </div>
        <div className="bg-secondary p-4 rounded-lg border border-border text-center">
          <div className="text-3xl font-bold text-orange-600">15</div>
          <p className="text-gray-600 text-sm">Messages</p>
        </div>
      </div>
    </div>
  );
}
