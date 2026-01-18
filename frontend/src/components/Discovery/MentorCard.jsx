import React from 'react';

const MentorCard = ({ mentor, onConnect }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            {mentor.profilePicture ? (
              <img
                src={mentor.profilePicture}
                alt={`${mentor.firstName} ${mentor.lastName}`}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-indigo-600">
                {mentor.firstName?.[0]}{mentor.lastName?.[0]}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">
              {mentor.firstName} {mentor.lastName}
            </h3>
            <p className="text-sm text-gray-600">{mentor.mentorInfo?.currentJob}</p>
            <p className="text-sm text-gray-500">{mentor.mentorInfo?.company}</p>
          </div>
        </div>

        {mentor.mentorInfo?.bio && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-3">{mentor.mentorInfo.bio}</p>
        )}

        {mentor.mentorInfo?.industry && (
          <div className="mb-3">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              {mentor.mentorInfo.industry}
            </span>
          </div>
        )}

        {mentor.mentorInfo?.expertise && mentor.mentorInfo.expertise.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Expertise:</p>
            <div className="flex flex-wrap gap-2">
              {mentor.mentorInfo.expertise.slice(0, 3).map((exp, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onConnect(mentor._id)}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorCard;
