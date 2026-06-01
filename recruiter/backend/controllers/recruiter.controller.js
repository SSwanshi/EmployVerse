const Company = require('../models/Companies');
const Job = require('../models/Jobs');
const Internship = require('../models/Internship');
const redis = require('../config/redis');

const getStatistics = async (req, res) => {
  try {
    const companyCount = await Company.countDocuments({ createdBy: req.userId });
    const jobCount = await Job.countDocuments({ createdBy: req.userId });
    const internshipCount = await Internship.countDocuments({ createdBy: req.userId });

    const statsData = {
      success: true,
      companyCount,
      jobCount,
      internshipCount,
      candidateCount: 50,
      clientSatisfaction: '98%'
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

