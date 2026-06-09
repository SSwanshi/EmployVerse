const mongoose = require("mongoose");

const InternshipIndexSchema = new mongoose.Schema({
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Internships", required: true, unique: true },
  title: { type: String, required: true },
  requiredSkills: [{ type: String }],
  preferredSkills: [{ type: String }],
  experienceRequired: { type: Number, default: 0 },
  roleCategory: [{ type: String }]
}, { timestamps: true });

const createInternshipIndexModel = (connection) => {
  if (connection.models.InternshipIndex) {
    return connection.models.InternshipIndex;
  }
  return connection.model("InternshipIndex", InternshipIndexSchema, "internshipindexes");
};

module.exports = createInternshipIndexModel;
