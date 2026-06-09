const semanticMatcher = require('./semanticMatcher');

/**
 * Calculates Skill Match Score (0 - 100)
 * matchedSkills / requiredSkills
 */
const calculateSkillMatch = (candidateSkills, requiredSkills, preferredSkills = []) => {
  if (!requiredSkills || requiredSkills.length === 0) return 100;

  const candidateSet = new Set(candidateSkills.map(s => s.toLowerCase()));
  
  let matchedCount = 0;
  const matchedSkills = [];
  const missingSkills = [];

  // Required skills are heavily weighted
  requiredSkills.forEach(req => {
    if (candidateSet.has(req.toLowerCase())) {
      matchedCount++;
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  const baseScore = (matchedCount / requiredSkills.length) * 100;
  
  // Preferred skills add bonus points (up to 10% bonus)
  let bonus = 0;
  if (preferredSkills.length > 0) {
    let prefMatchCount = 0;
    preferredSkills.forEach(pref => {
      if (candidateSet.has(pref.toLowerCase())) prefMatchCount++;
    });
    bonus = (prefMatchCount / preferredSkills.length) * 10;
  }

  return {
    score: Math.min(100, baseScore + bonus),
    matchedSkills,
    missingSkills
  };
};

/**
 * Calculates Role Match Score (0 - 100)
 */
const calculateRoleMatch = (inferredRoles, jobRoleCategory) => {
  if (!jobRoleCategory || jobRoleCategory.length === 0) return 100;
  if (!inferredRoles || inferredRoles.length === 0) return 0;

  const rolesSet = new Set(inferredRoles.map(r => r.toLowerCase()));
  const matchedRoles = jobRoleCategory.filter(role => rolesSet.has(role.toLowerCase()));

  // If candidate has at least one role matching the job's role category, full points.
  // Otherwise, 0 points.
  return matchedRoles.length > 0 ? 100 : 0;
};

/**
 * Calculates Experience Match Score (0 - 100)
 */
const calculateExperienceMatch = (candidateLevel, jobExperienceRequiredInYears) => {
  // Mapping candidate level to an approximate numeric value for comparison
  const levelToYears = {
    'Fresher': 0,
    'Junior': 1,
    'Mid-Level': 3,
    'Senior': 5
  };

  const candidateYears = levelToYears[candidateLevel] || 0;
  const required = jobExperienceRequiredInYears || 0;

  if (candidateYears >= required) {
    return 100; // Has enough experience
  }

  // Deduct 25 points for every year short
  const diff = required - candidateYears;
  const score = Math.max(0, 100 - (diff * 25));
  
  return score;
};

/**
 * Computes final recommendation score for a single job against the candidate profile.
 */
const evaluateJobMatch = async (candidateProfile, jobIndex) => {
  // 1. Skill Match (50%)
  const { score: skillScore, matchedSkills, missingSkills } = calculateSkillMatch(
    candidateProfile.skills,
    jobIndex.requiredSkills,
    jobIndex.preferredSkills
  );

  // 2. Role Match (25%)
  const roleScore = calculateRoleMatch(candidateProfile.inferredRoles, jobIndex.roleCategory);

  // 3. Experience Match (10%)
  const expScore = calculateExperienceMatch(candidateProfile.experienceLevel, jobIndex.experienceRequired);

  // 4. Semantic Match (15%) - Async
  const semanticScore = await semanticMatcher.getSemanticMatchScore(candidateProfile, jobIndex);

  // Weighted Total
  const finalScore = (skillScore * 0.50) + (roleScore * 0.25) + (semanticScore * 0.15) + (expScore * 0.10);

  return {
    jobId: jobIndex.jobId || jobIndex.internshipId,
    title: jobIndex.title,
    matchScore: Math.round(finalScore),
    breakdown: {
      skillScore: Math.round(skillScore),
      roleScore: Math.round(roleScore),
      semanticScore: Math.round(semanticScore),
      expScore: Math.round(expScore)
    },
    matchedSkills,
    missingSkills,
    recommendedSkills: missingSkills // simple implementation for now
  };
};

/**
 * Evaluates a list of jobs and returns them ranked by match score.
 */
const rankJobs = async (candidateProfile, jobIndices) => {
  const promises = jobIndices.map(jobIndex => evaluateJobMatch(candidateProfile, jobIndex));
  const results = await Promise.all(promises);
  
  // Sort descending by score
  return results.sort((a, b) => b.matchScore - a.matchScore);
};

module.exports = {
  evaluateJobMatch,
  rankJobs
};
