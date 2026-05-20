const mongoose = require("mongoose");
const axios = require("axios");
const connectRecruiterDB = require("../config/recruiterDB");
const createJobModel = require("../models/recruiter/Job");
const createInternshipModel = require("../models/recruiter/Internships");
const createCompanyModel = require("../models/recruiter/Company");
const { ObjectId } = require("mongodb");
const User = require("../models/user");
const Applied_for_Jobs = require("../models/Applied_for_Jobs");
const Applied_for_Internships = require("../models/Applied_for_Internships");
const Fuse = require("fuse.js");
const { getBucket } = require("../config/db");
const redis = require("../config/redis");
const { cached } = require("sqlite3");
const notificationService = require("../services/notification.service");

const getJobs = async (req, res) => {
  try {
    const recruiterConn = await connectRecruiterDB();
    const JobFindConn = createJobModel(recruiterConn);

    let { salaryMin, expMin, expMax, page, location } = req.query;

    // -------- VALIDATION --------
    page = parseInt(page);
    if (isNaN(page) || page < 1) page = 1;

    if (salaryMin !== undefined) {
      salaryMin = Number(salaryMin);
      if (isNaN(salaryMin) || salaryMin < 0) {
        return res.status(400).json({ error: "Invalid salaryMin" });
      }
    }

    if (expMin !== undefined) {
      expMin = Number(expMin);
      if (isNaN(expMin) || expMin < 0) {
        return res.status(400).json({ error: "Invalid expMin" });
      }
    }

    if (expMax !== undefined) {
      expMax = Number(expMax);
      if (isNaN(expMax) || expMax < 0) {
        return res.status(400).json({ error: "Invalid expMax" });
      }
    }

    if (expMin !== undefined && expMax !== undefined && expMin > expMax) {
      return res
        .status(400)
        .json({ error: "expMin cannot be greater than expMax" });
    }

    if (location !== undefined) {
      if (typeof location !== "string") {
        return res.status(400).json({ error: "Invalid location" });
      }

      location = location.trim();
      
      if (location.length === 0 || location.length > 50) {
        return res.status(400).json({ error: "Invalid location length" });
      }

      // Must contain at least one letter
      if (!/[a-zA-Z]/.test(location)) {
        return res.status(400).json({ error: "Location must contain letters" });
      }

      // Allow only safe characters
      if (!/^[a-zA-Z0-9\s,-]+$/.test(location)) {
        return res
          .status(400)
          .json({ error: "Location contains invalid characters" });
      }
    }
    // -------- END VALIDATION --------
    // redis here
    const pageSize = 5;
    const filterCriteria = {};

    if (location) {
      filterCriteria.jobLocation = {
        $regex: "^" + location,
        $options: "i",
      };
    }

    if (salaryMin !== undefined) {
      filterCriteria.jobSalary = { $gte: salaryMin };
    }

    if (expMin !== undefined || expMax !== undefined) {
      filterCriteria.jobExperience = {};
      if (expMin !== undefined) filterCriteria.jobExperience.$gte = expMin;
      if (expMax !== undefined) filterCriteria.jobExperience.$lte = expMax;
    }

    const cacheKey = `jobs:location=${location || "any"}:salaryMin=${salaryMin || 0}:expMin=${expMin || 0}:expMax=${expMax || "any"}:page=${page}`;

    let cachedData = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (error) {
      console.error("Redis GET error:", error);
    }

    if(cachedData) {
      res.set("X-Cache", "HIT");
      console.log("Serving from Redis cache");
      return res.status(200).json(JSON.parse(cachedData));
    } else {
      res.set("X-Cache", "MISS");
    }

    console.log("Cache miss - querying MongoDB");

    const jobs = await JobFindConn.aggregate([
      { $match: filterCriteria },
      { $sort: { createdAt: -1 } },
      
      {
        $facet: {
          metaData: [{ $count: "totalcount" }],
          data: [
            { $skip: (page - 1) * pageSize }, 
            { $limit: pageSize },
            {
              $lookup: {
                from: "companies",
                localField: "jobCompany",
                foreignField: "_id",
                as: "jobCompany",
              },
            },
            { $unwind: { path: "$jobCompany", preserveNullAndEmptyArrays: true } },
          ],
        },
      },
    ]);

    const totalCount = jobs[0]?.metaData[0]?.totalcount || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const responseData = {
      message: "success",
      meta: { totalCount, totalPages, page, pageSize },
      jobs: jobs[0]?.data || [],
    };

    try {
      await redis.set(cacheKey, JSON.stringify(responseData), "EX", 120);
    } catch (err) {
      console.error("Redis SET error:", err);
    }

    res.status(200).json(responseData);

  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getInternships = async (req, res) => {
  try {
    const recruiterConn = await connectRecruiterDB();
    const InternshipFindConn = createInternshipModel(recruiterConn);

    let { stipendMin, durationMin, durationMax, page, location } = req.query;

    // -------- VALIDATION --------
    page = parseInt(page);
    if (isNaN(page) || page < 1) page = 1;

    if (stipendMin !== undefined) {
      stipendMin = Number(stipendMin);
      if (isNaN(stipendMin) || stipendMin < 0) {
        return res.status(400).json({ error: "Invalid stipendMin" });
      }
    }

    if (durationMin !== undefined) {
      durationMin = Number(durationMin);
      if (isNaN(durationMin) || durationMin < 0) {
        return res.status(400).json({ error: "Invalid durationMin" });
      }
    }

    if (durationMax !== undefined) {
      durationMax = Number(durationMax);
      if (isNaN(durationMax) || durationMax < 0) {
        return res.status(400).json({ error: "Invalid durationMax" });
      }
    }

    if (
      durationMin !== undefined &&
      durationMax !== undefined &&
      durationMin > durationMax
    ) {
      return res
        .status(400)
        .json({ error: "durationMin cannot be greater than durationMax" });
    }

    if (location !== undefined) {
      if (typeof location !== "string") {
        return res.status(400).json({ error: "Invalid location" });
      }

      location = location.trim();

      if (location.length === 0 || location.length > 50) {
        return res.status(400).json({ error: "Invalid location length" });
      }

      // Must contain at least one letter
      if (!/[a-zA-Z]/.test(location)) {
        return res.status(400).json({ error: "Location must contain letters" });
      }

      // Allow only safe characters
      if (!/^[a-zA-Z0-9\s,-]+$/.test(location)) {
        return res
          .status(400)
          .json({ error: "Location contains invalid characters" });
      }
    }
    // -------- END VALIDATION --------

    const pageSize = 5;
    const filterCriteria = {};
    
    if (location) {
      filterCriteria.intLocation = {
        $regex: location,
        $options: "i",
      };
    }

    if (stipendMin !== undefined) {
      filterCriteria.intStipend = { $gte: stipendMin * 1000 };
    }

    if (durationMin !== undefined || durationMax !== undefined) {
      filterCriteria.intExperience = {};
      if (durationMin !== undefined)
        filterCriteria.intExperience.$gte = durationMin;
      if (durationMax !== undefined)
        filterCriteria.intExperience.$lte = durationMax;
    }
    
    const cacheKey = `internships:location=${location || "any"}:stipendMin=${stipendMin || 0}:durationMin=${durationMin || 0}:durationMax=${durationMax || "any"}:page=${page}`;

    let cachedData = null;
    try {
      cachedData = await redis.get(cacheKey);
    } catch (error) {
      console.error("Redis GET error:", error);
    }

    if(cachedData) {
      res.set("X-Cache", "HIT");
      console.log("Serving from Redis cache");
      return res.status(200).json(JSON.parse(cachedData));
    } else {
      res.set("X-Cache", "MISS");
    }

    console.log("Cache miss - querying MongoDB");

    const internships = await InternshipFindConn.aggregate([
      { $match: filterCriteria },
      { $sort: { createdAt: -1 } },
      
      {
        $facet: {
          metaData: [{ $count: "totalcount" }],
          data: [
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize },
            {
              $lookup: {
                from: "companies",
                localField: "intCompany",
                foreignField: "_id",
                as: "intCompany",
              },
            },
            { $unwind: { path: "$intCompany", preserveNullAndEmptyArrays: true } },
          ],
        },
      },
    ]);

    const totalCount = internships[0]?.metaData[0]?.totalcount || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const responseData = {
      message: "success",
      meta: { totalCount, totalPages, page, pageSize },
      internships: internships[0]?.data || [],
    };

    try {
      await redis.set(cacheKey, JSON.stringify(responseData), "EX", 120);
    } catch (err) {
      console.error("Redis SET error:", err);
    }

    res.status(200).json(responseData);

  } catch (err) {
    console.error("Error fetching internships:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCompanies = async (req, res) => {
  try {
    const recruiterConn = await connectRecruiterDB();
    const CompanyModel = createCompanyModel(recruiterConn);
    const companies = await CompanyModel.find({ verified: true }).lean();
    res.json(companies);
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const filterJobs = async (req, res) => {
  try {
    let {
      salary1, salary2, salary3, salary4,
      exp1, exp2, exp3, exp4, exp5, exp6,
    } = req.body;

    // -------- VALIDATION --------
    const toBoolean = (val) => {
      if (val === true || val === false) return val;
      if (val === "true") return true;
      if (val === "false") return false;
      return null;
    };

    const fields = {
      salary1, salary2, salary3, salary4,
      exp1, exp2, exp3, exp4, exp5, exp6,
    };

    for (let key in fields) {
      const parsed = toBoolean(fields[key]);
      if (parsed === null && fields[key] !== undefined) {
        return res.status(400).json({ error: `Invalid value for ${key}` });
      }
      fields[key] = parsed ?? false; // default false
    }

    ({
      salary1, salary2, salary3, salary4,
      exp1, exp2, exp3, exp4, exp5, exp6,
    } = fields);
    // -------- END VALIDATION --------

    const recruiterConn = await connectRecruiterDB();
    const JobFindConn = createJobModel(recruiterConn);
    createCompanyModel(recruiterConn);

    const query = {};

    // Salary Filters
    let salaryConditions = [];
    if (salary1) salaryConditions.push({ jobSalary: { $lt: 10 } });
    if (salary2) salaryConditions.push({ jobSalary: { $gte: 10, $lte: 20 } });
    if (salary3) salaryConditions.push({ jobSalary: { $gte: 20, $lte: 30 } });
    if (salary4) salaryConditions.push({ jobSalary: { $gte: 30 } });

    if (salaryConditions.length > 0) {
      query.$or = salaryConditions;
    }

    // Experience Filters
    let expConditions = [];
    if (exp1) expConditions.push({ jobExperience: 0 });
    if (exp2) expConditions.push({ jobExperience: { $lt: 1 } });
    if (exp3) expConditions.push({ jobExperience: { $gte: 1, $lte: 3 } });
    if (exp4) expConditions.push({ jobExperience: { $gte: 3, $lte: 5 } });
    if (exp5) expConditions.push({ jobExperience: { $gte: 5, $lte: 10 } });
    if (exp6) expConditions.push({ jobExperience: { $gt: 10 } });

    if (expConditions.length > 0) {
      query.$and = query.$and || [];
      query.$and.push({ $or: expConditions });
    }

    const JobFind = await JobFindConn.find(query)
      .populate({
        path: "jobCompany",
        strictPopulate: false,
      })
      .lean();

    res.json(JobFind);
  } catch (err) {
    console.error("Error filtering jobs:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const filterInternships = async (req, res) => {
  try {
    let { dur1, dur2, dur3, dur4 } = req.body;

    // -------- VALIDATION --------
    const toBoolean = (val) => {
      if (val === true || val === false) return val;
      if (val === "true") return true;
      if (val === "false") return false;
      return null;
    };

    const fields = { dur1, dur2, dur3, dur4 };

    for (let key in fields) {
      const parsed = toBoolean(fields[key]);
      if (parsed === null && fields[key] !== undefined) {
        return res.status(400).json({ error: `Invalid value for ${key}` });
      }
      fields[key] = parsed ?? false;
    }

    ({ dur1, dur2, dur3, dur4 } = fields);
    // -------- END VALIDATION --------

    const recruiterConn = await connectRecruiterDB();
    const InternshipFindConn = createInternshipModel(recruiterConn);
    createCompanyModel(recruiterConn);

    const query = {};

    let durConditions = [];
    if (dur1) durConditions.push({ intDuration: { $lte: 1 } });
    if (dur2) durConditions.push({ intDuration: { $gt: 1, $lte: 3 } });
    if (dur3) durConditions.push({ intDuration: { $gt: 3, $lte: 6 } });
    if (dur4) durConditions.push({ intDuration: { $gt: 6 } });

    if (durConditions.length > 0) {
      query.$or = durConditions;
    }

    const InternshipFind = await InternshipFindConn.find(query)
      .populate({
        path: "intCompany",
        strictPopulate: false,
      })
      .lean();

    res.json(InternshipFind);
  } catch (err) {
    console.error("Error filtering internships:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const recruiterConn = await connectRecruiterDB();
    const JobFindConn = createJobModel(recruiterConn);
    // Register Company model before populate
    createCompanyModel(recruiterConn);

    const job = await JobFindConn.findById(jobId)
      .populate({
        path: "jobCompany",
        strictPopulate: false,
      })
      .lean();

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(job);
  } catch (err) {
    console.error("Error fetching job:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getInternshipById = async (req, res) => {
  try {
    const { internshipId } = req.params;
    const recruiterConn = await connectRecruiterDB();
    const InternshipFindConn = createInternshipModel(recruiterConn);
    // Register Company model before populate
    createCompanyModel(recruiterConn);

    const internship = await InternshipFindConn.findById(internshipId)
      .populate({
        path: "intCompany",
        strictPopulate: false,
      })
      .lean();

    if (!internship) {
      return res.status(404).json({ error: "Internship not found" });
    }

    res.json(internship);
  } catch (err) {
    console.error("Error fetching internship:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const uploadJobApplicationResume = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No resume file uploaded." });
    }
    const userId = req.user?.id;
    const { jobId } = req.params;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "Please login to upload resume." });
    }

    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: "application/pdf",
      metadata: { userId, jobId },
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      res.json({ success: true, resumeId: uploadStream.id.toString() });
    });

    uploadStream.on("error", (err) => {
      console.error("Upload stream error:", err);
      res.status(500).json({ success: false, error: "Resume upload failed." });
    });
  } catch (err) {
    console.error("Error uploading job application resume:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

const uploadInternshipApplicationResume = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No resume file uploaded." });
    }
    const userId = req.user?.id;
    const { internshipId } = req.params;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "Please login to upload resume." });
    }

    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: "application/pdf",
      metadata: { userId, internshipId },
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      res.json({ success: true, resumeId: uploadStream.id.toString() });
    });

    uploadStream.on("error", (err) => {
      console.error("Upload stream error:", err);
      res.status(500).json({ success: false, error: "Resume upload failed." });
    });
  } catch (err) {
    console.error("Error uploading internship application resume:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

const applyForJob = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { jobId } = req.params;
    const { resumeId: applicationResumeId } = req.body || {};

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Please login to apply for this job." });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let resumeIdToUse = null;

    if (applicationResumeId) {
      const bucket = getBucket();
      const files = await bucket
        .find({ _id: new ObjectId(applicationResumeId) })
        .toArray();
      if (files.length === 0) {
        return res
          .status(400)
          .json({ error: "Invalid resume. Please upload the resume again." });
      }
      const file = files[0];
      const meta = file.metadata || {};
      if (meta.userId !== userId || meta.jobId !== jobId) {
        return res
          .status(400)
          .json({ error: "Resume does not belong to this application." });
      }
      resumeIdToUse = new ObjectId(applicationResumeId);
    } else {
      if (!user.resumeId) {
        return res.status(400).json({
          error:
            "Please upload a resume (default or job-specific) to apply for this job.",
        });
      }
      resumeIdToUse = user.resumeId;
    }

    const alreadyApplied = await Applied_for_Jobs.findOne({ userId, jobId });
    if (alreadyApplied) {
      return res
        .status(400)
        .json({ error: "You have already applied for this job." });
    }

    const recruiterConn = await connectRecruiterDB();
    const JobFindConn = createJobModel(recruiterConn);
    createCompanyModel(recruiterConn); // Ensure Company model is registered
    const job = await JobFindConn.findById(jobId).populate("jobCompany");

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    const application = new Applied_for_Jobs({
      userId,
      jobId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      password: user.password,
      resumeId: resumeIdToUse,
      memberSince: user.memberSince,
    });

    await application.save();

    try {
      const companyName = job.jobCompany?.companyName || 'the company';
      await notificationService.sendNotification({
        receiverId: userId,
        type: 'APPLICATION_SUBMITTED',
        title: 'Application Submitted',
        message: `Your application for ${job.jobTitle} at ${companyName} has been submitted successfully.`
      });
    } catch (notifErr) {
      console.error("Failed to send submitted notification:", notifErr);
    }

    res.json({ success: true, message: "Application submitted successfully" });
  } catch (err) {
    console.error("Error applying for job:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

const checkInternshipApplication = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { internshipId } = req.params;

    const recruiterConn = await connectRecruiterDB();
    const InternshipFindConn = createInternshipModel(recruiterConn);
    const internship = await InternshipFindConn.findById(internshipId)
      .populate({
        path: "intCompany",
        strictPopulate: false,
      })
      .lean();

    if (!internship) {
      return res.status(404).json({ error: "Internship not found" });
    }

    const alreadyApplied = userId
      ? await Applied_for_Internships.findOne({ userId, internshipId })
      : null;

    res.json({
      internship,
      alreadyApplied: !!alreadyApplied,
    });
  } catch (err) {
    console.error("Error checking internship application:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const applyForInternship = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { internshipId } = req.params;
    const { resumeId: applicationResumeId } = req.body || {};

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Please login to apply for this internship." });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let resumeIdToUse = null;

    if (applicationResumeId) {
      const bucket = getBucket();
      const files = await bucket
        .find({ _id: new ObjectId(applicationResumeId) })
        .toArray();
      if (files.length === 0) {
        return res
          .status(400)
          .json({ error: "Invalid resume. Please upload the resume again." });
      }
      const file = files[0];
      const meta = file.metadata || {};
      if (meta.userId !== userId || meta.internshipId !== internshipId) {
        return res
          .status(400)
          .json({ error: "Resume does not belong to this application." });
      }
      resumeIdToUse = new ObjectId(applicationResumeId);
    } else {
      if (!user.resumeId) {
        return res.status(400).json({
          error:
            "Please upload a resume (default or internship-specific) to apply for this internship.",
        });
      }
      resumeIdToUse = user.resumeId;
    }

    const alreadyApplied = await Applied_for_Internships.findOne({
      userId,
      internshipId,
    });
    if (alreadyApplied) {
      return res
        .status(400)
        .json({ error: "You have already applied for this internship." });
    }

    const recruiterConn = await connectRecruiterDB();
    const InternshipFindConn = createInternshipModel(recruiterConn);
    createCompanyModel(recruiterConn); // Ensure Company model is registered
    const internship = await InternshipFindConn.findById(internshipId).populate("intCompany");

    if (!internship) {
      return res.status(404).json({ error: "Internship not found" });
    }

    const application = new Applied_for_Internships({
      userId,
      internshipId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      password: user.password,
      resumeId: resumeIdToUse,
      memberSince: user.memberSince,
    });

    await application.save();

    try {
      const position = internship.intProfile || internship.intTitle;
      const companyName = internship.intCompany?.companyName || 'the company';
      await notificationService.sendNotification({
        receiverId: userId,
        type: 'APPLICATION_SUBMITTED',
        title: 'Application Submitted',
        message: `Your application for ${position} at ${companyName} has been submitted successfully.`
      });
    } catch (notifErr) {
      console.error("Failed to send submitted notification:", notifErr);
    }

    res.json({ success: true, message: "Application submitted successfully" });
  } catch (err) {
    console.error("Error applying for internship:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user?.id;
    const applications = await Applied_for_Jobs.find({ userId }).lean();
    res.json(applications);
  } catch (err) {
    console.error("Error fetching applied jobs:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAppliedInternships = async (req, res) => {
  try {
    const userId = req.user?.id;
    const applications = await Applied_for_Internships.find({ userId }).lean();
    res.json(applications);
  } catch (err) {
    console.error("Error fetching applied internships:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getLogo = async (req, res) => {
  try {
    const logoId = req.params.logoId;

    if (!logoId || !mongoose.Types.ObjectId.isValid(logoId)) {
      return res.status(400).json({ error: "Invalid logo ID" });
    }

    const recruiterApiUrl = process.env.RECRUITER_API_URL || 'http://localhost:5000';
    const response = await axios({
      method: "get",
      url: `${recruiterApiUrl}/recruiter/logo/${logoId}`,
      responseType: "stream",
      validateStatus: (status) => status < 500, // Don't throw on 404
    });

    if (response.status === 404) {
      return res.status(404).json({ error: "Logo not found" });
    }

    if (response.status !== 200) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch logo" });
    }

    res.setHeader(
      "Content-Type",
      response.headers["content-type"] || "image/png",
    );
    response.data.pipe(res);
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ error: "Logo not found" });
    }
    console.error("Error proxying logo:", error.message);
    res.status(500).json({ error: "Failed to fetch logo" });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [appliedJobs, appliedInternships] = await Promise.all([
      Applied_for_Jobs.find({ userId }),
      Applied_for_Internships.find({ userId }),
    ]);

    const totalJobs = appliedJobs.length;
    const totalInternships = appliedInternships.length;
    const totalApplications = totalJobs + totalInternships;

    const allApplications = [...appliedJobs, ...appliedInternships];

    const selected = allApplications.filter((a) => a.isSelected).length;
    const rejected = allApplications.filter(
      (a) => !a.isSelected && a.isRejected,
    ).length;
    const pending = allApplications.filter(
      (a) => !a.isSelected && !a.isRejected,
    ).length;

    const responseRate =
      totalApplications > 0
        ? Math.round(((selected + rejected) / totalApplications) * 100)
        : 0;

    // Build monthly timeline for the last 12 months
    const now = new Date();
    const monthlyData = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = 0;
    }

    allApplications.forEach((app) => {
      const date = new Date(app.AppliedAt || app.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthlyData) monthlyData[key]++;
    });

    res.json({
      totalApplications,
      totalJobs,
      totalInternships,
      selected,
      rejected,
      pending,
      responseRate,
      monthly: monthlyData,
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = {
  getJobs,
  getInternships,
  getCompanies,
  filterJobs,
  filterInternships,
  getJobById,
  getInternshipById,
  uploadJobApplicationResume,
  uploadInternshipApplicationResume,
  applyForJob,
  checkInternshipApplication,
  applyForInternship,
  getAppliedJobs,
  getAppliedInternships,
  getLogo,
  getDashboardStats,
};
