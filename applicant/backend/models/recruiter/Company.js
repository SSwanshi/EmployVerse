const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
  companyName: String,
  website: String,
  location: String,
  logoId: { type: mongoose.Schema.Types.ObjectId, ref: "uploads.files" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = (connection) => {
  return connection.model("Company", CompanySchema, "companies");
};

