const Company = require('../models/Companies');
const Job = require('../models/Jobs');
const Internship = require('../models/Internship');
const redis = require('../config/redis');

const getStatistics = async (req, res) => {
  try {
    const cacheKey = `recruiter:statistics:${req.userId}`;

    // Check cache first
    try {
      const cachedStats = await redis.get(cacheKey);
      if (cachedStats) {
        res.set('X-Cache', 'HIT');
        return res.json({
          ...JSON.parse(cachedStats),
          source: 'cache'
        });
      }
    } catch (cacheError) {
      console.error('Redis cache error (get statistics):', cacheError);
    }

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

    // Cache the stats
    try {
      await redis.setex(cacheKey, 300, JSON.stringify(statsData)); // Cache for 5 mins
    } catch (cacheError) {
      console.error('Redis cache error (set statistics):', cacheError);
    }

    res.set('X-Cache', 'MISS');
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

