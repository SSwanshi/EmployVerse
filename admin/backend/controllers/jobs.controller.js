const mongoose = require('mongoose');
const connectRecruiterDB = require('../config/recruiterDB');
const createJobModel = require('../models/Job');
const createCompanyModel = require('../models/Company');

const getJobs = async (req, res) => {
  try {
    const recruiterConn = await connectRecruiterDB();
    const JobModel = createJobModel(recruiterConn);
    const CompanyModel = createCompanyModel(recruiterConn);

    const jobs = await JobModel.find({}).populate("jobCompany").lean();

    // Group by company name
    const companyMap = {};

    jobs.forEach((job) => {
      const companyName = job.jobCompany?.companyName;
      if (!companyName) return;

      if (!companyMap[companyName]) {
        companyMap[companyName] = {
          ...job.jobCompany,
          jobs: [],
        };
      }
      companyMap[companyName].jobs.push(job);
    });

    res.json(Object.values(companyMap));
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterConn = await connectRecruiterDB();
    const JobModel = createJobModel(recruiterConn);
    const job = await JobModel.findById(id).populate("jobCompany");
    
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    
    res.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const recruiterConn = await connectRecruiterDB();
    const JobModel = createJobModel(recruiterConn);
    
    const deletedDoc = await JobModel.findByIdAndDelete(id);
    if (!deletedDoc) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    res.json({ message: 'Job deleted successfully.' });
  } catch (err) {
    console.error("Error deleting job:", err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  getJobs,
  getJobById,
  deleteJob
};

