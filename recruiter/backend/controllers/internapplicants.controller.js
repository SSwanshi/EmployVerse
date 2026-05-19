const AppliedInternship = require('../models/AppliedInternship');
const Internship = require('../models/Internship');
const PremiumUser = require('../models/PremiumUser');
const mongoose = require('mongoose');
const { connectApplicantDB } = require('../config/applicantDb');

const getInternshipApplications = async (req, res) => {
  try {
    const internshipId = req.params.internshipId;

    // Ensure applicant database connection is established
    await connectApplicantDB();

    const internship = await Internship.findById(internshipId).populate("intCompany");
    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    console.log(`[DEBUG] Searching for internship applications with internshipId: ${internshipId} (type: ${typeof internshipId})`);

    // Try multiple query formats to handle different internshipId storage formats
    let allApplicants = [];
    
    // Try 1: Direct string match
    allApplicants = await AppliedInternship.find({ internshipId: internshipId });
    console.log(`[DEBUG] Query 1 (internshipId: "${internshipId}"): Found ${allApplicants.length} applicants`);
    
    // Try 2: String match with toString()
    if (allApplicants.length === 0) {
      allApplicants = await AppliedInternship.find({ internshipId: internshipId.toString() });
      console.log(`[DEBUG] Query 2 (internshipId.toString()): Found ${allApplicants.length} applicants`);
    }
    
    // Try 3: ObjectId match (if valid ObjectId)
    if (allApplicants.length === 0 && mongoose.Types.ObjectId.isValid(internshipId)) {
      try {
        allApplicants = await AppliedInternship.find({ internshipId: new mongoose.Types.ObjectId(internshipId) });
        console.log(`[DEBUG] Query 3 (ObjectId): Found ${allApplicants.length} applicants`);
      } catch (err) {
        console.log(`[DEBUG] Query 3 failed: ${err.message}`);
      }
    }
    
    // Try 4: ObjectId as string (common format)
    if (allApplicants.length === 0 && mongoose.Types.ObjectId.isValid(internshipId)) {
      try {
        const objectIdString = new mongoose.Types.ObjectId(internshipId).toString();
        allApplicants = await AppliedInternship.find({ internshipId: objectIdString });
        console.log(`[DEBUG] Query 4 (ObjectId.toString()): Found ${allApplicants.length} applicants`);
      } catch (err) {
        console.log(`[DEBUG] Query 4 failed: ${err.message}`);
      }
    }
    
    // Try 5: Find all and filter (last resort - for debugging)
    if (allApplicants.length === 0) {
      const allApplications = await AppliedInternship.find({});
      console.log(`[DEBUG] Total internship applications in DB: ${allApplications.length}`);
      if (allApplications.length > 0) {
        console.log(`[DEBUG] Sample internshipId from DB: "${allApplications[0].internshipId}" (type: ${typeof allApplications[0].internshipId})`);
        // Try to find matches manually
        allApplicants = allApplications.filter(app => 
          app.internshipId === internshipId || 
          app.internshipId === internshipId.toString() ||
          (mongoose.Types.ObjectId.isValid(internshipId) && app.internshipId === new mongoose.Types.ObjectId(internshipId).toString()) ||
          (mongoose.Types.ObjectId.isValid(app.internshipId) && mongoose.Types.ObjectId.isValid(internshipId) && 
           new mongoose.Types.ObjectId(app.internshipId).equals(new mongoose.Types.ObjectId(internshipId)))
        );
        console.log(`[DEBUG] Query 5 (filtered): Found ${allApplicants.length} applicants`);
      }
    }

    // Fetch premium users from applicant database
    const premiumUsers = await PremiumUser.find({});
    const premiumUserIds = premiumUsers.map(user => user.userId?.toString()).filter(Boolean);
    const premiumUserEmails = premiumUsers.map(user => user.email?.toLowerCase()).filter(Boolean);

    console.log(`[DEBUG] Found ${premiumUsers.length} premium users`);
    console.log(`[DEBUG] Premium user IDs: ${premiumUserIds.slice(0, 5).join(', ')}...`);
    console.log(`[DEBUG] Total applicants: ${allApplicants.length}`);

    // Sort applicants: pending first, then premium, then by time (newest first)
    // Group 1: Pending + Premium
    // Group 2: Pending + Normal
    // Group 3: Selected/Rejected + Premium
    // Group 4: Selected/Rejected + Normal
    const pendingPremiumApplicants = [];
    const pendingNormalApplicants = [];
    const processedPremiumApplicants = [];
    const processedNormalApplicants = [];

    allApplicants.forEach(applicant => {
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
      intapplicants: sortedApplicants,
      intTitle: internship.intTitle,
      intCompany: internship.intCompany.companyName,
      internshipId
    });
  } catch (err) {
    console.error('Error fetching internship applications:', err);
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
    
    const { internshipId, applicantId } = req.params;
    const result = await AppliedInternship.findOneAndUpdate(
      { _id: applicantId, internshipId },
      { isSelected: true, isRejected: false },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Application not found' });
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
    
    const { internshipId, applicantId } = req.params;
    const result = await AppliedInternship.findOneAndUpdate(
      { _id: applicantId, internshipId },
      { isRejected: true, isSelected: false },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({ success: false, message: 'Application not found' });
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

module.exports = {
  getInternshipApplications,
  selectApplicant,
  rejectApplicant,
  getResume
};

