'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  role: 'student' | 'mentor';
}

export default function LoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Charger tous les utilisateurs depuis localStorage
    const allUsers: User[] = [];
    for (const key in localStorage) {
      if (key.startsWith('user_')) {
        const userData = localStorage.getItem(key);
        if (userData) {
          try {
            allUsers.push(JSON.parse(userData));
          } catch (e) {
            console.error('Erreur lors de la lecture de l\'utilisateur', e);
          }
        }
      }
    }
    setUsers(allUsers);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedUserId) {
      setError('Sélectionne un compte');
      return;
    }

    setIsLoading(true);

    try {
      localStorage.setItem('currentUserId', selectedUserId);
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err) {
      setError('Une erreur est survenue. Essaie à nouveau.');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-bold mb-2">Accès à Mon Compte</h1>
      <p className="text-gray-600 mb-6">Sélectionne un compte pour continuer</p>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            {error}
          </div>
        )}

        {users.length === 0 ? (
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <p className="text-gray-700 mb-4">Aucun compte trouvé</p>
            <Link
              href="/signup"
              className="text-blue-600 hover:underline font-semibold"
            >
              Créer un compte
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-medium mb-2">Mes Comptes</label>
            {users.map((user) => (
              <label
                key={user.id}
                className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition hover:bg-blue-50"
                style={{
                  borderColor: selectedUserId === user.id ? '#3b82f6' : '#d1d5db',
                  backgroundColor: selectedUserId === user.id ? '#eff6ff' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  value={user.id}
                  checked={selectedUserId === user.id}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-4 h-4"
                  disabled={isLoading}
                />
                <span className="ml-4 flex-1">
                  <span className="block font-semibold">
                    {user.role === 'mentor' ? '👨‍🏫' : '👨‍🎓'} {user.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    {user.role === 'mentor' ? 'Mentor' : 'Étudiant'}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !selectedUserId}
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50"
        >
          {isLoading ? 'Connexion...' : 'Se Connecter'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        Tu n'as pas de compte?{' '}
        <Link href="/signup" className="text-primary hover:underline font-semibold">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
