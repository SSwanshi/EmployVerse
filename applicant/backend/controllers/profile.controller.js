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
const bcrypt = require('bcrypt');

const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findOne({ userId: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is premium
    const premiumUser = await PremiumUser.findOne({ email: user.email });
    let isPremium = !!premiumUser;
    let premiumExpired = false;

    if (premiumUser && premiumUser.planExpiry) {
      if (new Date() > new Date(premiumUser.planExpiry)) {
        isPremium = false;
        premiumExpired = true;
      }
    }

    let resumeName = null;
    if (user.resumeId) {
      const bucket = getBucket();
      const files = await bucket.find({ _id: new ObjectId(user.resumeId) }).toArray();
      if (files.length > 0) resumeName = files[0].filename;
    }

    const jobApplications = await Applied_for_Jobs.find({ userId: req.user.id });
    const internshipApplications = await Applied_for_Internships.find({ userId: req.user.id });

    const jobIds = [...new Set(jobApplications.map(app => app.jobId).filter(Boolean))];
    const internshipIds = [...new Set(internshipApplications.map(app => app.internshipId).filter(Boolean))];

    const recruiterConn = await connectRecruiterDB();
    const JobFindConn = createJobModel(recruiterConn);
    const InternshipFindConn = createInternshipModel(recruiterConn);
    const CompanyFindConn = createCompanyModel(recruiterConn);

    const [jobs, internships] = await Promise.all([
      jobIds.length > 0 ? JobFindConn.find({ _id: { $in: jobIds } }) : [],
      internshipIds.length > 0 ? InternshipFindConn.find({ _id: { $in: internshipIds } }) : []
    ]);

    const jobCompanyIds = [...new Set(jobs.map(job => job.jobCompany).filter(Boolean))];
    const companies = jobCompanyIds.length > 0
      ? await CompanyFindConn.find({ _id: { $in: jobCompanyIds } })
      : [];

    const companyMap = companies.reduce((map, company) => {
      map[company._id.toString()] = company;
      return map;
    }, {});

    const internshipCompanyIds = [...new Set(internships.map(int => int.intCompany).filter(Boolean))];
    const internshipCompanies = internshipCompanyIds.length > 0
      ? await CompanyFindConn.find({ _id: { $in: internshipCompanyIds } })
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
          applicationId: app._id
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
          applicationId: app._id
        };
      })
    ];

    applicationHistory.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    res.json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        profileImageId: user.profileImageId,
        isPremium: isPremium,
        premiumExpired: premiumExpired,
        memberSince: user.memberSince,
        // Additional fields
        collegeName: user.collegeName || '',
        skills: user.skills || '',
        about: user.about || '',
        linkedinProfile: user.linkedinProfile || '',
        githubProfile: user.githubProfile || '',
        portfolioWebsite: user.portfolioWebsite || '',
        workExperience: user.workExperience || '',
        achievements: user.achievements || ''
      },
      resumeName,
      applicationHistory
    });

  } catch (error) {
    console.error('Profile API error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      currentPassword,
      newPassword,
      confirmNewPassword,
      // Additional fields
      collegeName,
      skills,
      about,
      linkedinProfile,
      githubProfile,
      portfolioWebsite,
      workExperience,
      achievements
    } = req.body;
    const userId = req.user.id;

    // Prepare update object with all fields
    const updateData = {
      firstName,
      lastName,
      email,
      phone,
      gender
    };

    // Add additional fields if they are provided
    if (collegeName !== undefined) updateData.collegeName = collegeName;
    if (skills !== undefined) updateData.skills = skills;
    if (about !== undefined) updateData.about = about;
    if (linkedinProfile !== undefined) updateData.linkedinProfile = linkedinProfile;
    if (githubProfile !== undefined) updateData.githubProfile = githubProfile;
    if (portfolioWebsite !== undefined) updateData.portfolioWebsite = portfolioWebsite;
    if (workExperience !== undefined) updateData.workExperience = workExperience;
    if (achievements !== undefined) updateData.achievements = achievements;

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Password change logic
    if (currentPassword || newPassword || confirmNewPassword) {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({ error: 'All password fields are required to change password' });
      }

      const isMatch = await bcrypt.compare(currentPassword, updatedUser.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({ error: 'New passwords do not match' });
      }

      if (newPassword.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters long' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.findOneAndUpdate({ userId }, { password: hashedPassword });
    }

    // With JWT, profile updates don't require session updates
    // Client will continue using the same token until it expires

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    await User.deleteOne({ userId });

    // With JWT, logout is handled on the client side by removing the token
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    const user = await User.findOne({ userId: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const bucket = getBucket();

    if (user.resumeId) {
      await bucket.delete(new ObjectId(user.resumeId));
    }

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: 'application/pdf'
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async () => {
      user.resumeId = uploadStream.id;
      await user.save();
      res.json({ success: true, message: 'Resume uploaded successfully' });
    });

    uploadStream.on('error', (err) => {
      console.error('Upload stream error:', err);
      res.status(500).json({ success: false, message: 'Upload failed' });
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

const getResume = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).send('Not logged in');

    const user = await User.findOne({ userId });
    if (!user?.resumeId) return res.status(404).send('No resume found');

    const bucket = getBucket();
    const files = await bucket.find({ _id: new ObjectId(user.resumeId) }).toArray();
    if (files.length === 0) return res.status(404).send('File not found');

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${files[0].filename}"`);

    const downloadStream = bucket.openDownloadStream(new ObjectId(user.resumeId));
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).send('Error downloading resume');
  }
};

const deleteResume = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    const user = await User.findOne({ userId });
    if (!user?.resumeId) {
      return res.status(404).json({ success: false, message: 'No resume found' });
    }

    const bucket = getBucket();
    await bucket.delete(new ObjectId(user.resumeId));

    user.resumeId = null;
    await user.save();

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Error deleting resume' });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    const user = await User.findOne({ userId: req.user.id });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const bucket = getBucket();

    if (user.profileImageId) {
      await bucket.delete(new ObjectId(user.profileImageId));
    }

    const uploadStream = bucket.openUploadStream(`profile-${Date.now()}`, {
      contentType: req.file.mimetype
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', async () => {
      user.profileImageId = uploadStream.id;
      await user.save();
      res.json({ success: true, message: 'Profile image uploaded successfully' });
    });

    uploadStream.on('error', (err) => {
      console.error('Upload stream error:', err);
      res.status(500).json({ success: false, message: 'Upload failed' });
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

const getProfileImage = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).send('Not logged in');

    const user = await User.findOne({ userId });
    if (!user?.profileImageId) return res.status(404).send('No profile image found');

    const bucket = getBucket();
    const files = await bucket.find({ _id: new ObjectId(user.profileImageId) }).toArray();
    if (files.length === 0) return res.status(404).send('File not found');

    res.set('Content-Type', files[0].contentType || 'image/jpeg');
    const downloadStream = bucket.openDownloadStream(new ObjectId(user.profileImageId));
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).send('Error downloading profile image');
  }
};

const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    const user = await User.findOne({ userId });
    if (!user?.profileImageId) {
      return res.status(404).json({ success: false, message: 'No profile image found' });
    }

    const bucket = getBucket();
    await bucket.delete(new ObjectId(user.profileImageId));

    user.profileImageId = null;
    await user.save();

    res.json({ success: true, message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Error deleting profile image' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  uploadResume,
  getResume,
  deleteResume,
  uploadProfileImage,
  getProfileImage,
  deleteProfileImage
};
