const User = require('../models/user');
const PremiumUser = require('../models/premium_user');
const Applied_for_Jobs = require('../models/Applied_for_Jobs');
const Applied_for_Internships = require('../models/Applied_for_Internships');
const { getBucket } = require('../config/db');
const { ObjectId } = require('mongodb');
const connectRecruiterDB = require('../config/recruiterDB');
const createJobModel = require('../models/recruiter/Job');
const createInternshipModel = require('../models/recruiter/Internships');
const createCompanyModel = require('../models/recruiter/Company');
const redis = require('../config/redis');

/**
 * Get complete profile dashboard data for an applicant
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<Object>} Dashboard data including profile, applications, and stats
 */
const getProfileDashboard = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // -------- REDIS CACHE CHECK --------
    const cacheKey = `dashboard:${userId}`;
    let cachedData = null;
    
    try {
      cachedData = await redis.get(cacheKey);
    } catch (error) {
      console.error('Redis GET error:', error);
    }

    if (cachedData) {
      console.log('Serving dashboard from Redis cache');
      return JSON.parse(cachedData);
    }

    console.log('Cache miss - querying database for dashboard');
    // -------- END REDIS CACHE CHECK --------

    // Fetch user data
    const user = await User.findOne({ userId });
    if (!user) {
      throw new Error('User not found');
    }

    // Check premium status
    const premiumUser = await PremiumUser.findOne({ email: user.email });
    let isPremium = !!premiumUser;
    let premiumExpired = false;

    if (premiumUser && premiumUser.planExpiry) {
      if (new Date() > new Date(premiumUser.planExpiry)) {
        isPremium = false;
        premiumExpired = true;
      }
    }

    // Fetch resume info
    let resumeName = null;
    if (user.resumeId) {
      const bucket = getBucket();
      const files = await bucket.find({ _id: new ObjectId(user.resumeId) }).toArray();
      if (files.length > 0) resumeName = files[0].filename;
    }

    // Fetch all applications
    const jobApplications = await Applied_for_Jobs.find({ userId });
    const internshipApplications = await Applied_for_Internships.find({ userId });

    // Extract unique IDs
    const jobIds = [...new Set(jobApplications.map(app => app.jobId).filter(Boolean))];
    const internshipIds = [...new Set(internshipApplications.map(app => app.internshipId).filter(Boolean))];

    // Connect to recruiter DB to fetch job/internship details
    const recruiterConn = await connectRecruiterDB();
    const JobModel = createJobModel(recruiterConn);
    const InternshipModel = createInternshipModel(recruiterConn);
    const CompanyModel = createCompanyModel(recruiterConn);

    const [jobs, internships] = await Promise.all([
      jobIds.length > 0 ? JobModel.find({ _id: { $in: jobIds } }) : [],
      internshipIds.length > 0 ? InternshipModel.find({ _id: { $in: internshipIds } }) : []
    ]);

    // Fetch company details
    const jobCompanyIds = [...new Set(jobs.map(job => job.jobCompany).filter(Boolean))];
    const companies = jobCompanyIds.length > 0
      ? await CompanyModel.find({ _id: { $in: jobCompanyIds } })
      : [];

    const companyMap = companies.reduce((map, company) => {
      map[company._id.toString()] = company;
      return map;
    }, {});

    const internshipCompanyIds = [...new Set(internships.map(int => int.intCompany).filter(Boolean))];
    const internshipCompanies = internshipCompanyIds.length > 0
      ? await CompanyModel.find({ _id: { $in: internshipCompanyIds } })
      : [];

    const internshipCompanyMap = internshipCompanies.reduce((map, company) => {
      map[company._id.toString()] = company;
      return map;
    }, {});

    const jobMap = jobs.reduce((map, job) => {
      map[job._id] = job;
      return map;
    }, {});

    const internshipMap = internships.reduce((map, internship) => {
      map[internship._id] = internship;
      return map;
    }, {});

    // Build application history
    const applicationHistory = [
      ...jobApplications.map(app => {
        const job = app.jobId ? jobMap[app.jobId] : null;
        const company = job?.jobCompany ? companyMap[job.jobCompany.toString()] : null;
        return {
          type: 'Job',
          title: job?.jobTitle || 'Job No Longer Available',
          company: company?.companyName || 'Company No Longer Available',
          appliedAt: app.AppliedAt,
          status: app.isSelected ? 'Accepted' : app.isRejected ? 'Rejected' : 'Pending',
          applicationId: app._id.toString()
        };
      }),
      ...internshipApplications.map(app => {
        const internship = app.internshipId ? internshipMap[app.internshipId] : null;
        const company = internship?.intCompany ? internshipCompanyMap[internship.intCompany.toString()] : null;
        return {
          type: 'Internship',
          title: internship?.intTitle || 'Internship No Longer Available',
          company: company?.companyName || 'Company No Longer Available',
          appliedAt: app.AppliedAt,
          status: app.isSelected ? 'Accepted' : app.isRejected ? 'Rejected' : 'Pending',
          applicationId: app._id.toString()
        };
      })
    ];

    applicationHistory.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    // Calculate dashboard statistics
    const stats = {
      totalApplications: applicationHistory.length,
      jobApplications: jobApplications.length,
      internshipApplications: internshipApplications.length,
      acceptedApplications: applicationHistory.filter(a => a.status === 'Accepted').length,
      rejectedApplications: applicationHistory.filter(a => a.status === 'Rejected').length,
      pendingApplications: applicationHistory.filter(a => a.status === 'Pending').length
    };

    // Build response
    const dashboardData = {
      profile: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        profileImageId: user.profileImageId ? user.profileImageId.toString() : null,
        memberSince: user.memberSince,
        collegeName: user.collegeName || '',
        skills: user.skills || '',
        about: user.about || '',
        linkedinProfile: user.linkedinProfile || '',
        githubProfile: user.githubProfile || '',
        portfolioWebsite: user.portfolioWebsite || '',
        workExperience: user.workExperience || '',
        achievements: user.achievements || ''
      },
      premiumStatus: {
        isPremium,
        premiumExpired,
        planExpiry: premiumUser?.planExpiry || null
      },
      resumeName,
      applicationHistory,
      stats
    };

    // -------- REDIS CACHE SET --------
    try {
      await redis.set(cacheKey, JSON.stringify(dashboardData), 'EX', 300);
      console.log('Dashboard cached for user:', userId);
    } catch (err) {
      console.error('Redis SET error:', err);
    }
    // -------- END REDIS CACHE SET --------

    return dashboardData;
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    throw error;
  }
};

/**
 * Invalidate dashboard cache for a user
 * @param {string} userId - The user's ID
 */
const invalidateDashboardCache = async (userId) => {
  try {
    const cacheKey = `dashboard:${userId}`;
    await redis.del(cacheKey);
    console.log('Dashboard cache invalidated for user:', userId);
  } catch (error) {
    console.error('Redis cache invalidation error:', error);
  }
};

module.exports = {
  getProfileDashboard,
  invalidateDashboardCache
};
