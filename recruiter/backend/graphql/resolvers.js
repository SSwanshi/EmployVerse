const Company = require('../models/Companies');
const Job = require('../models/Jobs');
const Internship = require('../models/Internship');
const AppliedJob = require('../models/AppliedJob');
const AppliedInternship = require('../models/AppliedInternship');

const recruiterDashboard = async (args, context, info) => {
  try {
    const userId = context.userId;

    console.log('[Resolver] Received userId:', userId);

    if (!userId) {
      throw new Error('Unauthorized: User ID not found in context');
    }

    // Fetch base statistics
    const companyCount = await Company.countDocuments({ createdBy: userId });
    const jobCount = await Job.countDocuments({ createdBy: userId });
    const internshipCount = await Internship.countDocuments({ createdBy: userId });

    console.log('[Resolver] Stats - Companies:', companyCount, 'Jobs:', jobCount, 'Internships:', internshipCount);

    // Fetch application statistics
    const jobApplications = await AppliedJob.find({});
    const internshipApplications = await AppliedInternship.find({});

    const totalApplications = jobApplications.length + internshipApplications.length;
    const pendingApplications = 
      jobApplications.filter(app => !app.isSelected && !app.isRejected).length +
      internshipApplications.filter(app => !app.isSelected && !app.isRejected).length;
    const selectedCandidates = 
      jobApplications.filter(app => app.isSelected).length +
      internshipApplications.filter(app => app.isSelected).length;
    const rejectedCandidates = 
      jobApplications.filter(app => app.isRejected).length +
      internshipApplications.filter(app => app.isRejected).length;

    // Calculate candidate count
    const candidateCount = new Set([
      ...jobApplications.map(app => app.userId?.toString()),
      ...internshipApplications.map(app => app.userId?.toString())
    ]).size;

    // Calculate client satisfaction (future: calculate from ratings)
    const clientSatisfaction = '98%';

    const result = {
      companyCount,
      jobCount,
      internshipCount,
      candidateCount,
      applicationStats: {
        totalApplications,
        pendingApplications,
        selectedCandidates,
        rejectedCandidates
      },
      clientSatisfaction
    };

    console.log('[Resolver] Returning result:', result);
    return result;
  } catch (error) {
    console.error('[Resolver] Error:', error.message);
    throw error;
  }
};

const applicationStatistics = async (args, context, info) => {
  try {
    const userId = context.userId;

    console.log('[AppStats Resolver] Received userId:', userId);

    if (!userId) {
      throw new Error('Unauthorized: User ID not found in context');
    }

    // Fetch all applications
    const jobApplications = await AppliedJob.find({});
    const internshipApplications = await AppliedInternship.find({});

    // Calculate stats
    const totalApplications = jobApplications.length + internshipApplications.length;
    const pendingApplications = 
      jobApplications.filter(app => !app.isSelected && !app.isRejected).length +
      internshipApplications.filter(app => !app.isSelected && !app.isRejected).length;
    const selectedCandidates = 
      jobApplications.filter(app => app.isSelected).length +
      internshipApplications.filter(app => app.isSelected).length;
    const rejectedCandidates = 
      jobApplications.filter(app => app.isRejected).length +
      internshipApplications.filter(app => app.isRejected).length;

    // Build detailed application list
    const applications = [];

    jobApplications.forEach(app => {
      applications.push({
        id: app._id?.toString() || '',
        applicantId: app.userId?.toString() || '',
        applicantName: app.applicantName || 'Unknown',
        email: app.email || '',
        applicationType: 'Job',
        status: app.isSelected ? 'Selected' : app.isRejected ? 'Rejected' : 'Pending',
        appliedDate: app.createdAt ? new Date(app.createdAt).toISOString() : ''
      });
    });

    internshipApplications.forEach(app => {
      applications.push({
        id: app._id?.toString() || '',
        applicantId: app.userId?.toString() || '',
        applicantName: app.applicantName || 'Unknown',
        email: app.email || '',
        applicationType: 'Internship',
        status: app.isSelected ? 'Selected' : app.isRejected ? 'Rejected' : 'Pending',
        appliedDate: app.createdAt ? new Date(app.createdAt).toISOString() : ''
      });
    });

    // Sort by date (newest first)
    applications.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

    const result = {
      totalApplications,
      pendingApplications,
      selectedCandidates,
      rejectedCandidates,
      applications
    };

    console.log('[AppStats Resolver] Total apps found:', applications.length);
    return result;
  } catch (error) {
    console.error('[AppStats Resolver] Error:', error.message);
    throw error;
  }
};

module.exports = {
  Query: {
    recruiterDashboard,
    applicationStatistics
  }
};
