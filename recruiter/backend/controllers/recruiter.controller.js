const Company = require('../models/Companies');
const Job = require('../models/Jobs');
const Internship = require('../models/Internship');

const getStatistics = async (req, res) => {
  try {
    const companyCount = await Company.countDocuments({ createdBy: req.userId });
    const jobCount = await Job.countDocuments({ createdBy: req.userId });
    const internshipCount = await Internship.countDocuments({ createdBy: req.userId });

    res.json({
      success: true,
      companyCount,
      jobCount,
      internshipCount,
      candidateCount: 50,
      clientSatisfaction: '98%'
    });
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

