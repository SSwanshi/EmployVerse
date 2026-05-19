const mongoose = require('mongoose');
const connectRecruiterDB = require('../config/recruiterDB');
const createCompanyModel = require('../models/Company');

const getCompanies = async (req, res) => {
  try {
    const recruiterConn = await connectRecruiterDB();
    const CompanyModel = createCompanyModel(recruiterConn);
    const companies = await CompanyModel.find({});
    res.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCompaniesAwaitingVerification = async (req, res) => {
  try {
    const recruiterConn = await connectRecruiterDB();
    const CompanyModel = createCompanyModel(recruiterConn);
    const companies = await CompanyModel.find({ verified: false });
    res.json(companies);
  } catch (error) {
    console.error("Error fetching companies awaiting verification:", error);
    res.status(500).json({ error: "Failed to fetch companies awaiting verification" });
  }
};

const verifyCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterConn = await connectRecruiterDB();
    const CompanyModel = createCompanyModel(recruiterConn);
    
    const company = await CompanyModel.findById(id);
    
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    
    company.verified = true;
    await company.save();
    
    res.json({ success: true, message: "Company verified successfully", company });
  } catch (error) {
    console.error("Error verifying company:", error);
    res.status(500).json({ error: "Verification failed" });
  }
};

const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const recruiterConn = await connectRecruiterDB();
    const CompanyModel = createCompanyModel(recruiterConn);
    const company = await CompanyModel.findById(id);
    
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    
    res.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const recruiterConn = await connectRecruiterDB();
    const CompanyModel = createCompanyModel(recruiterConn);
    
    const deletedDoc = await CompanyModel.findByIdAndDelete(id);
    if (!deletedDoc) {
      return res.status(404).json({ message: 'Company not found.' });
    }

    res.json({ message: 'Company deleted successfully.' });
  } catch (err) {
    console.error("Error deleting company:", err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  getCompanies,
  getCompaniesAwaitingVerification,
  verifyCompany,
  getCompanyById,
  deleteCompany
};

