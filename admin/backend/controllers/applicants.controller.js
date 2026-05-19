const mongoose = require('mongoose');
const connectApplicantDB = require('../config/applicantDB');

function createUserModel(connection) {
  if (connection.models.User) {
    return connection.models.User; // reuse existing model
  }
  const applicantSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId },
    appliedAt: { type: Date, default: Date.now }
  });

  return connection.model("User", applicantSchema);
}

const getApplicants = async (req, res) => {
  try {
    const applicantConn = await connectApplicantDB();
    const UserModel = createUserModel(applicantConn);
    const applicants = await UserModel.find({});
    console.log("hello")
    res.json(applicants);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getApplicantById = async (req, res) => {
  try {
    const { id } = req.params;
    const applicantConn = await connectApplicantDB();
    const UserModel = createUserModel(applicantConn);
    const applicant = await UserModel.findById(id);
    
    if (!applicant) {
      return res.status(404).json({ error: "Applicant not found" });
    }
    
    res.json(applicant);
  } catch (error) {
    console.error("Error fetching applicant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteApplicant = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const applicantConn = await connectApplicantDB();
    const UserModel = createUserModel(applicantConn);
    
    const deletedDoc = await UserModel.findByIdAndDelete(id);
    if (!deletedDoc) {
      return res.status(404).json({ message: 'Applicant not found.' });
    }

    res.json({ message: 'Applicant deleted successfully.' });
  } catch (err) {
    console.error("Error deleting applicant:", err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  getApplicants,
  getApplicantById,
  deleteApplicant
};

