const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobTitle: String,
  jobDescription: String,
  jobRequirements: String,
  jobSalary: Number,
  jobLocation: String,
  jobType: String,
  jobExperience: Number,
  noofPositions: Number,
  jobCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  createdBy: mongoose.Schema.Types.ObjectId,
  jobExpiry: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
}, { timestamps: true });

jobSchema.index({
  jobLocation: 1,
  jobSalary: 1,
  jobExperience: 1,
  createdAt: -1
});

jobSchema.index({
  jobTitle: "text",
  jobDescription: "text",
});

module.exports = (connection) => {
  return connection.models.Job || connection.model('Job', jobSchema);
};

