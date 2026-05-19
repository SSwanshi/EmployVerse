const connectRecruiterDB = require("../config/recruiterDB");
const createJobModel = require("../models/recruiter/Job");
const createInternshipModel = require("../models/recruiter/Internships");
const createCompanyModel = require("../models/recruiter/Company");

function parsePositiveInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseOptionalNumber(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

async function getJobs({
  salaryMin,
  expMin,
  expMax,
  page = 1,
  location,
} = {}) {
  const recruiterConn = await connectRecruiterDB();
  const Job = createJobModel(recruiterConn);

  const pageSize = 5;
  const safePage = parsePositiveInt(page, 1);
  const filterCriteria = {};

  const salaryMinNum = parseOptionalNumber(salaryMin);
  if (salaryMinNum !== undefined) filterCriteria.jobSalary = { $gte: salaryMinNum };

  const expMinNum = parseOptionalNumber(expMin);
  const expMaxNum = parseOptionalNumber(expMax);
  if (expMinNum !== undefined || expMaxNum !== undefined) {
    filterCriteria.jobExperience = {};
    if (expMinNum !== undefined) filterCriteria.jobExperience.$gte = expMinNum;
    if (expMaxNum !== undefined) filterCriteria.jobExperience.$lte = expMaxNum;
  }

  if (typeof location === "string" && location.trim()) {
    filterCriteria.jobLocation = { $regex: location.trim(), $options: "i" };
  }

  const jobsAgg = await Job.aggregate([
    { $match: filterCriteria },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "companies",
        localField: "jobCompany",
        foreignField: "_id",
        as: "jobCompany",
      },
    },
    { $unwind: { path: "$jobCompany", preserveNullAndEmptyArrays: true } },
    {
      $facet: {
        metaData: [{ $count: "totalcount" }],
        data: [{ $skip: (safePage - 1) * pageSize }, { $limit: pageSize }],
      },
    },
  ]);

  const totalCount = jobsAgg[0]?.metaData[0]?.totalcount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    meta: { totalCount, totalPages, page: safePage, pageSize },
    jobs: jobsAgg[0]?.data || [],
  };
}

async function getInternships({
  stipendMin,
  durationMin,
  durationMax,
  page = 1,
  location,
} = {}) {
  const recruiterConn = await connectRecruiterDB();
  const Internship = createInternshipModel(recruiterConn);

  const pageSize = 5;
  const safePage = parsePositiveInt(page, 1);
  const filterCriteria = {};

  const stipendMinNum = parseOptionalNumber(stipendMin);
  if (stipendMinNum !== undefined) {
    // Matches existing REST behavior (stipend is stored in thousands)
    filterCriteria.intStipend = { $gte: stipendMinNum * 1000 };
  }

  const durationMinNum = parseOptionalNumber(durationMin);
  const durationMaxNum = parseOptionalNumber(durationMax);
  if (durationMinNum !== undefined || durationMaxNum !== undefined) {
    filterCriteria.intExperience = {};
    if (durationMinNum !== undefined) filterCriteria.intExperience.$gte = durationMinNum;
    if (durationMaxNum !== undefined) filterCriteria.intExperience.$lte = durationMaxNum;
  }

  if (typeof location === "string" && location.trim()) {
    filterCriteria.intLocation = { $regex: location.trim(), $options: "i" };
  }

  const internshipsAgg = await Internship.aggregate([
    { $match: filterCriteria },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "companies",
        localField: "intCompany",
        foreignField: "_id",
        as: "intCompany",
      },
    },
    { $unwind: { path: "$intCompany", preserveNullAndEmptyArrays: true } },
    {
      $facet: {
        metaData: [{ $count: "totalcount" }],
        data: [{ $skip: (safePage - 1) * pageSize }, { $limit: pageSize }],
      },
    },
  ]);

  const totalCount = internshipsAgg[0]?.metaData[0]?.totalcount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    meta: { totalCount, totalPages, page: safePage, pageSize },
    internships: internshipsAgg[0]?.data || [],
  };
}

async function getCompanies() {
  const recruiterConn = await connectRecruiterDB();
  const Company = createCompanyModel(recruiterConn);
  return await Company.find({ verified: true }).lean();
}

async function getJobById(id) {
  const recruiterConn = await connectRecruiterDB();
  const Job = createJobModel(recruiterConn);
  createCompanyModel(recruiterConn);
  return await Job.findById(id)
    .populate({ path: "jobCompany", strictPopulate: false })
    .lean();
}

async function getInternshipById(id) {
  const recruiterConn = await connectRecruiterDB();
  const Internship = createInternshipModel(recruiterConn);
  createCompanyModel(recruiterConn);
  return await Internship.findById(id)
    .populate({ path: "intCompany", strictPopulate: false })
    .lean();
}

module.exports = {
  getJobs,
  getInternships,
  getCompanies,
  getJobById,
  getInternshipById,
};

