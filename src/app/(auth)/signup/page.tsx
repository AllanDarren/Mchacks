'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'mentor'>('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Le nom est requis');
      return;
    }

    setIsLoading(true);

    try {
      // Créer un ID unique pour l'utilisateur
      const userId = `user_${Date.now()}`;
      
      // Sauvegarder l'utilisateur dans localStorage
      const user = {
        id: userId,
        name: fullName,
        role: role,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(`user_${userId}`, JSON.stringify(user));
      localStorage.setItem('currentUserId', userId);

      // Redirection vers dashboard
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
      <h1 className="text-3xl font-bold mb-2">Créer un Compte</h1>
      <p className="text-gray-600 mb-6">Rejoins MentorMatch en quelques secondes!</p>

      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Ton Nom</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Jean Dupont"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ton Rôle</label>
          <div className="space-y-3">
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition hover:bg-blue-50" style={{borderColor: role === 'student' ? '#3b82f6' : '#d1d5db'}}>
              <input
                type="radio"
                value="student"
                checked={role === 'student'}
                onChange={(e) => setRole(e.target.value as 'student' | 'mentor')}
                className="w-4 h-4"
                disabled={isLoading}
              />
              <span className="ml-3">
                <span className="block font-semibold">👨‍🎓 Étudiant</span>
                <span className="text-sm text-gray-600">Apprends de mentors expérimentés</span>
              </span>
            </label>

            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition hover:bg-purple-50" style={{borderColor: role === 'mentor' ? '#a855f7' : '#d1d5db'}}>
              <input
                type="radio"
                value="mentor"
                checked={role === 'mentor'}
                onChange={(e) => setRole(e.target.value as 'student' | 'mentor')}
                className="w-4 h-4"
                disabled={isLoading}
              />
              <span className="ml-3">
                <span className="block font-semibold">👨‍🏫 Mentor</span>
                <span className="text-sm text-gray-600">Partage ton expertise</span>
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !fullName.trim()}
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-semibold disabled:opacity-50"
        >
          {isLoading ? 'Création en cours...' : 'Créer mon Compte'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        Tu as déjà un compte?{' '}
        <Link href="/login" className="text-primary hover:underline font-semibold">
          Connecte-toi
        </Link>
      </p>
    </div>
  );
}
