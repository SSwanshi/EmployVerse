const mongoose = require("mongoose");

const JobIndexSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs", required: true, unique: true },
  title: { type: String, required: true },
  requiredSkills: [{ type: String }],
  preferredSkills: [{ type: String }],
  experienceRequired: { type: Number, default: 0 },
  roleCategory: [{ type: String }]
}, { timestamps: true });

JobIndexSchema.index({ requiredSkills: 1 });
JobIndexSchema.index({ roleCategory: 1 });
JobIndexSchema.index({ experienceRequired: 1 });

module.exports = mongoose.model("JobIndex", JobIndexSchema);
