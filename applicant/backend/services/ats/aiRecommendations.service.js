const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Generates AI recommendations based on structured resume.
 * @param {Object} structuredData 
 * @returns {Promise<Object>} Object containing strengths, weaknesses, recommendations
 */
const generateAIRecommendations = async (structuredData) => {
  const prompt = `
You are a senior technical recruiter.
Analyze this structured resume.
Provide exactly 3 strengths, 3 weaknesses, and 3 actionable recommendations.

Return STRICT JSON only, matching this schema exactly:
{
  "strengths": ["", "", ""],
  "weaknesses": ["", "", ""],
  "recommendations": ["", "", ""]
}

Resume Data:
${JSON.stringify(structuredData)}
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

    try {
      const parsedJson = JSON.parse(textResponse);
      return {
        strengths: Array.isArray(parsedJson.strengths) ? parsedJson.strengths : [],
        weaknesses: Array.isArray(parsedJson.weaknesses) ? parsedJson.weaknesses : [],
        recommendations: Array.isArray(parsedJson.recommendations) ? parsedJson.recommendations : []
      };
    } catch (parseError) {
      console.error('Failed to parse recommendations JSON:', textResponse);
      return { strengths: [], weaknesses: [], recommendations: [] };
    }
  } catch (error) {
    console.error('AI Recommendations Error:', error);
    return { strengths: [], weaknesses: [], recommendations: [] };
  }
};

module.exports = {
  generateAIRecommendations
};
