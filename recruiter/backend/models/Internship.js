const mongoose = require("mongoose");

const InternshipSchema = new mongoose.Schema({
  intTitle: { type: String, required: true },
  intDescription: { type: String, required: true },
  intRequirements: { type: String, required: true },
  intStipend: { type: Number, required: true },
  intLocation: { type: String, required: true },
  intDuration: { type: Number, required: true },
  intExperience: { type: Number, required: true },
  intPositions: { type: Number, required: true },
  intCompany: { type: mongoose.Schema.Types.ObjectId, ref: "Companies", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  intExpiry: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
}, { timestamps: true });

// Single-field indexes for individual filter queries
InternshipSchema.index({ intLocation: 1 });                              // location search
InternshipSchema.index({ intStipend: 1 });                               // stipend filter
InternshipSchema.index({ intDuration: 1 });                              // duration filter
InternshipSchema.index({ intExperience: 1 });                            // experience filter
InternshipSchema.index({ intCompany: 1 });                               // company populate/lookup
InternshipSchema.index({ createdAt: -1 });                               // default sort (newest first)
InternshipSchema.index({ intExpiry: 1 });                                // expiry filtering
// Compound index — matches the combined filter query used in aggregation pipeline
InternshipSchema.index({ intLocation: 1, intStipend: 1, intDuration: 1 });

module.exports = mongoose.model("Internship", InternshipSchema);

