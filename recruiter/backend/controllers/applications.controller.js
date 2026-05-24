const AppliedJob = require('../models/AppliedJob');
const AppliedInternship = require('../models/AppliedInternship');
const Job = require('../models/Jobs');
const Internship = require('../models/Internship');
const PremiumUser = require('../models/PremiumUser');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { connectApplicantDB } = require('../config/applicantDb');
const emailjs = require("@emailjs/nodejs");
const axios = require('axios');
const redis = require('../config/redis');

// Helper function to send notification to applicant backend
const sendNotificationToApplicant = async (receiverId, type, title, message, senderId = null) => {
  try {
    const applicantBackendUrl = process.env.APPLICANT_BACKEND_URL || 'http://localhost:3000';
    const response = await axios.post(
      `${applicantBackendUrl}/api/notifications/internal`,
      {
        receiverId,
        senderId,
        type,
        title,
        message
      },
      { timeout: 5000 }
    );
    console.log('✅ Notification sent to applicant:', response.data);
    return response.data;
  } catch (error) {
    console.error('⚠️ Failed to send notification to applicant:', error.message);
    // Don't throw - notification failure shouldn't block application status update
  }
};
// Note: This assumes PremiumUser model exists in applicant DB
// You may need to connect to applicant DB to fetch premium users

const getJobApplications = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Ensure applicant database connection is established
    await connectApplicantDB();

    const job = await Job.findById(jobId).populate("jobCompany");
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    console.log(`[DEBUG] Searching for applications with jobId: ${jobId} (type: ${typeof jobId})`);

    // Try multiple query formats to handle different jobId storage formats
    let applicants = [];
    
    // Try 1: Direct string match
    applicants = await AppliedJob.find({ jobId: jobId });
    console.log(`[DEBUG] Query 1 (jobId: "${jobId}"): Found ${applicants.length} applicants`);
    
    // Try 2: String match with toString()
    if (applicants.length === 0) {
      applicants = await AppliedJob.find({ jobId: jobId.toString() });
      console.log(`[DEBUG] Query 2 (jobId.toString()): Found ${applicants.length} applicants`);
    }
    
    // Try 3: ObjectId match (if valid ObjectId)
    if (applicants.length === 0 && mongoose.Types.ObjectId.isValid(jobId)) {
      try {
        applicants = await AppliedJob.find({ jobId: new mongoose.Types.ObjectId(jobId) });
        console.log(`[DEBUG] Query 3 (ObjectId): Found ${applicants.length} applicants`);
      } catch (err) {
        console.log(`[DEBUG] Query 3 failed: ${err.message}`);
      }
    }
    
    // Try 4: ObjectId as string (common format)
    if (applicants.length === 0 && mongoose.Types.ObjectId.isValid(jobId)) {
      try {
        const objectIdString = new mongoose.Types.ObjectId(jobId).toString();
        applicants = await AppliedJob.find({ jobId: objectIdString });
        console.log(`[DEBUG] Query 4 (ObjectId.toString()): Found ${applicants.length} applicants`);
      } catch (err) {
        console.log(`[DEBUG] Query 4 failed: ${err.message}`);
      }
    }
    
    // Try 5: Find all and filter (last resort - for debugging)
    if (applicants.length === 0) {
      const allApplicants = await AppliedJob.find({});
      console.log(`[DEBUG] Total applicants in DB: ${allApplicants.length}`);
      if (allApplicants.length > 0) {
        console.log(`[DEBUG] Sample jobId from DB: "${allApplicants[0].jobId}" (type: ${typeof allApplicants[0].jobId})`);
        // Try to find matches manually
        applicants = allApplicants.filter(app => 
          app.jobId === jobId || 
          app.jobId === jobId.toString() ||
          (mongoose.Types.ObjectId.isValid(jobId) && app.jobId === new mongoose.Types.ObjectId(jobId).toString()) ||
          (mongoose.Types.ObjectId.isValid(app.jobId) && mongoose.Types.ObjectId.isValid(jobId) && 
           new mongoose.Types.ObjectId(app.jobId).equals(new mongoose.Types.ObjectId(jobId)))
        );
        console.log(`[DEBUG] Query 5 (filtered): Found ${applicants.length} applicants`);
      }
    }

    // Fetch premium users from applicant database
    const premiumUsers = await PremiumUser.find({});
    const premiumUserIds = premiumUsers.map(user => user.userId?.toString()).filter(Boolean);
    const premiumUserEmails = premiumUsers.map(user => user.email?.toLowerCase()).filter(Boolean);

    console.log(`[DEBUG] Found ${premiumUsers.length} premium users`);
    console.log(`[DEBUG] Premium user IDs: ${premiumUserIds.slice(0, 5).join(', ')}...`);
    console.log(`[DEBUG] Total applicants: ${applicants.length}`);

    // Sort applicants: pending first, then premium, then by time (newest first)
    // Group 1: Pending + Premium
    // Group 2: Pending + Normal
    // Group 3: Selected/Rejected + Premium
    // Group 4: Selected/Rejected + Normal
    const pendingPremiumApplicants = [];
    const pendingNormalApplicants = [];
    const processedPremiumApplicants = [];
    const processedNormalApplicants = [];

    applicants.forEach(applicant => {
      const applicantUserId = applicant.userId?.toString();
      const applicantEmail = applicant.email?.toLowerCase();
      
      // Check if applicant is premium by userId or email
      const isPremium = premiumUserIds.includes(applicantUserId) || 
                       premiumUserEmails.includes(applicantEmail);
      
      // Check if application is pending (not selected and not rejected)
      const isPending = !applicant.isSelected && !applicant.isRejected;
      
      if (isPending) {
        if (isPremium) {
          pendingPremiumApplicants.push(applicant);
        } else {
          pendingNormalApplicants.push(applicant);
        }
      } else {
        if (isPremium) {
          processedPremiumApplicants.push(applicant);
        } else {
          processedNormalApplicants.push(applicant);
        }
      }
    });

    console.log(`[DEBUG] Pending Premium: ${pendingPremiumApplicants.length}, Pending Normal: ${pendingNormalApplicants.length}`);
    console.log(`[DEBUG] Processed Premium: ${processedPremiumApplicants.length}, Processed Normal: ${processedNormalApplicants.length}`);

    // Sort each group by time (newest first)
    // Use AppliedAt if available, otherwise use createdAt
    const sortByTime = (a, b) => {
      const dateA = a.AppliedAt || a.createdAt || new Date(0);
      const dateB = b.AppliedAt || b.createdAt || new Date(0);
      return new Date(dateB) - new Date(dateA); // Descending order (newest first)
    };

    pendingPremiumApplicants.sort(sortByTime);
    pendingNormalApplicants.sort(sortByTime);
    processedPremiumApplicants.sort(sortByTime);
    processedNormalApplicants.sort(sortByTime);

    // Combine: pending premium, pending normal, then processed premium, processed normal
    const sortedApplicants = [
      ...pendingPremiumApplicants,
      ...pendingNormalApplicants,
      ...processedPremiumApplicants,
      ...processedNormalApplicants
    ];

    res.json({
      success: true,
      applicants: sortedApplicants,
      jobTitle: job.jobTitle,
      jobCompany: job.jobCompany.companyName,
      jobId
    });
  } catch (err) {
    console.error('Error fetching job applications:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error'
    });
  }
};

const selectApplicant = async (req, res) => {
  try {
    // Ensure applicant database connection is established
    await connectApplicantDB();
    
    const { jobId, applicantId } = req.params;
    const result = await AppliedJob.findOneAndUpdate(
      { _id: applicantId, jobId },
      { isSelected: true, isRejected: false },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const job = await Job.findById(result.jobId).populate("jobCompany");
    const position = job.jobTitle;
    const companyName = job.jobCompany?.companyName || 'the company';

    // Send email notification
    await emailjs.send(
      process.env.EMAILJS_APPLICATION_STATUS_SERVICE_ID,
      process.env.EMAILJS_ACCEPT_TEMPLATE_ID,
      {
        candidate_name: `${result.firstName} ${result.lastName}`,
        position: position, 
        portal_name: "GoHire",
        year: new Date().getFullYear(),
        to_email: result.email,
        dashboard_link: `${process.env.APPLICANT_FRONTEND_URL}/profile`
      },
      {
        publicKey: process.env.EMAILJS_APPLICATION_STATUS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_APPLICATION_STATUS_PRIVATE_KEY,
      }
    );

    // Send in-app notification
    await sendNotificationToApplicant(
      result.userId,
      'APPLICATION_SHORTLISTED',
      'Application Shortlisted',
      `Your application for ${position} at ${companyName} has been shortlisted.`
    );

    // Invalidate applicant's profile cache
    try {
      if (result.userId) {
        await redis.del(`profile:${result.userId}`);
      }
    } catch (cacheError) {
      console.error('Redis cache error (invalidate applicant profile):', cacheError);
    }

    res.json({ success: true, message: 'Applicant selected successfully' });
  } catch (error) {
    console.error('Error selecting applicant:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const rejectApplicant = async (req, res) => {
  try {
    // Ensure applicant database connection is established
    await connectApplicantDB();
    
    const { jobId, applicantId } = req.params;
    const result = await AppliedJob.findOneAndUpdate(
      { _id: applicantId, jobId },
      { isRejected: true, isSelected: false },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const job = await Job.findById(result.jobId).populate("jobCompany");
    const position = job.jobTitle;
    const companyName = job.jobCompany?.companyName || 'the company';

    // Send email notification
    await emailjs.send(
      process.env.EMAILJS_APPLICATION_STATUS_SERVICE_ID,
      process.env.EMAILJS_REJECT_TEMPLATE_ID,
      {
        candidate_name: `${result.firstName} ${result.lastName}`,
        position: position, 
        portal_name: "GoHire",
        year: new Date().getFullYear(),
        to_email: result.email,
        jobs_link: `${process.env.APPLICANT_FRONTEND_URL}/jobs`
      },
      {
        publicKey: process.env.EMAILJS_APPLICATION_STATUS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_APPLICATION_STATUS_PRIVATE_KEY,
      }
    );
    
    // Send in-app notification
    await sendNotificationToApplicant(
      result.userId,
      'APPLICATION_REJECTED',
      'Application Update',
      `Your application for ${position} at ${companyName} was not selected.`
    );
    
    // Invalidate applicant's profile cache
    try {
      if (result.userId) {
        await redis.del(`profile:${result.userId}`);
      }
    } catch (cacheError) {
      console.error('Redis cache error (invalidate applicant profile):', cacheError);
    }

    res.json({ success: true, message: 'Applicant rejected successfully' });
  } catch (error) {
    console.error('Error rejecting applicant:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const getResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { ObjectId } = require('mongodb');
    const { connectApplicantDB, getApplicantBucket } = require('../config/applicantDb');

    // Ensure applicant database connection is established
    await connectApplicantDB();
    const bucket = getApplicantBucket();

    if (!bucket) {
      return res.status(500).json({ success: false, error: 'Applicant database connection not available' });
    }

    if (!ObjectId.isValid(resumeId)) {
      return res.status(400).json({ success: false, error: 'Invalid resume ID' });
    }

    const resumeObjectId = new ObjectId(resumeId);

    // Check if file exists
    const files = await bucket.find({ _id: resumeObjectId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({ success: false, error: 'Resume not found' });
    }

    const file = files[0];

    // Trigger APPLICATION_VIEWED notification
    try {
      const application = await AppliedJob.findOne({ resumeId: resumeObjectId });
      if (application) {
        const job = await Job.findById(application.jobId).populate("jobCompany");
        if (job) {
          const position = job.jobTitle;
          const companyName = job.jobCompany?.companyName || 'the company';
          await sendNotificationToApplicant(
            application.userId,
            'APPLICATION_VIEWED',
            'Application Viewed',
            `Your application for ${position} was viewed by ${companyName}.`
          );
        }
      }
    } catch (notifErr) {
      console.error('Failed to send view notification:', notifErr.message);
    }

    // Set appropriate headers
    res.set('Content-Type', file.contentType || 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${file.filename || 'resume.pdf'}"`);
    res.set('Content-Length', file.length);

    // Stream the file
    const downloadStream = bucket.openDownloadStream(resumeObjectId);
    
    downloadStream.on('error', (error) => {
      console.error('Error streaming resume:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, error: 'Error downloading resume' });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error fetching resume:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
};

const getSelectedApplicants = async (req, res) => {
  try {
    // Ensure applicant database connection is established
    await connectApplicantDB();

    const recruiterId = req.userId;

    // Find all jobs and internships created by this recruiter
    const jobs = await Job.find({ createdBy: recruiterId }).populate('jobCompany');
    const internships = await Internship.find({ createdBy: recruiterId }).populate('intCompany');

    const jobIds = jobs.map(j => j._id.toString());
    const internshipIds = internships.map(i => i._id.toString());

    // Find selected job applications
    const selectedJobs = await AppliedJob.find({ jobId: { $in: jobIds }, isSelected: true });

    // Find selected internship applications
    const selectedInternships = await AppliedInternship.find({ internshipId: { $in: internshipIds }, isSelected: true });

    // Format job applications
    const jobApps = selectedJobs.map(app => {
      const job = jobs.find(j => j._id.toString() === app.jobId);
      return {
        applicationId: app._id,
        opportunityId: app.jobId,
        type: 'Job',
        companyName: job?.jobCompany?.companyName || 'N/A',
        title: job?.jobTitle || 'N/A',
        applicantName: `${app.firstName} ${app.lastName}`,
        email: app.email,
        phone: app.phone,
        appliedDate: app.AppliedAt || app.createdAt,
        resumeId: app.resumeId,
        applicantId: app.userId
      };
    });

    // Format internship applications
    const internshipApps = selectedInternships.map(app => {
      const internship = internships.find(i => i._id.toString() === app.internshipId);
      return {
        applicationId: app._id,
        opportunityId: app.internshipId,
        type: 'Internship',
        companyName: internship?.intCompany?.companyName || 'N/A',
        title: internship?.intTitle || 'N/A',
        applicantName: `${app.firstName} ${app.lastName}`,
        email: app.email,
        phone: app.phone,
        appliedDate: app.AppliedAt || app.createdAt,
        resumeId: app.resumeId,
        applicantId: app.userId
      };
    });

    // Combine
    const selectedApplicants = [...jobApps, ...internshipApps];

    // Sort by applied date descending
    selectedApplicants.sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate));

    res.json({ success: true, selectedApplicants });
  } catch (error) {
    console.error('Error in getSelectedApplicants:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = {
  getJobApplications,
  selectApplicant,
  rejectApplicant,
  getResume,
  getSelectedApplicants
};

