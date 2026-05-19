const mongoose = require('mongoose');
const connectApplicantDB = require('../config/applicantDB');
const connectRecruiterDB = require('../config/recruiterDB');
const connectAdminDB = require('../config/db');
const createCompanyModel = require('../models/Company');
const recruiterSchema = require('../models/Recruiter');

// Helper function to create User model for Applicants
function createUserModel(connection) {
  if (connection.models.User) {
    return connection.models.User;
  }
  const applicantSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId },
    appliedAt: { type: Date, default: Date.now }
  });

  return connection.model("User", applicantSchema);
}

// Helper to format documents
const ensureString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const ensureIsoDate = (value) => {
  const date = value ? new Date(value) : new Date(0);
  return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
};

const formatApplicant = (applicant) => ({
  id: applicant._id,
  firstName: ensureString(applicant.firstName, 'Unknown'),
  lastName: ensureString(applicant.lastName, 'Unknown'),
  email: ensureString(applicant.email, ''),
  companyName: ensureString(applicant.companyName, 'Not specified'),
  resumeId: applicant.resumeId?.toString(),
  appliedAt: ensureIsoDate(applicant.appliedAt)
});

const formatRecruiter = (recruiter) => ({
  id: recruiter._id,
  firstName: ensureString(recruiter.firstName, 'Unknown'),
  lastName: ensureString(recruiter.lastName, 'Unknown'),
  email: ensureString(recruiter.email, ''),
  createdAt: ensureIsoDate(recruiter.createdAt)
});

const formatCompany = (company) => ({
  id: company._id,
  companyName: ensureString(company.companyName, 'Unknown Company'),
  website: company.website,
  location: company.location,
  logoId: company.logoId?.toString(),
  verified: Boolean(company.verified),
  proofDocumentId: company.proofDocumentId?.toString(),
  createdAt: ensureIsoDate(company.createdAt),
  updatedAt: ensureIsoDate(company.updatedAt)
});

const resolvers = {
  Query: {
    // Applicant Queries
    applicants: async () => {
      try {
        const applicantConn = await connectApplicantDB();
        const UserModel = createUserModel(applicantConn);
        const applicants = await UserModel.find();
        return applicants.map(formatApplicant);
      } catch (error) {
        console.error("Error fetching applicants:", error);
        throw new Error("Failed to fetch applicants");
      }
    },

    applicant: async (_, { id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid applicant ID");
        }
        const applicantConn = await connectApplicantDB();
        const UserModel = createUserModel(applicantConn);
        const applicant = await UserModel.findById(id);
        return applicant ? formatApplicant(applicant) : null;
      } catch (error) {
        console.error("Error fetching applicant:", error);
        throw error;
      }
    },

    // Recruiter Queries
    recruiters: async () => {
      try {
        const recruiterConn = await connectRecruiterDB();
        if (!recruiterConn.models.RecruiterUser) {
          recruiterConn.model('RecruiterUser', recruiterSchema);
        }
        const RecruiterModel = recruiterConn.model('RecruiterUser');
        const recruiters = await RecruiterModel.find();
        return recruiters.map(formatRecruiter);
      } catch (error) {
        console.error("Error fetching recruiters:", error);
        throw new Error("Failed to fetch recruiters");
      }
    },

    recruiter: async (_, { id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid recruiter ID");
        }
        const recruiterConn = await connectRecruiterDB();
        if (!recruiterConn.models.RecruiterUser) {
          recruiterConn.model('RecruiterUser', recruiterSchema);
        }
        const RecruiterModel = recruiterConn.model('RecruiterUser');
        const recruiter = await RecruiterModel.findById(id);
        return recruiter ? formatRecruiter(recruiter) : null;
      } catch (error) {
        console.error("Error fetching recruiter:", error);
        throw error;
      }
    },

    // Company Queries
    companies: async () => {
      try {
        const recruiterConn = await connectRecruiterDB();
        const CompanyModel = createCompanyModel(recruiterConn);
        const companies = await CompanyModel.find();
        return companies.map(formatCompany);
      } catch (error) {
        console.error("Error fetching companies:", error);
        throw new Error("Failed to fetch companies");
      }
    },

    company: async (_, { id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid company ID");
        }
        const recruiterConn = await connectRecruiterDB();
        const CompanyModel = createCompanyModel(recruiterConn);
        const company = await CompanyModel.findById(id);
        return company ? formatCompany(company) : null;
      } catch (error) {
        console.error("Error fetching company:", error);
        throw error;
      }
    },

    companiesByVerificationStatus: async (_, { verified }) => {
      try {
        const recruiterConn = await connectRecruiterDB();
        const CompanyModel = createCompanyModel(recruiterConn);
        const companies = await CompanyModel.find({ verified });
        return companies.map(formatCompany);
      } catch (error) {
        console.error("Error fetching companies by verification status:", error);
        throw new Error("Failed to fetch companies");
      }
    },

    // Batch Query - Get all data in one request
    batchQuery: async () => {
      try {
        // Fetch applicants
        const applicantConn = await connectApplicantDB();
        const UserModel = createUserModel(applicantConn);
        const applicants = await UserModel.find();

        // Fetch recruiters
        const recruiterConn = await connectRecruiterDB();
        if (!recruiterConn.models.RecruiterUser) {
          recruiterConn.model('RecruiterUser', recruiterSchema);
        }
        const RecruiterModel = recruiterConn.model('RecruiterUser');
        const recruiters = await RecruiterModel.find();

        // Fetch companies
        const CompanyModel = createCompanyModel(recruiterConn);
        const companies = await CompanyModel.find();

        return {
          applicants: applicants.map(formatApplicant),
          recruiters: recruiters.map(formatRecruiter),
          companies: companies.map(formatCompany),
          totalApplicants: applicants.length,
          totalRecruiters: recruiters.length,
          totalCompanies: companies.length
        };
      } catch (error) {
        console.error("Error in batch query:", error);
        throw new Error("Failed to fetch batch data");
      }
    },

    // Statistics
    stats: async () => {
      try {
        const applicantConn = await connectApplicantDB();
        const UserModel = createUserModel(applicantConn);
        const totalApplicants = await UserModel.countDocuments();

        const recruiterConn = await connectRecruiterDB();
        if (!recruiterConn.models.RecruiterUser) {
          recruiterConn.model('RecruiterUser', recruiterSchema);
        }
        const RecruiterModel = recruiterConn.model('RecruiterUser');
        const totalRecruiters = await RecruiterModel.countDocuments();

        const CompanyModel = createCompanyModel(recruiterConn);
        const totalCompanies = await CompanyModel.countDocuments();
        const verifiedCompanies = await CompanyModel.countDocuments({ verified: true });
        const unverifiedCompanies = await CompanyModel.countDocuments({ verified: false });

        return {
          totalApplicants,
          totalRecruiters,
          totalCompanies,
          verifiedCompanies,
          unverifiedCompanies
        };
      } catch (error) {
        console.error("Error fetching stats:", error);
        throw new Error("Failed to fetch statistics");
      }
    }
  },

  Mutation: {
    verifyCompany: async (_, { id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid company ID");
        }
        const recruiterConn = await connectRecruiterDB();
        const CompanyModel = createCompanyModel(recruiterConn);
        const company = await CompanyModel.findById(id);

        if (!company) {
          throw new Error("Company not found");
        }

        company.verified = true;
        await company.save();

        return {
          success: true,
          message: "Company verified successfully",
          data: formatCompany(company)
        };
      } catch (error) {
        console.error("Error verifying company:", error);
        return {
          success: false,
          message: error.message,
          data: null
        };
      }
    },

    deleteCompany: async (_, { id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid company ID");
        }
        const recruiterConn = await connectRecruiterDB();
        const CompanyModel = createCompanyModel(recruiterConn);
        await CompanyModel.findByIdAndDelete(id);

        return {
          success: true,
          message: "Company deleted successfully",
          data: null
        };
      } catch (error) {
        console.error("Error deleting company:", error);
        return {
          success: false,
          message: error.message,
          data: null
        };
      }
    },

    deleteApplicant: async (_, { id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid applicant ID");
        }
        const applicantConn = await connectApplicantDB();
        const UserModel = createUserModel(applicantConn);
        await UserModel.findByIdAndDelete(id);

        return {
          success: true,
          message: "Applicant deleted successfully",
          data: null
        };
      } catch (error) {
        console.error("Error deleting applicant:", error);
        return {
          success: false,
          message: error.message,
          data: null
        };
      }
    },

    deleteRecruiter: async (_, { id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid recruiter ID");
        }
        const recruiterConn = await connectRecruiterDB();
        if (!recruiterConn.models.RecruiterUser) {
          recruiterConn.model('RecruiterUser', recruiterSchema);
        }
        const RecruiterModel = recruiterConn.model('RecruiterUser');
        await RecruiterModel.findByIdAndDelete(id);

        return {
          success: true,
          message: "Recruiter deleted successfully",
          data: null
        };
      } catch (error) {
        console.error("Error deleting recruiter:", error);
        return {
          success: false,
          message: error.message,
          data: null
        };
      }
    }
  }
};

module.exports = resolvers;
