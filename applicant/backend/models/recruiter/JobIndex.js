const mongoose = require("mongoose");

const JobIndexSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs", required: true, unique: true },
  title: { type: String, required: true },
  requiredSkills: [{ type: String }],
  preferredSkills: [{ type: String }],
  experienceRequired: { type: Number, default: 0 },
  roleCategory: [{ type: String }]
}, { timestamps: true });

const createJobIndexModel = (connection) => {
  if (connection.models.JobIndex) {
    return connection.models.JobIndex;
  }
  return connection.model("JobIndex", JobIndexSchema, "jobindexes"); // using plural collection name
};

module.exports = createJobIndexModel;
