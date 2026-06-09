const { GoogleGenerativeAI } = require('@google/generative-ai');
const JobIndex = require('../models/JobIndex');
const InternshipIndex = require('../models/InternshipIndex');
const { normalizeSkills } = require('../../../applicant/backend/services/recommendation/skillNormalization');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extracts structured indexing data from a job or internship description
 */
const extractIndexData = async (title, description, requirements) => {
  try {
    const textToScan = `Title: ${title}\nDescription: ${description}\nRequirements: ${requirements}`;

    const prompt = `
    Extract the following structured information from the job posting text below.
    Return ONLY raw JSON, with exactly these fields:
    {
      "requiredSkills": ["skill1", "skill2"],
      "preferredSkills": ["skill3", "skill4"],
      "roleCategory": ["Frontend Developer", "Backend Developer", etc]
    }
    
    Guidelines:
    - roleCategory should be one or more standard roles (e.g. "Full Stack Developer", "Data Scientist", "UI/UX Designer", "DevOps Engineer", "Frontend Developer", "Backend Developer").
    - requiredSkills are skills absolutely needed.
    - preferredSkills are nice-to-have. If not specified, put them in requiredSkills if they seem necessary.
    
    Text:
    ${textToScan}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
    const parsed = JSON.parse(cleanedText);
    
    return {
      requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
      preferredSkills: Array.isArray(parsed.preferredSkills) ? parsed.preferredSkills : [],
      roleCategory: Array.isArray(parsed.roleCategory) ? parsed.roleCategory : []
    };
  } catch (error) {
    console.error("Failed to extract index data with Gemini:", error);
    return { requiredSkills: [], preferredSkills: [], roleCategory: [] };
  }
};

/**
 * Index a Job
 */
const indexJob = async (job) => {
  try {
    const extracted = await extractIndexData(job.jobTitle, job.jobDescription, job.jobRequirements);
    
    const normalizedRequired = normalizeSkills(extracted.requiredSkills);
    const normalizedPreferred = normalizeSkills(extracted.preferredSkills);
    
    const updateData = {
      jobId: job._id,
      title: job.jobTitle,
      requiredSkills: normalizedRequired,
      preferredSkills: normalizedPreferred,
      experienceRequired: job.jobExperience || 0,
      roleCategory: extracted.roleCategory
    };

    await JobIndex.findOneAndUpdate(
      { jobId: job._id },
      { $set: updateData },
      { upsert: true, new: true }
    );
    console.log(`Successfully indexed Job: ${job._id}`);
  } catch (error) {
    console.error(`Failed to index Job ${job._id}:`, error);
  }
};

/**
 * Index an Internship
 */
const indexInternship = async (internship) => {
  try {
    const extracted = await extractIndexData(internship.intTitle, internship.intDescription, internship.intRequirements);
    
    const normalizedRequired = normalizeSkills(extracted.requiredSkills);
    const normalizedPreferred = normalizeSkills(extracted.preferredSkills);
    
    const updateData = {
      internshipId: internship._id,
      title: internship.intTitle,
      requiredSkills: normalizedRequired,
      preferredSkills: normalizedPreferred,
      experienceRequired: internship.intExperience || 0,
      roleCategory: extracted.roleCategory
    };

    await InternshipIndex.findOneAndUpdate(
      { internshipId: internship._id },
      { $set: updateData },
      { upsert: true, new: true }
    );
    console.log(`Successfully indexed Internship: ${internship._id}`);
  } catch (error) {
    console.error(`Failed to index Internship ${internship._id}:`, error);
  }
};

module.exports = {
  indexJob,
  indexInternship
};
