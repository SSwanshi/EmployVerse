// models/Company.js
const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  companyName: String,
  website: String,
  location: String,
  logoId: { type: mongoose.Schema.Types.ObjectId, ref: "uploads.files" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verified: { type: Boolean, default: false },
  proofDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: "uploads.files" },
}, { timestamps: true });

// Export as dynamic model
module.exports = (connection) => {
  return connection.model("Company", CompanySchema, "companies");
};

