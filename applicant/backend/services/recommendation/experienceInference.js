/**
 * Infers candidate experience level from structured resume data.
 * Returns one of: 'Fresher', 'Junior', 'Mid-Level', 'Senior'
 */

const inferExperienceLevel = (structuredData) => {
  const { experience = [], projects = [] } = structuredData;
  
  let totalYearsOfExperience = 0;
  let hasInternships = false;
  let hasFullTime = false;
  let leadershipKeywords = ['lead', 'managed', 'mentor', 'architect', 'head', 'director', 'principal'];
  let isLeader = false;

  experience.forEach(exp => {
    // Check if internship
    const title = (exp.jobTitle || '').toLowerCase();
    if (title.includes('intern') || title.includes('trainee')) {
      hasInternships = true;
    } else {
      hasFullTime = true;
    }

    // Check for leadership
    if (leadershipKeywords.some(keyword => title.includes(keyword))) {
      isLeader = true;
    }
    
    // Estimate years from dates (very basic estimation)
    // Most dates are like "Jan 2020 - Present" or "2018 - 2020"
    const startDateStr = exp.startDate || '';
    const endDateStr = exp.endDate || '';
    
    let startYear = parseInt(startDateStr.match(/\d{4}/)?.[0]);
    let endYear = endDateStr.toLowerCase().includes('present') ? new Date().getFullYear() : parseInt(endDateStr.match(/\d{4}/)?.[0]);
    
    if (startYear && endYear && endYear >= startYear) {
      // Adding 0.5 to account for partial years
      totalYearsOfExperience += (endYear - startYear) + 0.5;
    }
  });

  // Calculate project complexity weight
  const projectCount = projects.length;

  // Inference Logic
  if (totalYearsOfExperience >= 5 || isLeader) {
    return 'Senior';
  }
  
  if (totalYearsOfExperience >= 2 && totalYearsOfExperience < 5) {
    return 'Mid-Level';
  }

  if (totalYearsOfExperience > 0 && totalYearsOfExperience < 2) {
    return 'Junior';
  }

  // If no full time experience, but has internships or projects
  if (hasInternships) {
    return 'Fresher'; // or Junior depending on internships, sticking to Fresher for new grads
  }

  if (projectCount > 3) {
    return 'Fresher';
  }

  // Default
  return 'Fresher';
};

module.exports = {
  inferExperienceLevel
};
