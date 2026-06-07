const ResumeAnalysis = require('../models/ResumeAnalysis');
const { extractResumeText } = require('../services/ats/textExtractor.service');
const { extractStructuredResume } = require('../services/ats/structuredExtraction.service');
const { 
  calculateCompletenessScore, 
  calculateFormattingScore, 
  calculateKeywordCoverage, 
  calculateExperienceQuality, 
  calculateProjectQuality, 
  calculateGrammarScore, 
  aggregateScore, 
  generateGrade 
} = require('../services/ats/scoringEngine.service');
const { generateSkillGapAnalysis } = require('../services/ats/skillGapAnalysis.service');
const { generateAIRecommendations } = require('../services/ats/aiRecommendations.service');

const User = require('../models/user');
const { getBucket } = require('../config/db');
const { ObjectId } = require('mongodb');

const atsScore = async (req, res) => {
  try {
    let fileBuffer = null;
    let mimetype = '';
    let filename = 'stored-resume.pdf';

    if (req.file) {
      fileBuffer = req.file.buffer;
      mimetype = req.file.mimetype;
      filename = req.file.originalname;
    } else if (req.user) {
      // Try to fetch existing resume
      const user = await User.findOne({ userId: req.user.id });
      if (!user || !user.resumeId) {
        return res.status(400).json({ success: false, message: 'No resume found for user. Please upload one.' });
      }

      const bucket = getBucket();
      const files = await bucket.find({ _id: new ObjectId(user.resumeId) }).toArray();
      if (files.length === 0) {
        return res.status(400).json({ success: false, message: 'Resume file missing from storage.' });
      }

      mimetype = 'application/pdf'; // Assuming PDF for stored resumes
      filename = files[0].filename || filename;
      
      const downloadStream = bucket.openDownloadStream(new ObjectId(user.resumeId));
      const chunks = [];
      await new Promise((resolve, reject) => {
        downloadStream.on('data', chunk => chunks.push(chunk));
        downloadStream.on('error', reject);
        downloadStream.on('end', resolve);
      });
      fileBuffer = Buffer.concat(chunks);
    } else {
      return res.status(400).json({ success: false, message: 'No resume file provided.' });
    }

    const { jobDescription, targetRole } = req.body;
    const userId = req.user ? req.user.id : 'anonymous';

    // 1. Extract Text
    const rawText = await extractResumeText(fileBuffer, mimetype);

    // 2. Structured Extraction (Gemini)
    const structuredData = await extractStructuredResume(rawText);

    // 3. Skill Gap Analysis (if JD provided)
    const skillGap = generateSkillGapAnalysis(structuredData.skills || [], jobDescription || targetRole || '');

    // 4. Deterministic Scoring
    const completeness = calculateCompletenessScore(structuredData);
    const formatting = calculateFormattingScore(rawText, structuredData);
    const keywordCoverage = calculateKeywordCoverage(structuredData.skills || [], jobDescription || targetRole || '');
    const experienceQuality = calculateExperienceQuality(structuredData.experience || []);
    const projectQuality = calculateProjectQuality(structuredData.projects || []);
    const grammar = await calculateGrammarScore(rawText);

    const breakdown = {
      completeness,
      formatting,
      keywordCoverage,
      experienceQuality,
      projectQuality,
      grammar
    };

    const overallScore = aggregateScore(breakdown);
    const grade = generateGrade(overallScore);

    // 5. AI Recommendations
    const aiFeedback = await generateAIRecommendations(structuredData);

    // 6. Build the final report
    const report = {
      overallScore,
      grade,
      breakdown,
      strengths: aiFeedback.strengths || [],
      weaknesses: aiFeedback.weaknesses || [],
      missingSkills: skillGap.missingSkills || [],
      recommendations: aiFeedback.recommendations || []
    };

    // 7. Save to Database
    if (req.user) {
      await ResumeAnalysis.create({
        userId,
        resumeUrl: filename,
        overallScore,
        grade,
        breakdown,
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        missingSkills: report.missingSkills,
        recommendations: report.recommendations,
        jobDescriptionProvided: !!jobDescription
      });
    }

    return res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('ATS Scoring Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to analyze resume'
    });
  }
};

module.exports = {
  atsScore
};
