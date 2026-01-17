import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            MentorConnect
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connectez-vous avec des mentors professionnels et explorez votre avenir
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-lg"
            >
              Commencer
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-white hover:bg-gray-50 text-indigo-600 font-medium rounded-lg text-lg border-2 border-indigo-600"
            >
              Se connecter
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-bold mb-2">Pour les étudiants</h3>
            <p className="text-gray-600">
              Trouvez des mentors dans votre domaine d'intérêt et obtenez des conseils professionnels
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-bold mb-2">Pour les mentors</h3>
            <p className="text-gray-600">
              Partagez votre expérience et guidez la prochaine génération de professionnels
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2">Connexions authentiques</h3>
            <p className="text-gray-600">
              Messagerie en temps réel, sessions virtuelles et rencontres en personne
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
