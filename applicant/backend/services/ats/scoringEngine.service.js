const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const { semanticSkillMatch } = require('./semanticMatcher.service');
const { extractSkillsFromJD } = require('./skillGapAnalysis.service');

const calculateCompletenessScore = (structuredData) => {
  let score = 0;
  if (structuredData.email) score += 3;
  if (structuredData.phone) score += 3;
  if (structuredData.linkedin) score += 3;
  if (structuredData.skills && structuredData.skills.length > 0) score += 3;
  if (structuredData.projects && structuredData.projects.length > 0) score += 3;
  if (structuredData.experience && structuredData.experience.length > 0) score += 3;
  if (structuredData.education && structuredData.education.length > 0) score += 2;
  return score; // Max 20
};

const calculateFormattingScore = (rawText, structuredData) => {
  let score = 15;
  // Basic checks for problematic formatting in raw text
  if (rawText.length > 0) {
    const whitespaceRatio = (rawText.match(/\s/g) || []).length / rawText.length;
    if (whitespaceRatio > 0.4) score -= 2; // Unusual spacing
    if (rawText.includes('\u0000')) score -= 2; // Hidden chars
    if ((rawText.match(/\|/g) || []).length > 20) score -= 3; // Excessive table-like pipes
  }
  return Math.max(0, score);
};

const calculateKeywordCoverage = (resumeSkills, jdText) => {
  if (!jdText) return 25; // If no JD provided, award full points or handle accordingly
  
  const jdSkills = extractSkillsFromJD(jdText);
  if (jdSkills.length === 0) return 25;

  const matchedSkills = semanticSkillMatch(resumeSkills, jdSkills);
  const coverage = matchedSkills.length / jdSkills.length;
  
  // Math.min to cap at 25 in case of edge cases
  return Math.min(25, Math.round(coverage * 25));
};

const calculateExperienceQuality = (experienceList) => {
  if (!experienceList || experienceList.length === 0) return 0;
  
  const actionVerbs = ['built', 'developed', 'designed', 'implemented', 'optimized', 'led', 'improved', 'managed', 'created', 'architected'];
  let score = 0;
  
  experienceList.forEach(exp => {
    let expScore = 0;
    const desc = exp.description ? exp.description.toLowerCase() : '';
    
    // Check for action verbs
    const hasActionVerb = actionVerbs.some(verb => desc.includes(verb));
    if (hasActionVerb) expScore += 2;
    
    // Check for metrics (% or numbers like 10x, 500k)
    if (/[0-9]+%|[0-9]+x|[0-9]+k|\$[0-9]+/i.test(desc)) expScore += 3;
    
    // Check for length
    if (desc.length > 50) expScore += 1;
    
    score += expScore;
  });
  
  // Cap at 15
  return Math.min(15, score);
};

const calculateProjectQuality = (projectList) => {
  if (!projectList || projectList.length === 0) return 0;
  
  let score = 0;
  projectList.forEach(proj => {
    let projScore = 0;
    const desc = proj.description ? proj.description.toLowerCase() : '';
    const link = proj.link ? proj.link.toLowerCase() : '';
    
    if (link.includes('github.com') || link.includes('gitlab.com')) projScore += 2;
    if (link.includes('http') && !link.includes('github.com')) projScore += 1; // live link
    
    if (desc.length > 50) projScore += 1;
    if (/[0-9]+%|[0-9]+x|[0-9]+k/i.test(desc)) projScore += 2;
    
    score += projScore;
  });
  
  return Math.min(15, score);
};

const calculateGrammarScore = async (rawText) => {
  if (!rawText) return 0;
  
  const prompt = `
Evaluate the grammar and spelling quality of this text.
Return strictly JSON matching this format:
{ "grammarScore": 8 } // Score from 0 to 10

Text:
${rawText.substring(0, 5000)} // sample for grammar
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let textResponse = response.text();
    
    if (textResponse.startsWith('\`\`\`json')) {
      textResponse = textResponse.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
    } else if (textResponse.startsWith('\`\`\`')) {
      textResponse = textResponse.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');
    }
    
    const parsed = JSON.parse(textResponse);
    return Math.min(10, Math.max(0, parsed.grammarScore || 8));
  } catch (error) {
    console.error('Grammar score error:', error);
    return 8; // fallback
  }
};

const aggregateScore = (scores) => {
  const sum = scores.completeness + scores.formatting + scores.keywordCoverage + 
              scores.experienceQuality + scores.projectQuality + scores.grammar;
  return Math.min(100, Math.max(0, Math.round(sum)));
};

const generateGrade = (score) => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'Needs Improvement';
};

module.exports = {
  calculateCompletenessScore,
  calculateFormattingScore,
  calculateKeywordCoverage,
  calculateExperienceQuality,
  calculateProjectQuality,
  calculateGrammarScore,
  aggregateScore,
  generateGrade
};
