import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiVideo, FiX, FiUser, FiMail } from 'react-icons/fi';
import api from '../services/api';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('upcoming'); // upcoming, past, all
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await api.availabilityAPI.getStudentBookings();
      setBookings(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();
    let filtered = [...bookings];

    if (filter === 'upcoming') {
      filtered = filtered.filter(b => new Date(b.startDateTime) >= now);
    } else if (filter === 'past') {
      filtered = filtered.filter(b => new Date(b.startDateTime) < now);
    }

    return filtered.sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      await api.availabilityAPI.cancelBooking(selectedBooking._id);
      setShowCancelModal(false);
      setSelectedBooking(null);
      loadBookings();
      alert('Réservation annulée');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'annulation');
    }
  };

  const filteredBookings = getFilteredBookings();
  const now = new Date();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Mes Rendez-vous</h2>

        {/* Filtres */}
        <div className="flex gap-2">
          {['upcoming', 'past', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === f
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {f === 'upcoming'
                ? 'À venir'
                : f === 'past'
                ? 'Passés'
                : 'Tous'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FiCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">
            {filter === 'upcoming'
              ? 'Aucun rendez-vous à venir'
              : filter === 'past'
              ? 'Aucun rendez-vous passé'
              : 'Aucun rendez-vous'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map(booking => {
            const startDate = new Date(booking.startDateTime);
            const isPast = startDate < now;
            const mentor = booking.mentorId;

            return (
              <div
                key={booking._id}
                className={`bg-white border-l-4 rounded-lg p-4 shadow-md hover:shadow-lg transition ${
                  isPast ? 'border-gray-400 opacity-75' : 'border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* En-tête avec mentor info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        {mentor?.profilePicture ? (
                          <img
                            src={mentor.profilePicture}
                            alt={`${mentor.firstName} ${mentor.lastName}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold">
                            {mentor?.firstName?.[0]}{mentor?.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-lg">
                            {mentor?.firstName} {mentor?.lastName}
                          </span>
                        </div>
                        {mentor?.mentorInfo?.currentJob && (
                          <p className="text-sm text-gray-600">
                            {mentor.mentorInfo.currentJob}
                            {mentor.mentorInfo?.company && ` @ ${mentor.mentorInfo.company}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Type de rendez-vous */}
                    <div className="flex gap-2 mb-2">
                      {booking.type === 'virtual' ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          <FiVideo size={14} /> Virtuel
                        </span>
                      ) : booking.type === 'in-person' ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          <FiMapPin size={14} /> En personne
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          <FiMapPin size={14} /> Hybride
                        </span>
                      )}
                    </div>

                    {/* Date et heure */}
                    <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FiCalendar size={16} className="text-blue-600" />
                        <span className="font-medium">
                          {startDate.toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiClock size={16} className="text-blue-600" />
                        <span>
                          {startDate.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}{' '}
                          - {new Date(booking.endDateTime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}{' '}
                          <span className="text-gray-500">({booking.duration} min)</span>
                        </span>
                      </div>
                    </div>

                    {/* Localisation ou lien */}
                    {booking.type === 'in-person' && booking.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 mt-2 p-2 bg-green-50 rounded">
                        <FiMapPin size={14} className="text-green-600" />
                        <span>{booking.location}</span>
                      </div>
                    )}

                    {booking.type === 'virtual' && booking.meetingLink && (
                      <a
                        href={booking.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline mt-2 p-2 bg-blue-50 rounded font-medium"
                      >
                        <FiVideo size={14} />
                        Rejoindre la réunion
                      </a>
                    )}

                    {/* Contact */}
                    {mentor?.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                        <FiMail size={14} />
                        <a href={`mailto:${mentor.email}`} className="hover:text-blue-600">
                          {mentor.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Bouton d'annulation */}
                  {!isPast && (
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowCancelModal(true);
                      }}
                      className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                      title="Annuler la réservation"
                    >
                      <FiX size={20} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal d'annulation */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Annuler la réservation?
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir annuler la réservation avec{' '}
              <strong>
                {selectedBooking.mentorId?.firstName} {selectedBooking.mentorId?.lastName}
              </strong>{' '}
              le{' '}
              <strong>
                {new Date(selectedBooking.startDateTime).toLocaleDateString('fr-FR')}
              </strong>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Non, garder
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
