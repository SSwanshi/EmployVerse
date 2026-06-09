const connectRecruiterDB = require("../config/recruiterDB");
const createJobIndexModel = require("../models/recruiter/JobIndex");
const createInternshipIndexModel = require("../models/recruiter/InternshipIndex");
const createJobModel = require("../models/recruiter/Job");
const createInternshipModel = require("../models/recruiter/Internships");
const createCompanyModel = require("../models/recruiter/Company");

const ResumeAnalysis = require("../models/ResumeAnalysis");
const { generateCandidateProfile } = require("../services/recommendation/candidateProfile");
const { rankJobs } = require("../services/recommendation/matchingEngine");
const redis = require("../config/redis");
const crypto = require("crypto");

/**
 * Ensures candidate profile is built and cached
 */
const getCandidateProfile = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new Error("Unauthorized");

  // Fetch the latest ATS analysis for this user
  const latestAnalysis = await ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 });
  if (!latestAnalysis) {
    throw new Error("No resume analysis found. Please upload and analyze your resume first.");
  }

  // Generate a hash of the structured breakdown to use as a cache key
  const breakdownHash = crypto.createHash("sha256").update(JSON.stringify(latestAnalysis.breakdown || {})).digest("hex");
  const cacheKey = `candidateProfile:${userId}:${breakdownHash}`;

  let cachedProfile = await redis.get(cacheKey);
  if (cachedProfile) {
    return JSON.parse(cachedProfile);
  }

  // Re-build structured data mock from the analysis report (which has breakdown, strengths, etc)
  // Wait, candidateProfile extraction relies on `experience`, `projects`, `skills` from the raw structured extraction.
  // We don't save the raw structuredExtraction in ResumeAnalysis, we only save breakdown scores and missingSkills!
  
  // Actually, to do this correctly, we need the raw structured data. Let's see if we can fetch it, or if we should run the candidate profile generation right after ATS analysis.
  // For now, let's assume we can re-run the ATS extraction or modify the DB to save structured data.
  // WAIT, ats.controller.js doesn't save the `structuredData`.
  // To avoid breaking changes, let's run the structured extraction again here if we don't have it, or just use what we have.
  // Actually, let's fetch the resume from GridFS and parse it.
  
  const { getBucket } = require("../config/db");
  const { extractResumeText } = require("../services/ats/textExtractor.service");
  const { extractStructuredResume } = require("../services/ats/structuredExtraction.service");
  const User = require("../models/user");
  const { ObjectId } = require("mongodb");

  const user = await User.findOne({ userId });
  if (!user || !user.resumeId) throw new Error("Resume not found");

  const bucket = getBucket();
  const files = await bucket.find({ _id: new ObjectId(user.resumeId) }).toArray();
  if (files.length === 0) throw new Error("Resume file not found");

  const file = files[0];
  const downloadStream = bucket.openDownloadStream(file._id);
  
  const chunks = [];
  for await (const chunk of downloadStream) {
    chunks.push(chunk);
  }
  const fileBuffer = Buffer.concat(chunks);
  const rawText = await extractResumeText(fileBuffer, file.contentType);
  
  // Extract Structured Data
  const structuredData = await extractStructuredResume(rawText);
  
  // Generate Profile
  const profile = await generateCandidateProfile(structuredData);

  // Cache for 24 hours
  await redis.set(cacheKey, JSON.stringify(profile), "EX", 60 * 60 * 24);

  return profile;
};

const recommendJobs = async (req, res) => {
  try {
    const candidateProfile = await getCandidateProfile(req, res);

    const recruiterConn = await connectRecruiterDB();
    const JobIndexModel = createJobIndexModel(recruiterConn);
    const JobModel = createJobModel(recruiterConn);
    createCompanyModel(recruiterConn); // for population

    // Fetch all job indices
    const allJobIndices = await JobIndexModel.find({}).lean();
    
    if (allJobIndices.length === 0) {
      return res.json({ recommendedJobs: [] });
    }

    // Rank jobs deterministically
    const ranked = await rankJobs(candidateProfile, allJobIndices);
    
    // Take Top 20
    const topMatches = ranked.slice(0, 20);

    // Fetch full job details for the top matches
    const topJobIds = topMatches.map(m => m.jobId);
    const fullJobs = await JobModel.find({ _id: { $in: topJobIds } }).populate("jobCompany").lean();

    // Merge match score into full jobs
    const recommendedJobs = topMatches.map(match => {
      const fullJob = fullJobs.find(j => j._id.toString() === match.jobId.toString());
      if (!fullJob) return null;
      return {
        ...fullJob,
        matchScore: match.matchScore,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills
      };
    }).filter(Boolean);

    res.json({
      success: true,
      candidateProfile,
      recommendedJobs
    });

  } catch (error) {
    console.error("Job Recommendation Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate recommendations" });
  }
};

const recommendInternships = async (req, res) => {
  try {
    const candidateProfile = await getCandidateProfile(req, res);

    const recruiterConn = await connectRecruiterDB();
    const InternshipIndexModel = createInternshipIndexModel(recruiterConn);
    const InternshipModel = createInternshipModel(recruiterConn);
    createCompanyModel(recruiterConn);

    const allIndices = await InternshipIndexModel.find({}).lean();
    
    if (allIndices.length === 0) {
      return res.json({ recommendedInternships: [] });
    }

    const ranked = await rankJobs(candidateProfile, allIndices);
    const topMatches = ranked.slice(0, 20);

    const topIds = topMatches.map(m => m.jobId); // rankJobs returns jobId even for internships
    const fullInternships = await InternshipModel.find({ _id: { $in: topIds } }).populate("intCompany").lean();

    const recommendedInternships = topMatches.map(match => {
      const fullInt = fullInternships.find(j => j._id.toString() === match.jobId.toString());
      if (!fullInt) return null;
      return {
        ...fullInt,
        matchScore: match.matchScore,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills
      };
    }).filter(Boolean);

    res.json({
      success: true,
      candidateProfile,
      recommendedInternships
    });

  } catch (error) {
    console.error("Internship Recommendation Error:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate recommendations" });
  }
};

module.exports = {
  recommendJobs,
  recommendInternships
};
