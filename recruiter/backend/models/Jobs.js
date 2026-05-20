const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  jobDescription: { type: String, required: true },
  jobRequirements: { type: String, required: true },
  jobSalary: { type: Number, required: true },
  jobLocation: { type: String, required: true },
  jobType: { type: String, required: true, enum: ["Full-Time", "Part-Time", "Internship"] },
  jobExperience: { type: Number, required: true },
  noofPositions: { type: Number, required: true },
  jobCompany: { type: mongoose.Schema.Types.ObjectId, ref: "Companies", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  jobExpiry: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
}, { timestamps: true });

// Single-field indexes for individual filter queries
JobSchema.index({ jobLocation: 1 });                              // location search
JobSchema.index({ jobSalary: 1 });                                // salary filter
JobSchema.index({ jobExperience: 1 });                            // experience filter
JobSchema.index({ jobCompany: 1 });                               // company populate/lookup
JobSchema.index({ createdAt: -1 });                               // default sort (newest first)
JobSchema.index({ jobExpiry: 1 });                                // expiry filtering
// Compound index — matches the combined filter query used in aggregation pipeline
JobSchema.index({ jobLocation: 1, jobSalary: 1, jobExperience: 1 });

module.exports = mongoose.model("Jobs", JobSchema);

