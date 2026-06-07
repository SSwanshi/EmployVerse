const natural = require('natural');
const stopword = require('stopword');

// Simple ontology mapping for common tech stacks
const techOntology = {
  'mern': ['mongodb', 'express', 'react', 'node', 'nodejs'],
  'mean': ['mongodb', 'express', 'angular', 'node', 'nodejs'],
  'frontend': ['html', 'css', 'javascript', 'react', 'vue', 'angular', 'typescript'],
  'backend': ['node', 'python', 'java', 'c#', 'ruby', 'go', 'express', 'django', 'spring'],
  'fullstack': ['react', 'node', 'javascript', 'database', 'mongodb', 'sql'],
  'data science': ['python', 'pandas', 'numpy', 'scikit-learn', 'machine learning', 'tensorflow'],
  'devops': ['aws', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'linux'],
  'aws': ['s3', 'ec2', 'lambda', 'dynamodb', 'cloud']
};

/**
 * Normalizes a list of skills for matching.
 */
const normalizeSkills = (skills) => {
  if (!skills || !Array.isArray(skills)) return [];
  return skills.map(skill => skill.toLowerCase().trim().replace(/[^a-z0-9+#]/g, ''));
};

/**
 * Semantically matches resume skills against JD skills.
 * @param {Array<string>} resumeSkills 
 * @param {Array<string>} jdSkills 
 * @returns {Array<string>} The list of matched JD skills
 */
const semanticSkillMatch = (resumeSkills, jdSkills) => {
  if (!resumeSkills || !jdSkills) return [];

  const normalizedResume = normalizeSkills(resumeSkills);
  const normalizedJd = normalizeSkills(jdSkills);
  
  const matched = new Set();

  normalizedJd.forEach((jdSkill, index) => {
    const originalJdSkill = jdSkills[index];

    // 1. Exact Match
    if (normalizedResume.includes(jdSkill)) {
      matched.add(originalJdSkill);
      return;
    }

    // 2. Ontology Match
    let foundViaOntology = false;
    for (const [key, relatedSkills] of Object.entries(techOntology)) {
      if (key === jdSkill || relatedSkills.includes(jdSkill)) {
        // If resume has the parent key (e.g. MERN) and JD asks for react
        if (normalizedResume.includes(key)) {
          matched.add(originalJdSkill);
          foundViaOntology = true;
          break;
        }
        // If resume has related skills but JD asks for parent key (e.g. MERN)
        if (jdSkill === key) {
          const hasRelated = relatedSkills.some(rs => normalizedResume.includes(rs));
          if (hasRelated) {
            matched.add(originalJdSkill);
            foundViaOntology = true;
            break;
          }
        }
      }
    }
    if (foundViaOntology) return;

    // 3. Jaro-Winkler Distance (Fuzzy Match for spelling errors)
    for (const resSkill of normalizedResume) {
      const distance = natural.JaroWinklerDistance(jdSkill, resSkill);
      if (distance > 0.85) { // 85% similarity threshold
        matched.add(originalJdSkill);
        break;
      }
    }
  });

  return Array.from(matched);
};

module.exports = {
  semanticSkillMatch,
  normalizeSkills
};
