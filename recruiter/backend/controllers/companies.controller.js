const mongoose = require('mongoose');
const Company = require('../models/Companies');
const { getBucket } = require('../config/db');

const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ createdBy: req.userId });
    res.json({ success: true, companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch Companies' });
  }
};

const addCompany = async (req, res) => {
  try {
    const { companyName, website, location } = req.body;

    // Check if non-premium user has already added a company
    if (!req.user.isPremium) {
      const existingCompanyCount = await Company.countDocuments({ createdBy: req.userId });
      if (existingCompanyCount >= 1) {
        return res.status(403).json({
          success: false,
          message: "Free users can only add 1 company. Upgrade to Pro for unlimited companies!",
          limitReached: true
        });
      }
    }

    if (!companyName || !website || !location) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const bucket = getBucket();
    let logoId = null;
    if (req.files && req.files.logo) {
      const uploadStream = bucket.openUploadStream(req.files.logo[0].originalname);
      uploadStream.end(req.files.logo[0].buffer);
      logoId = uploadStream.id;
    }

    let proofDocumentId = null;
    if (req.files && req.files.proofDocument) {
      const uploadStream = bucket.openUploadStream(req.files.proofDocument[0].originalname);
      uploadStream.end(req.files.proofDocument[0].buffer);
      proofDocumentId = uploadStream.id;
    }

    const newCompany = new Company({
      companyName: companyName.trim(),
      website: website.trim(),
      location: location.trim(),
      logoId,
      proofDocumentId,
      createdBy: req.userId,
      verified: false
    });

    await newCompany.save();

    res.json({ success: true, message: "Company added successfully, awaiting verification!", company: newCompany });
  } catch (error) {
    console.error("Error adding company:", error);
    res.status(500).json({ success: false, message: "Failed to add company" });
  }
};

const getEditCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, company });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch company' });
  }
};

const updateCompany = async (req, res) => {
  try {
    const { companyName, website, location } = req.body;

    if (!companyName || !website || !location) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const updateData = {
      companyName: companyName.trim(),
      website: website.trim(),
      location: location.trim()
    };

    const bucket = getBucket();

    if (req.files && req.files.logo) {
      const uploadStream = bucket.openUploadStream(req.files.logo[0].originalname);
      uploadStream.end(req.files.logo[0].buffer);
      updateData.logoId = uploadStream.id;
    }

    if (req.files && req.files.proofDocument) {
      const uploadStream = bucket.openUploadStream(req.files.proofDocument[0].originalname);
      uploadStream.end(req.files.proofDocument[0].buffer);
      updateData.proofDocumentId = uploadStream.id;
    }

    const company = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, message: "Company updated successfully!", company });
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ success: false, message: "Failed to update company" });
  }
};

const deleteCompany = async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.companyId);
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ success: false, error: 'Failed to delete company' });
  }
};

module.exports = {
  getCompanies,
  addCompany,
  getEditCompany,
  updateCompany,
  deleteCompany
};

