const mongoose = require('mongoose');
const connectRecruiterDB = require('../config/recruiterDB');
const recruiterSchema = require('../models/Recruiter');

const getRecruiters = async (req, res) => {
  try {
    const recruiterConn = await connectRecruiterDB();
    
    // Register model if not already registered
    if (!recruiterConn.models.RecruiterUser) {
      recruiterConn.model('RecruiterUser', recruiterSchema);
    }
    
    const RecruiterModel = recruiterConn.model('RecruiterUser');
    const recruiters = await RecruiterModel.find({});
    
    res.json(recruiters);
  } catch (error) {
    console.error("Error fetching recruiters:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getRecruiterById = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterConn = await connectRecruiterDB();
    
    if (!recruiterConn.models.RecruiterUser) {
      recruiterConn.model('RecruiterUser', recruiterSchema);
    }
    
    const RecruiterModel = recruiterConn.model('RecruiterUser');
    const recruiter = await RecruiterModel.findById(id);
    
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter not found" });
    }
    
    res.json(recruiter);
  } catch (error) {
    console.error("Error fetching recruiter:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const recruiterConn = await connectRecruiterDB();
    
    if (!recruiterConn.models.RecruiterUser) {
      recruiterConn.model('RecruiterUser', recruiterSchema);
    }
    
    const RecruiterModel = recruiterConn.model('RecruiterUser');
    const deletedDoc = await RecruiterModel.findByIdAndDelete(id);
    
    if (!deletedDoc) {
      return res.status(404).json({ message: 'Recruiter not found.' });
    }

    res.json({ message: 'Recruiter deleted successfully.' });
  } catch (err) {
    console.error("Error deleting recruiter:", err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  getRecruiters,
  getRecruiterById,
  deleteRecruiter
};

