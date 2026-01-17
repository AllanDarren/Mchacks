// Algorithme de matching simple basé sur les intérêts
exports.calculateMatchScore = (student, mentor) => {
  if (!student.studentInfo || !student.studentInfo.interests || 
      !mentor.mentorInfo || !mentor.mentorInfo.expertise) {
    return 0;
  }

  const studentInterests = student.studentInfo.interests;
  const mentorExpertise = mentor.mentorInfo.expertise;

  // Calculer le nombre d'intérêts communs
  const commonInterests = studentInterests.filter(interest => 
    mentorExpertise.includes(interest)
  );

  // Score basé sur le pourcentage d'intérêts correspondants
  const score = (commonInterests.length / studentInterests.length) * 100;

  return Math.round(score);
};

// Trier les mentors par score de compatibilité
exports.sortByMatchScore = (student, mentors) => {
  return mentors
    .map(mentor => ({
      ...mentor.toObject(),
      matchScore: exports.calculateMatchScore(student, mentor)
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
};
