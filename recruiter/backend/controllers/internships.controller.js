const mongoose = require('mongoose');
const Internship = require('../models/Internship');
const Company = require('../models/Companies');
const invalidateInternshipCache = require('../utils/cacheInvalidation').invalidateInternshipCache;
const redis = require('../config/redis');
const getInternships = async (req, res) => {
  try {
    const internships = await Internship.find({ createdBy: req.userId }).populate("intCompany");
    res.json({ success: true, internships });
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch internships' });
  }
};

const addInternship = async (req, res) => {
  try {
    const {
      intTitle,
      intDescription,
      intRequirements,
      intStipend,
      intLocation,
      intDuration,
      intExperience,
      intPositions,
      intCompany,
      intExpiry
    } = req.body;

    // Check if non-premium user has already posted an internship
    if (!req.user.isPremium) {
      const existingInternshipCount = await Internship.countDocuments({ createdBy: req.userId });
      if (existingInternshipCount >= 1) {
        return res.status(403).json({
          success: false,
          message: "Free users can only post 1 internship. Upgrade to Pro for unlimited internship posts!",
          limitReached: true
        });
      }
    }

    if (!intTitle || !intDescription || !intRequirements || intStipend === undefined || intStipend === null ||
      !intLocation || !intDuration || intExperience === undefined || intExperience === null || !intPositions || !intCompany || !intExpiry) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const companyExists = await Company.findOne({
      _id: intCompany,
      createdBy: req.userId,
      verified: true
    });

    if (!companyExists) {
      return res.status(400).json({ success: false, message: "Company must be verified to post an internship." });
    }

    const newInternship = new Internship({
      intTitle,
      intDescription,
      intRequirements,
      intStipend: parseFloat(intStipend),
      intLocation,
      intDuration,
      intExperience: parseInt(intExperience),
      intPositions: parseInt(intPositions),
      intCompany: companyExists._id,
      createdBy: req.userId,
      intExpiry: new Date(intExpiry)
    });

    await newInternship.save();
    invalidateInternshipCache(redis);
    res.json({ success: true, message: "Internship added successfully!", internship: newInternship });
  } catch (error) {
    console.error("Error adding internship:", error);
    res.status(500).json({ success: false, message: 'Failed to add internship' });
  }
};

const getEditInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id).populate("intCompany");
    const companies = await Company.find({ createdBy: req.userId });

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }
    invalidateInternshipCache(redis);
    res.json({ success: true, internship, companies });
  } catch (err) {
    console.error("Error loading edit internship page:", err);
    res.status(500).json({ success: false, error: 'Failed to fetch internship' });
  }
};

const updateInternship = async (req, res) => {
  try {
    const {
      intTitle,
      intDescription,
      intRequirements,
      intStipend,
      intLocation,
      intDuration,
      intExperience,
      intPositions,
      intCompany,
      intExpiry
    } = req.body;

    const updateData = {
      intTitle,
      intDescription,
      intRequirements,
      intStipend: parseFloat(intStipend),
      intLocation,
      intDuration,
      intExperience: parseInt(intExperience),
      intPositions: parseInt(intPositions),
      intCompany,
      intExpiry: new Date(intExpiry)
    };

    const internship = await Internship.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }
    invalidateInternshipCache(redis)
    res.json({ success: true, message: "Internship updated successfully!", internship });
  } catch (err) {
    console.error("Error updating internship:", err);
    res.status(500).json({ success: false, message: 'Failed to update internship' });
  }
};

const deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndDelete(req.params.intId);
    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }
    invalidateInternshipCache(redis)
    res.json({ success: true, message: 'Internship deleted successfully' });
  } catch (error) {
    console.error('Error deleting internship:', error);
    res.status(500).json({ success: false, message: 'Failed to delete internship' });
  }
};

module.exports = {
  getInternships,
  addInternship,
  getEditInternship,
  updateInternship,
  deleteInternship
};

