'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'student' | 'mentor' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Vérifier si un rôle est déjà sélectionné
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      setSelectedRole(savedRole as 'student' | 'mentor');
    }
  }, []);

  const handleRoleSelect = (role: 'student' | 'mentor') => {
    setIsLoading(true);
    localStorage.setItem('userRole', role);
    setSelectedRole(role);
    
    // Rediriger vers le dashboard après 1 sec
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">MentorMatch</h1>
          <p className="text-xl text-gray-600">Choisis ton rôle pour commencer</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Étudiant */}
          <button
            onClick={() => handleRoleSelect('student')}
            disabled={isLoading}
            className={`p-8 rounded-xl border-2 transition-all ${
              selectedRole === 'student'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-5xl mb-4">👨‍🎓</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Étudiant</h2>
            <p className="text-gray-600 mb-6">
              Apprends de mentors expérimentés et développe tes compétences
            </p>
            <div className="text-sm text-gray-500">
              ✓ Trouve des mentors
              <br />✓ Communique avec eux
              <br />✓ Apprends et grandit
            </div>
            {selectedRole === 'student' && (
              <div className="mt-4 text-blue-600 font-semibold">✓ Sélectionné</div>
            )}
          </button>

          {/* Mentor */}
          <button
            onClick={() => handleRoleSelect('mentor')}
            disabled={isLoading}
            className={`p-8 rounded-xl border-2 transition-all ${
              selectedRole === 'mentor'
                ? 'border-purple-500 bg-purple-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="text-5xl mb-4">👨‍🏫</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Mentor</h2>
            <p className="text-gray-600 mb-6">
              Partage ton expertise et aide les étudiants à réussir
            </p>
            <div className="text-sm text-gray-500">
              ✓ Trouve des étudiants
              <br />✓ Partage tes connaissances
              <br />✓ Fais une différence
            </div>
            {selectedRole === 'mentor' && (
              <div className="mt-4 text-purple-600 font-semibold">✓ Sélectionné</div>
            )}
          </button>
        </div>

        {selectedRole && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">Redirection en cours...</p>
          </div>
        )}
      </div>
    </div>
  );
}
