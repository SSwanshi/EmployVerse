const Company = require('../models/Companies');
const Job = require('../models/Jobs');
const Internship = require('../models/Internship');
const AppliedJob = require('../models/AppliedJob');
const AppliedInternship = require('../models/AppliedInternship');
const redis = require('../config/redis');

/**
 * Get comprehensive analytics dashboard for recruiter
 * Includes stats, recent activities, and performance metrics
 */
const getAnalyticsDashboard = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // -------- REDIS CACHE CHECK --------
    const cacheKey = `recruiter-analytics:${userId}`;
    let cachedData = null;

    try {
      cachedData = await redis.get(cacheKey);
    } catch (error) {
      console.error('[Analytics] Redis GET error:', error);
    }

    if (cachedData) {
      console.log('[Analytics] Serving from Redis cache');
      return JSON.parse(cachedData);
    }

    console.log('[Analytics] Cache miss - fetching from database');
    // -------- END REDIS CACHE CHECK --------

    // Fetch all recruiter-created postings
    const [companies, jobs, internships] = await Promise.all([
      Company.find({ createdBy: userId }),
      Job.find({ createdBy: userId }),
      Internship.find({ createdBy: userId })
    ]);

    // Get all applications (from applicant DB)
    const jobApplicationsRaw = await AppliedJob.find({});
    const internshipApplicationsRaw = await AppliedInternship.find({});

    // Filter applications for this recruiter's postings
    const jobIds = jobs.map(j => j._id.toString());
    const internshipIds = internships.map(i => i._id.toString());

    const jobApplications = jobApplicationsRaw.filter(app =>
      jobIds.includes(app.jobId)
    );

    const internshipApplications = internshipApplicationsRaw.filter(app =>
      internshipIds.includes(app.internshipId)
    );

    // ==================== BASIC STATS ====================
    const totalJobs = jobs.length;
    const totalInternships = internships.length;
    const totalCompanies = companies.length;

    // Expired postings
    const now = new Date();
    const expiredJobs = jobs.filter(j => j.jobExpiry < now).length;
    const expiredInternships = internships.filter(i => i.intExpiry < now).length;
    const activeJobs = totalJobs - expiredJobs;
    const activeInternships = totalInternships - expiredInternships;

    // ==================== APPLICATION STATS ====================
    const totalApplications = jobApplications.length + internshipApplications.length;

    const jobAppStats = {
      total: jobApplications.length,
      pending: jobApplications.filter(app => !app.isSelected && !app.isRejected).length,
      selected: jobApplications.filter(app => app.isSelected).length,
      rejected: jobApplications.filter(app => app.isRejected).length
    };

    const internshipAppStats = {
      total: internshipApplications.length,
      pending: internshipApplications.filter(app => !app.isSelected && !app.isRejected).length,
      selected: internshipApplications.filter(app => app.isSelected).length,
      rejected: internshipApplications.filter(app => app.isRejected).length
    };

    // ==================== CANDIDATE STATS ====================
    const uniqueJobCandidates = new Set(jobApplications.map(app => app.userId?.toString()));
    const uniqueInternshipCandidates = new Set(internshipApplications.map(app => app.userId?.toString()));
    const totalUniqueCandidates = new Set([
      ...uniqueJobCandidates,
      ...uniqueInternshipCandidates
    ]).size;

    // ==================== POSTING PERFORMANCE ====================
    // Top performing jobs
    const jobPerformance = jobs.map(job => ({
      id: job._id.toString(),
      title: job.jobTitle,
      company: job.jobCompany,
      applications: jobApplications.filter(app => app.jobId === job._id.toString()).length,
      salary: job.jobSalary,
      location: job.jobLocation
    })).sort((a, b) => b.applications - a.applications);

    // Top performing internships
    const internshipPerformance = internships.map(internship => ({
      id: internship._id.toString(),
      title: internship.intTitle,
      company: internship.intCompany,
      applications: internshipApplications.filter(app => app.internshipId === internship._id.toString()).length,
      stipend: internship.intStipend,
      location: internship.intLocation
    })).sort((a, b) => b.applications - a.applications);

    // ==================== RECENT ACTIVITIES ====================
    const recentApplications = [
      ...jobApplications.map(app => ({
        id: app._id.toString(),
        candidateName: `${app.firstName} ${app.lastName}`,
        email: app.email,
        type: 'Job',
        status: app.isSelected ? 'Accepted' : app.isRejected ? 'Rejected' : 'Pending',
        appliedAt: app.AppliedAt || app.createdAt
      })),
      ...internshipApplications.map(app => ({
        id: app._id.toString(),
        candidateName: `${app.firstName} ${app.lastName}`,
        email: app.email,
        type: 'Internship',
        status: app.isSelected ? 'Accepted' : app.isRejected ? 'Rejected' : 'Pending',
        appliedAt: app.AppliedAt || app.createdAt
      }))
    ].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)).slice(0, 10);

    // ==================== HIRING PIPELINE ====================
    const hiringPipeline = {
      totalCandidates: totalApplications,
      qualifiedCandidates: jobAppStats.pending + internshipAppStats.pending,
      selectedCandidates: jobAppStats.selected + internshipAppStats.selected,
      rejectedCandidates: jobAppStats.rejected + internshipAppStats.rejected,
      conversionRate: totalApplications > 0 
        ? ((jobAppStats.selected + internshipAppStats.selected) / totalApplications * 100).toFixed(2)
        : 0
    };

    // ==================== TIME-BASED STATS ====================
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentJobApplications = jobApplications.filter(app =>
      new Date(app.AppliedAt || app.createdAt) > last30Days
    );
    const recentInternshipApplications = internshipApplications.filter(app =>
      new Date(app.AppliedAt || app.createdAt) > last30Days
    );

    const recentStats = {
      jobApplications: recentJobApplications.length,
      internshipApplications: recentInternshipApplications.length,
      newJobs: jobs.filter(j => new Date(j.createdAt) > last30Days).length,
      newInternships: internships.filter(i => new Date(i.createdAt) > last30Days).length
    };

    // ==================== BUILD RESPONSE ====================
    const analyticsData = {
      postingStats: {
        totalJobs,
        totalInternships,
        activeJobs,
        activeInternships,
        expiredJobs,
        expiredInternships,
        totalCompanies
      },
      applicationStats: {
        total: totalApplications,
        byType: {
          jobApplications: jobAppStats.total,
          internshipApplications: internshipAppStats.total
        },
        byStatus: {
          pending: jobAppStats.pending + internshipAppStats.pending,
          selected: jobAppStats.selected + internshipAppStats.selected,
          rejected: jobAppStats.rejected + internshipAppStats.rejected
        },
        jobDetails: jobAppStats,
        internshipDetails: internshipAppStats
      },
      candidateStats: {
        totalUniqueCandidates,
        uniqueJobCandidates: uniqueJobCandidates.size,
        uniqueInternshipCandidates: uniqueInternshipCandidates.size
      },
      performanceMetrics: {
        topJobs: jobPerformance.slice(0, 5),
        topInternships: internshipPerformance.slice(0, 5),
        averageApplicationsPerJob: totalJobs > 0 ? (jobAppStats.total / totalJobs).toFixed(2) : 0,
        averageApplicationsPerInternship: totalInternships > 0 ? (internshipAppStats.total / totalInternships).toFixed(2) : 0
      },
      hiringPipeline,
      recentActivities: {
        applications: recentApplications
      },
      last30DaysStats: recentStats,
      generatedAt: new Date().toISOString()
    };

    // -------- REDIS CACHE SET --------
    try {
      await redis.set(cacheKey, JSON.stringify(analyticsData), 'EX', 300);
      console.log('[Analytics] Dashboard cached for recruiter:', userId);
    } catch (err) {
      console.error('[Analytics] Redis SET error:', err);
    }
    // -------- END REDIS CACHE SET --------

    return analyticsData;
  } catch (error) {
    console.error('[Analytics] Error fetching dashboard:', error);
    throw error;
  }
};

/**
 * Get detailed job analytics
 */
const getJobAnalytics = async (userId, jobId) => {
  try {
    const job = await Job.findOne({ _id: jobId, createdBy: userId });
    if (!job) {
      throw new Error('Job not found');
    }

    const jobApplications = await AppliedJob.find({ jobId });

    return {
      job: {
        id: job._id.toString(),
        title: job.jobTitle,
        location: job.jobLocation,
        salary: job.jobSalary,
        positions: job.noofPositions,
        createdAt: job.createdAt,
        expiresAt: job.jobExpiry
      },
      applications: {
        total: jobApplications.length,
        pending: jobApplications.filter(app => !app.isSelected && !app.isRejected).length,
        selected: jobApplications.filter(app => app.isSelected).length,
        rejected: jobApplications.filter(app => app.isRejected).length
      },
      applicants: jobApplications.map(app => ({
        id: app._id.toString(),
        name: `${app.firstName} ${app.lastName}`,
        email: app.email,
        phone: app.phone,
        status: app.isSelected ? 'Accepted' : app.isRejected ? 'Rejected' : 'Pending',
        appliedAt: app.AppliedAt || app.createdAt
      }))
    };
  } catch (error) {
    console.error('[Analytics] Error fetching job analytics:', error);
    throw error;
  }
};

/**
 * Invalidate analytics cache for a recruiter
 */
const invalidateAnalyticsCache = async (userId) => {
  try {
    const cacheKey = `recruiter-analytics:${userId}`;
    await redis.del(cacheKey);
    console.log('[Analytics] Cache invalidated for recruiter:', userId);
  } catch (error) {
    console.error('[Analytics] Cache invalidation error:', error);
  }
};

module.exports = {
  getAnalyticsDashboard,
  getJobAnalytics,
  invalidateAnalyticsCache
};
