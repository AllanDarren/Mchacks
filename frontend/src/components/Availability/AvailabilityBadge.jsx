import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiVideo } from 'react-icons/fi';
import { availabilityAPI } from '../../services/api';

/**
 * Composant pour afficher l'availability status d'un mentor sur sa carte
 * Utilisation: <AvailabilityBadge mentorId={mentorId} />
 */
const AvailabilityBadge = ({ mentorId, className = '' }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, [mentorId]);

  const loadStatus = async () => {
    try {
      const response = await availabilityAPI.getAvailableSlots(mentorId);
      const slots = response.data;

      if (slots.length === 0) {
        setStatus({ available: false, message: 'Non disponible' });
      } else {
        const nextSlot = slots[0];
        const startDate = new Date(nextSlot.startDateTime);
        const now = new Date();
        const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));

        let timeLabel = '';
        if (daysUntil === 0) {
          timeLabel = "Aujourd'hui";
        } else if (daysUntil === 1) {
          timeLabel = 'Demain';
        } else if (daysUntil < 7) {
          timeLabel = `Dans ${daysUntil} j`;
        } else {
          timeLabel = startDate.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
        }

        setStatus({
          available: true,
          message: `Disponible ${timeLabel}`,
          nextSlot,
          slotsCount: slots.length
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      setStatus({ available: false, message: 'Information indisponible' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!status) {
    return null;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        status.available
          ? 'bg-green-100 text-green-800 border border-green-300'
          : 'bg-gray-100 text-gray-600 border border-gray-300'
      } ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${status.available ? 'bg-green-500' : 'bg-gray-400'}`}></span>
      {status.message}
    </div>
  );
};

export default AvailabilityBadge;
