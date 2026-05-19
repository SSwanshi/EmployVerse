const mongoose = require('mongoose');
const connectRecruiterDB = require('../config/recruiterDB');
const createInternshipModel = require('../models/Internship');
const createCompanyModel = require('../models/Company');

const getInternships = async (req, res) => {
  try {
    const recruiterConn = await connectRecruiterDB();
    const CompanyModel = createCompanyModel(recruiterConn);
    const InternshipModel = createInternshipModel(recruiterConn);

    const internships = await InternshipModel.find({})
      .populate({
        path: "intCompany",
        model: "Company",
        strictPopulate: false,
      })
      .lean();

    // Group by company name
    const companyMap = {};

    internships.forEach((intern) => {
      const company = intern.intCompany;
      if (!company) return;

      const companyName = company.companyName;
      if (!companyName) return;

      if (!companyMap[companyName]) {
        companyMap[companyName] = {
          ...company,
          internships: [],
        };
      }
      companyMap[companyName].internships.push(intern);
    });

    res.json(Object.values(companyMap));
  } catch (err) {
    console.error("Error fetching internships:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getInternshipById = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterConn = await connectRecruiterDB();
    const InternshipModel = createInternshipModel(recruiterConn);
    const internship = await InternshipModel.findById(id).populate("intCompany");
    
    if (!internship) {
      return res.status(404).json({ error: "Internship not found" });
    }
    
    res.json(internship);
  } catch (error) {
    console.error("Error fetching internship:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteInternship = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const recruiterConn = await connectRecruiterDB();
    const InternshipModel = createInternshipModel(recruiterConn);
    
    const deletedDoc = await InternshipModel.findByIdAndDelete(id);
    if (!deletedDoc) {
      return res.status(404).json({ message: 'Internship not found.' });
    }

    res.json({ message: 'Internship deleted successfully.' });
  } catch (err) {
    console.error("Error deleting internship:", err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  getInternships,
  getInternshipById,
  deleteInternship
};

