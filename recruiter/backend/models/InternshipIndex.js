const mongoose = require("mongoose");

const InternshipIndexSchema = new mongoose.Schema({
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Internships", required: true, unique: true },
  title: { type: String, required: true },
  requiredSkills: [{ type: String }],
  preferredSkills: [{ type: String }],
  experienceRequired: { type: Number, default: 0 },
  roleCategory: [{ type: String }]
}, { timestamps: true });

InternshipIndexSchema.index({ requiredSkills: 1 });
InternshipIndexSchema.index({ roleCategory: 1 });
InternshipIndexSchema.index({ experienceRequired: 1 });

module.exports = mongoose.model("InternshipIndex", InternshipIndexSchema);
