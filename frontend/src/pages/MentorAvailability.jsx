import React, { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiClock, FiX, FiMove } from 'react-icons/fi';
import { BiCalendarEvent } from 'react-icons/bi';
import api from '../services/api';

const MentorAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [draggedSlot, setDraggedSlot] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [clickedSlot, setClickedSlot] = useState(null); // Pour stocker la case cliquée

  // Form state
  const [formData, setFormData] = useState({
    startDateTime: '',
    endDateTime: '',
    type: 'virtual',
    location: '',
    meetingLink: '',
    notes: ''
  });

  // Charger les plages
  const loadSlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user._id) {
        setError('Utilisateur non connecté');
        return;
      }
      const response = await api.availabilityAPI.getMentorSlots(user._id);
      setSlots(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des plages:', error);
      setError('Erreur lors du chargement des plages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  // Ajouter ou modifier une plage
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingSlot) {
        await api.availabilityAPI.updateSlot(editingSlot._id, formData);
      } else {
        await api.availabilityAPI.createSlot(formData);
      }
      setShowModal(false);
      resetForm();
      setClickedSlot(null);
      loadSlots();
    } catch (error) {
      console.error('Erreur:', error);
      setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const resetForm = () => {
    setFormData({
      startDateTime: '',
      endDateTime: '',
      type: 'virtual',
      location: '',
      meetingLink: '',
      notes: ''
    });
    setEditingSlot(null);
    setClickedSlot(null);
  };

  // Gérer le clic sur une case vide pour créer un créneau
  const handleCellClick = (date, hour) => {
    const slot = getSlotAtTime(date, hour);
    if (!slot) {
      // Case vide - créer nouveau créneau
      const startDate = new Date(date);
      startDate.setHours(hour, 0, 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(hour + 1, 0, 0, 0);
      
      setFormData({
        startDateTime: startDate.toISOString().slice(0, 16),
        endDateTime: endDate.toISOString().slice(0, 16),
        type: 'virtual',
        location: '',
        meetingLink: '',
        notes: ''
      });
      setClickedSlot({ date, hour });
      setShowModal(true);
    }
  };

  // Supprimer une plage
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce créneau?')) {
      try {
        setError(null);
        await api.availabilityAPI.deleteSlot(id);
        loadSlots();
      } catch (error) {
        console.error('Erreur:', error);
        setError('Erreur lors de la suppression');
      }
    }
  };

  // Éditer une plage
  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      startDateTime: slot.startDateTime?.slice(0, 16) || '',
      endDateTime: slot.endDateTime?.slice(0, 16) || '',
      type: slot.type || 'virtual',
      location: slot.location || '',
      meetingLink: slot.meetingLink || '',
      notes: slot.notes || ''
    });
    setShowModal(true);
  };

  // Génération de la semaine
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

  // Génération des heures
  const hours = Array.from({ length: 10 }, (_, i) => 8 + i);

  // Obtenir les slots pour une date et heure spécifique
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

  // Drag and drop
  const handleDragStart = (e, slot) => {
    setDraggedSlot(slot);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, date, hour) => {
    e.preventDefault();
    if (!draggedSlot) return;

    try {
      const newStart = new Date(date);
      newStart.setHours(hour, 0, 0, 0);
      
      const duration = 
        new Date(draggedSlot.endDateTime).getHours() - 
        new Date(draggedSlot.startDateTime).getHours();
      
      const newEnd = new Date(newStart);
      newEnd.setHours(newEnd.getHours() + duration);

      await api.availabilityAPI.updateSlot(draggedSlot._id, {
        startDateTime: newStart.toISOString(),
        endDateTime: newEnd.toISOString(),
        type: draggedSlot.type,
        location: draggedSlot.location,
        meetingLink: draggedSlot.meetingLink,
        notes: draggedSlot.notes
      });

      loadSlots();
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du déplacement du créneau');
    } finally {
      setDraggedSlot(null);
    }
  };

  const weekDays = getWeekDays();
  const today = new Date().toDateString();

  if (loading && slots.length === 0) {
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <BiCalendarEvent size={40} className="text-blue-600" />
            Mes Disponibilités
          </h1>
          <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
            💡 Cliquez sur une case vide pour ajouter un créneau
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <FiX size={20} />
            </button>
          </div>
        )}

        {/* Calendar View */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Navigation */}
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

            {/* Calendar Grid */}
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
                        return (
                          <td
                            key={`${day.toISOString()}-${hour}`}
                            className={`p-3 border-l min-h-20 transition-colors ${
                              slot ? 'cursor-move' : 'cursor-pointer hover:bg-blue-100'
                            } ${draggedSlot ? 'bg-green-50' : ''}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, day, hour)}
                            onClick={() => !slot && handleCellClick(day, hour)}
                          >
                            {slot ? (
                              <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, slot)}
                                className={`p-3 rounded-lg text-white font-semibold text-sm cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg transition-all ${
                                  slot.type === 'virtual'
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                                    : slot.type === 'in-person'
                                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                                    : 'bg-gradient-to-r from-purple-500 to-purple-600'
                                }`}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <FiMove size={14} />
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
                                {slot.isBooked && (
                                  <div className="text-xs mt-1 bg-white bg-opacity-20 px-2 py-1 rounded">
                                    ✓ Réservé
                                  </div>
                                )}
                                <div className="flex gap-1 mt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(slot);
                                    }}
                                    className="p-1 hover:bg-white hover:bg-opacity-30 rounded transition"
                                    title="Éditer"
                                  >
                                    <FiEdit2 size={12} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(slot._id);
                                    }}
                                    className="p-1 hover:bg-white hover:bg-opacity-30 rounded transition"
                                    title="Supprimer"
                                  >
                                    <FiTrash2 size={12} />
                                  </button>
                                </div>
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

            {/* Legend */}
            <div className="p-4 bg-gray-50 border-t flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
                <span className="text-sm text-gray-700">Virtual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
                <span className="text-sm text-gray-700">In-person</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded"></div>
                <span className="text-sm text-gray-700">Hybrid</span>
              </div>
            </div>
          </div>
        </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingSlot ? 'Modifier' : 'Ajouter'} un créneau
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Début *</label>
                <input
                  type="datetime-local"
                  value={formData.startDateTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startDateTime: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Fin *</label>
                <input
                  type="datetime-local"
                  value={formData.endDateTime}
                  onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="virtual">Virtual</option>
                  <option value="in-person">In-person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Lieu</label>
                <input
                  type="text"
                  placeholder="Ex: Café Einstein, Zoom..."
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Lien de réunion</label>
                <input
                  type="url"
                  placeholder="https://zoom.us/..."
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Notes</label>
                <textarea
                  placeholder="Ex: Préparation pour l'entretien..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-4 py-2 hover:shadow-lg transition"
                >
                  {editingSlot ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorAvailability;
