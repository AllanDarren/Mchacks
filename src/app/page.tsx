'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4">MentorMatch</h1>
        <p className="text-xl text-gray-600 mb-12">
          Connecte-toi avec des mentors et des étudiants. Apprends ensemble.
        </p>
        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          <Link
            href="/signup"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
          >
            Créer un Compte
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold text-lg"
          >
            Accéder à Mon Compte
          </Link>
        </div>
      </div>
    </main>
  );
}
