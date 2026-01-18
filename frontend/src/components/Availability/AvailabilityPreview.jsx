import React from 'react';
import { FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const AvailabilityPreview = ({ mentorId, availableSlots = [] }) => {
  const navigate = useNavigate();

  if (!availableSlots || availableSlots.length === 0) {
    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-600 text-sm">
        Aucune plage disponible pour le moment
      </div>
    );
  }

  // Afficher les 3 prochaines plages
  const nextSlots = availableSlots
    .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime))
    .slice(0, 3);

  return (
    <div className="mt-4">
      <div className="space-y-2">
        {nextSlots.map(slot => {
          const startDate = new Date(slot.startDateTime);
          const isToday = startDate.toDateString() === new Date().toDateString();
          const isTomorrow =
            startDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

          return (
            <div key={slot._id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                  <FiCalendar size={12} />
                  {isToday
                    ? "Aujourd'hui"
                    : isTomorrow
                    ? 'Demain'
                    : startDate.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <FiClock size={12} />
                  {startDate.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  ({slot.duration} min)
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                slot.type === 'virtual'
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-green-200 text-green-800'
              }`}>
                {slot.type === 'virtual' ? '🎥' : '📍'}
              </span>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate(`/book-availability/${mentorId}`)}
        className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
      >
        Voir toutes les plages <FiArrowRight size={16} />
      </button>
    </div>
  );
};

export default AvailabilityPreview;
