import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiVideo, FiX, FiArrowLeft } from 'react-icons/fi';
import { BiCalendarEvent } from 'react-icons/bi';
import api from '../services/api';
import Dialog from '../components/Common/Dialog';

const StudentBookAvailability = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();

  const [mentor, setMentor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingNotes, setBookingNotes] = useState('');
  const [currentWeek, setCurrentWeek] = useState(0);
  const [error, setError] = useState(null);
  const [dialog, setDialog] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const mentorResponse = await api.usersAPI.getProfile(mentorId);
      setMentor(mentorResponse.data);

      const slotsResponse = await api.availabilityAPI.getAvailableSlots(mentorId);
      setSlots(slotsResponse.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [mentorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBooking = async () => {
    if (!selectedSlot) return;

    try {
      setLoading(true);
      setError(null);
      await api.availabilityAPI.bookSlot(selectedSlot._id, { notes: bookingNotes });
      setDialog({ isOpen: true, title: 'Success', message: 'Appointment booked successfully! 🎉', type: 'success' });
      setShowBookingModal(false);
      setSelectedSlot(null);
      setBookingNotes('');
      loadData();
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      setError(error.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1 + currentWeek * 7);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const hours = Array.from({ length: 10 }, (_, i) => 8 + i);

  const getSlotAtTime = (date, hour) => {
    const dateStr = date.toDateString();
    return slots.find(slot => {
      const slotStart = new Date(slot.startDateTime);
      const slotEnd = new Date(slot.endDateTime);
      return (
        slotStart.toDateString() === dateStr &&
        slotStart.getHours() <= hour &&
        slotEnd.getHours() > hour
      );
    });
  };

  const weekDays = getWeekDays();
  const today = new Date().toDateString();

  if (loading && !mentor) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <FiArrowLeft size={20} />
          Retour
        </button>

        {mentor && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 mb-8 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                {mentor.profilePicture ? (
                  <img
                    src={mentor.profilePicture}
                    alt={`${mentor.firstName} ${mentor.lastName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {mentor.firstName?.[0]}{mentor.lastName?.[0]}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {mentor.firstName} {mentor.lastName}
                </h1>
                {mentor.mentorInfo?.currentJob && (
                  <p className="text-blue-100 text-lg">
                    {mentor.mentorInfo.currentJob}
                    {mentor.mentorInfo?.company && ` @ ${mentor.mentorInfo.company}`}
                  </p>
                )}
                {mentor.mentorInfo?.expertise && mentor.mentorInfo.expertise.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mentor.mentorInfo.expertise.map((exp, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/20 rounded-full text-sm"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <FiX size={20} />
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <button
              onClick={() => setCurrentWeek(currentWeek - 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              ← Semaine précédente
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              Semaine du {weekDays[0].toLocaleDateString('fr-FR')} au {weekDays[6].toLocaleDateString('fr-FR')}
            </h2>
            <button
              onClick={() => setCurrentWeek(currentWeek + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Semaine suivante →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-4 text-left font-semibold text-gray-700 w-16">Heure</th>
                  {weekDays.map((day) => (
                    <th
                      key={day.toISOString()}
                      className={`p-4 text-center font-semibold ${
                        day.toDateString() === today
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-700'
                      }`}
                    >
                      <div>{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                      <div className="text-sm">{day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour) => (
                  <tr key={hour} className="border-b hover:bg-blue-50 transition">
                    <td className="p-4 font-semibold text-gray-700 bg-gray-50 text-center w-16">
                      {hour}:00
                    </td>
                    {weekDays.map((day) => {
                      const slot = getSlotAtTime(day, hour);
                      const isBooked = slot?.isBooked;
                      
                      return (
                        <td
                          key={`${day.toISOString()}-${hour}`}
                          className={`p-3 border-l min-h-20 ${
                            slot && !isBooked ? 'cursor-pointer' : ''
                          }`}
                          onClick={() => {
                            if (slot && !isBooked) {
                              setSelectedSlot(slot);
                              setShowBookingModal(true);
                            }
                          }}
                        >
                          {slot ? (
                            <div
                              className={`p-3 rounded-lg font-semibold text-sm shadow-md transition-all ${
                                isBooked
                                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                  : slot.type === 'virtual'
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg hover:scale-105'
                                  : slot.type === 'in-person'
                                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:scale-105'
                                  : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                              }`}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                {slot.type === 'virtual' ? <FiVideo size={14} /> : <FiMapPin size={14} />}
                                <span>{slot.type}</span>
                              </div>
                              <div className="text-xs opacity-90">
                                {new Date(slot.startDateTime).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                                -
                                {new Date(slot.endDateTime).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                              {isBooked && (
                                <div className="text-xs mt-1 bg-white bg-opacity-30 px-2 py-1 rounded">
                                  ✓ Réservé
                                </div>
                              )}
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50 border-t flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
              <span className="text-sm text-gray-700">Virtual - Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
              <span className="text-sm text-gray-700">In-person - Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-sm text-gray-700">Réservé</span>
            </div>
          </div>

          {slots.length === 0 && (
            <div className="text-center py-12">
              <BiCalendarEvent size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Ce mentor n'a pas encore de disponibilités</p>
            </div>
          )}
        </div>
      </div>

      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Réserver ce créneau</h2>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedSlot(null);
                  setBookingNotes('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FiCalendar className="text-blue-600" />
                <span className="font-semibold">
                  {new Date(selectedSlot.startDateTime).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <FiClock className="text-blue-600" />
                <span>
                  {new Date(selectedSlot.startDateTime).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}{' '}
                  -{' '}
                  {new Date(selectedSlot.endDateTime).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedSlot.type === 'virtual' ? <FiVideo className="text-blue-600" /> : <FiMapPin className="text-blue-600" />}
                <span className="capitalize">{selectedSlot.type}</span>
              </div>
              {selectedSlot.location && (
                <p className="text-sm text-gray-600 mt-2">📍 {selectedSlot.location}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Notes (optionnel)
              </label>
              <textarea
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                placeholder="Ex: Sujets à discuter, questions spécifiques..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedSlot(null);
                  setBookingNotes('');
                }}
                className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleBooking}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-4 py-2 hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? 'Réservation...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />
    </div>
  );
};

export default StudentBookAvailability;
