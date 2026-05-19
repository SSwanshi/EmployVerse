const mongoose = require('mongoose');
const connectApplicantDB = require('../config/applicantDB');
const connectRecruiterDB = require('../config/recruiterDB');
const createJobModel = require('../models/Job');
const createInternshipModel = require('../models/Internship');
const createCompanyModel = require('../models/Company');
const { initGridFS } = require('../db/gridfs');

function createPremiumUserModel(connection) {
  if (connection.models.Premium_User) {
    return connection.models.Premium_User; // reuse existing model
  }
  const premiumUserSchema = new mongoose.Schema({
    userId: {
      type: String,
      unique: true,
      default: () => Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+\@.+\..+/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other']
    },
    password: {
      type: String,
      required: true
    },
    memberSince: {
      type: Date,
      default: Date.now
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'uploads.files'
    }
  }, { timestamps: true });

  return connection.model("Premium_User", premiumUserSchema);
}

const fetchPremiumUsers = async () => {
  const applicantConn = await connectApplicantDB();
  const PremiumUserModel = createPremiumUserModel(applicantConn);

  const users = await PremiumUserModel.find({})
    .select('email firstName lastName memberSince')
    .sort({ email: 1 })
    .lean();

  return users.map((user) => ({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    memberSince: user.memberSince,
    status: 'Premium'
  }));
};

// REST API
const getPremiumUsers = async (req, res) => {
  try {
    const users = await fetchPremiumUsers();
    return res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching premium users:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// SOAP API
function getPremiumUsersSoap(args, callback) {
  fetchPremiumUsers()
    .then((users) => callback(null, { users }))
    .catch((error) => {
      console.error('SOAP ERROR:', error);
      callback({
        Fault: {
          faultcode: '500',
          faultstring: 'Internal Server Error'
        }
      });
    });
}



const getProofDocument = async (req, res) => {
  try {
    const { proofId } = req.params;

    if (!proofId || !mongoose.Types.ObjectId.isValid(proofId)) {
      return res.status(400).json({ error: "Invalid proof document ID" });
    }

    const { gfs } = await initGridFS();

    if (!gfs) {
      return res.status(500).json({ error: "GridFS is not initialized" });
    }

    const fileId = new mongoose.Types.ObjectId(proofId);

    const fileData = await gfs.find({ _id: fileId }).toArray();

    if (!fileData || fileData.length === 0) {
      return res.status(404).json({ error: "Proof document not found" });
    }

    const file = fileData[0];

    // Set CORS headers FIRST, before any other headers
    const origin = req.headers.origin;
    if (origin) {
      res.set('Access-Control-Allow-Origin', origin);
    } else {
      res.set('Access-Control-Allow-Origin', '*');
    }
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Allow-Credentials', 'true');

    // Set content headers
    res.set('Content-Type', file.contentType || 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${file.filename || 'proof-document'}"`);
    res.set('Cache-Control', 'public, max-age=3600');

    const readStream = gfs.openDownloadStream(file._id);

    // Handle stream errors
    readStream.on('error', (error) => {
      console.error("Error streaming proof document:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to stream document" });
      }
    });

    // Handle response errors
    res.on('error', (error) => {
      console.error("Error sending response:", error);
    });

    readStream.pipe(res);
  } catch (error) {
    console.error("Error downloading proof document:", error);
    if (!res.headersSent) {
      if (error.name === 'BSONTypeError' || error.message.includes('ObjectId')) {
        return res.status(400).json({ error: "Invalid proof document ID format" });
      }
      res.status(500).json({ error: "Failed to download document" });
    }
  }
};

function createUserModel(connection) {
  if (connection.models.User) {
    return connection.models.User;
  }
  const userSchema = new mongoose.Schema({
    email: String
  }, { timestamps: true });
  return connection.model("User", userSchema);
}

const getStats = async (req, res) => {
  try {
    const recruiterConn = await connectRecruiterDB();
    const applicantConn = await connectApplicantDB();

    const JobModel = createJobModel(recruiterConn);
    const InternshipModel = createInternshipModel(recruiterConn);
    const CompanyModel = createCompanyModel(recruiterConn);
    const UserModel = createUserModel(applicantConn);

    const [jobCount, internshipCount, companyCount, applicantCount] = await Promise.all([
      JobModel.countDocuments({}),
      InternshipModel.countDocuments({}),
      CompanyModel.countDocuments({}),
      UserModel.countDocuments({})
    ]);

    res.json({
      jobCount,
      internshipCount,
      companyCount,
      applicantCount
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getPremiumUsers,
  getPremiumUsersSoap,
  getProofDocument,
  getStats
};

