const { semanticSkillMatch, normalizeSkills } = require('./semanticMatcher.service');
const compromise = require('compromise');
const stopword = require('stopword');

/**
 * Extracts potential skills from a job description text.
 * @param {string} jdText 
 * @returns {Array<string>} Extracted skills
 */
const extractSkillsFromJD = (jdText) => {
  if (!jdText) return [];
  
  // Basic NLP noun extraction as a fallback if no explicit list is provided
  // In a production system, this would use an NER model or a comprehensive dictionary.
  const doc = compromise(jdText);
  let nouns = doc.nouns().out('array');
  
  // Clean up
  nouns = stopword.removeStopwords(nouns);
  
  // Filter and normalize
  const uniqueSkills = [...new Set(nouns.map(n => n.toLowerCase().trim()))];
  return uniqueSkills.filter(n => n.length > 2 && n.length < 20);
};

/**
 * Generates skill gap analysis based on resume and JD.
 * @param {Array<string>} resumeSkills 
 * @param {Array<string>|string} jdData (Array of skills or raw JD text)
 * @returns {Object} Gap analysis
 */
const generateSkillGapAnalysis = (resumeSkills, jdData) => {
  let jdSkills = [];
  
  if (Array.isArray(jdData)) {
    jdSkills = jdData;
  } else if (typeof jdData === 'string') {
    jdSkills = extractSkillsFromJD(jdData);
  }

  if (jdSkills.length === 0) {
    return {
      matchedSkills: [],
      missingSkills: [],
      recommendedSkills: []
    };
  }

  const matchedSkills = semanticSkillMatch(resumeSkills, jdSkills);
  
  const matchedNormalized = normalizeSkills(matchedSkills);
  const jdNormalized = normalizeSkills(jdSkills);
  
  const missingSkills = [];
  jdNormalized.forEach((skill, index) => {
    if (!matchedNormalized.includes(skill)) {
      missingSkills.push(jdSkills[index]);
    }
  });

  return {
    matchedSkills,
    missingSkills,
    recommendedSkills: missingSkills.slice(0, 5) // Recommend top 5 missing skills
  };
};

module.exports = {
  generateSkillGapAnalysis,
  extractSkillsFromJD
};
