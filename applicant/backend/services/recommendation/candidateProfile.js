const { GoogleGenerativeAI } = require('@google/generative-ai');
const { normalizeSkills } = require('./skillNormalization');
const { inferRoles } = require('./roleInference');
const { inferExperienceLevel } = require('./experienceInference');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extracts technical keywords from experience, projects, and certifications.
 * Uses Gemini for accurate keyword extraction.
 */
const extractExtraKeywords = async (structuredData) => {
  try {
    const textToScan = [
      ...(structuredData.experience || []).map(e => e.description),
      ...(structuredData.projects || []).map(p => p.description),
      ...(structuredData.certifications || []).map(c => c.name)
    ].filter(Boolean).join("\n\n");

    if (!textToScan.trim()) return [];

    const prompt = `
    Extract a JSON list of all technical skills, frameworks, tools, databases, and programming languages mentioned in the following text.
    Return ONLY a raw JSON array of strings without markdown formatting.
    Example output: ["React", "Node.js", "Docker", "MongoDB"]
    
    Text:
    ${textToScan}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up possible markdown or json formatting
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    const parsed = JSON.parse(cleanedText);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to extract extra keywords with Gemini:", error);
    return [];
  }
};

/**
 * Orchestrator to generate the Candidate Profile
 */
const generateCandidateProfile = async (structuredData) => {
  // 1. Get explicitly listed skills
  const explicitSkills = structuredData.skills || [];
  
  // 2. Extract implicit skills from experience, projects, etc.
  const implicitSkills = await extractExtraKeywords(structuredData);

  // 3. Combine and Normalize
  const allSkills = [...explicitSkills, ...implicitSkills];
  const normalizedSkills = normalizeSkills(allSkills);

  // 4. Infer Roles
  const inferredRoles = inferRoles(normalizedSkills);

  // 5. Determine Experience Level
  const experienceLevel = inferExperienceLevel(structuredData);

  return {
    skills: normalizedSkills,
    inferredRoles,
    experienceLevel,
    keywords: implicitSkills // For tracing what was found implicitly
  };
};

module.exports = {
  generateCandidateProfile
};
