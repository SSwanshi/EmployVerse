const Company = require('../models/Companies');
const Job = require('../models/Jobs');
const Internship = require('../models/Internship');
const AppliedJob = require('../models/AppliedJob');
const AppliedInternship = require('../models/AppliedInternship');
const redis = require('../config/redis');

const getStatistics = async (req, res) => {
  try {
    const companyCount = await Company.countDocuments({ createdBy: req.userId });
    const jobCount = await Job.countDocuments({ createdBy: req.userId });
    const internshipCount = await Internship.countDocuments({ createdBy: req.userId });

    const jobs = await Job.find({ createdBy: req.userId }).select('_id');
    const jobIds = jobs.map(j => j._id.toString());
    const jobApps = await AppliedJob.find({ jobId: { $in: jobIds } });

    const internships = await Internship.find({ createdBy: req.userId }).select('_id');
    const intIds = internships.map(i => i._id.toString());
    const intApps = await AppliedInternship.find({ internshipId: { $in: intIds } });

    const candidateCount = jobApps.length + intApps.length;

    const statsData = {
      success: true,
      companyCount,
      jobCount,
      internshipCount,
      candidateCount: candidateCount,
      clientSatisfaction: '98%',
      jobApplications: jobApps,
      internshipApplications: intApps
    };

    res.json(statsData);
  } catch (error) {
    console.error('Statistics fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  getStatistics
};

