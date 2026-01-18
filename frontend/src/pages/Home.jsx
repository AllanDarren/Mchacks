import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            MentorShip
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with professional mentors and explore your future
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-lg"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-white hover:bg-gray-50 text-indigo-600 font-medium rounded-lg text-lg border-2 border-indigo-600"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-bold mb-2">For Students</h3>
            <p className="text-gray-600">
              Find mentors in your field of interest and get professional advice
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-bold mb-2">For Mentors</h3>
            <p className="text-gray-600">
              Share your experience and guide the next generation of professionals
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2">Authentic Connections</h3>
            <p className="text-gray-600">
              Real-time messaging, virtual sessions, and in-person meetings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
