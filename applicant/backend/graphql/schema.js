const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLID,
} = require("graphql");
const { GraphQLJSONObject, GraphQLDateTime } = require("graphql-type-json");

const applicantReadService = require("../services/applicantRead.service");
const dashboardService = require("../services/dashboard.service");
const { verifyToken } = require("../config/jwt");

// Helper function to extract and verify authentication
const getAuthenticatedUser = (context) => {
  try {
    if (!context || !context.req) {
      throw new Error("No request context");
    }

    const authHeader = context.req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No authentication token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    return decoded;
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
};

// ==================== PROFILE DASHBOARD TYPES ====================

const UserProfileType = new GraphQLObjectType({
  name: "UserProfile",
  fields: {
    userId: { type: new GraphQLNonNull(GraphQLString) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    phone: { type: new GraphQLNonNull(GraphQLString) },
    gender: { type: new GraphQLNonNull(GraphQLString) },
    profileImageId: { type: GraphQLString },
    memberSince: { type: GraphQLString },
    collegeName: { type: GraphQLString },
    skills: { type: GraphQLString },
    about: { type: GraphQLString },
    linkedinProfile: { type: GraphQLString },
    githubProfile: { type: GraphQLString },
    portfolioWebsite: { type: GraphQLString },
    workExperience: { type: GraphQLString },
    achievements: { type: GraphQLString },
  },
});

const PremiumStatusType = new GraphQLObjectType({
  name: "PremiumStatus",
  fields: {
    isPremium: { type: new GraphQLNonNull(GraphQLBoolean) },
    premiumExpired: { type: new GraphQLNonNull(GraphQLBoolean) },
    planExpiry: { type: GraphQLString },
  },
});

const ApplicationHistoryItemType = new GraphQLObjectType({
  name: "ApplicationHistoryItem",
  fields: {
    type: { type: new GraphQLNonNull(GraphQLString) }, // 'Job' or 'Internship'
    title: { type: new GraphQLNonNull(GraphQLString) },
    company: { type: new GraphQLNonNull(GraphQLString) },
    appliedAt: { type: new GraphQLNonNull(GraphQLString) },
    status: { type: new GraphQLNonNull(GraphQLString) }, // 'Accepted', 'Rejected', 'Pending'
    applicationId: { type: new GraphQLNonNull(GraphQLID) },
  },
});

const DashboardStatsType = new GraphQLObjectType({
  name: "DashboardStats",
  fields: {
    totalApplications: { type: new GraphQLNonNull(GraphQLInt) },
    jobApplications: { type: new GraphQLNonNull(GraphQLInt) },
    internshipApplications: { type: new GraphQLNonNull(GraphQLInt) },
    acceptedApplications: { type: new GraphQLNonNull(GraphQLInt) },
    rejectedApplications: { type: new GraphQLNonNull(GraphQLInt) },
    pendingApplications: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

const ProfileDashboardType = new GraphQLObjectType({
  name: "ProfileDashboard",
  fields: {
    profile: { type: new GraphQLNonNull(UserProfileType) },
    premiumStatus: { type: new GraphQLNonNull(PremiumStatusType) },
    resumeName: { type: GraphQLString },
    applicationHistory: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ApplicationHistoryItemType))) },
    stats: { type: new GraphQLNonNull(DashboardStatsType) },
  },
});

// ==================== EXISTING TYPES ====================

const JobsResultType = new GraphQLObjectType({
  name: "JobsResult",
  fields: {
    meta: { type: new GraphQLNonNull(GraphQLJSONObject) },
    jobs: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLJSONObject))) },
  },
});

const InternshipsResultType = new GraphQLObjectType({
  name: "InternshipsResult",
  fields: {
    meta: { type: new GraphQLNonNull(GraphQLJSONObject) },
    internships: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLJSONObject))),
    },
  },
});

const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    jobs: {
      type: new GraphQLNonNull(JobsResultType),
      args: {
        salaryMin: { type: GraphQLInt },
        expMin: { type: GraphQLInt },
        expMax: { type: GraphQLInt },
        page: { type: GraphQLInt },
        location: { type: GraphQLString },
      },
      resolve: async (_, args) => {
        return await applicantReadService.getJobs(args);
      },
    },
    internships: {
      type: new GraphQLNonNull(InternshipsResultType),
      args: {
        stipendMin: { type: GraphQLInt },
        durationMin: { type: GraphQLInt },
        durationMax: { type: GraphQLInt },
        page: { type: GraphQLInt },
        location: { type: GraphQLString },
      },
      resolve: async (_, args) => {
        return await applicantReadService.getInternships(args);
      },
    },
    companies: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLJSONObject))),
      resolve: async () => {
        return await applicantReadService.getCompanies();
      },
    },
    job: {
      type: GraphQLJSONObject,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { id }) => {
        return await applicantReadService.getJobById(id);
      },
    },
    internship: {
      type: GraphQLJSONObject,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (_, { id }) => {
        return await applicantReadService.getInternshipById(id);
      },
    },
    profileDashboard: {
      type: new GraphQLNonNull(ProfileDashboardType),
      description: "Fetch the authenticated user's profile dashboard with applications and statistics",
      resolve: async (_, __, context) => {
        try {
          const user = getAuthenticatedUser(context);
          const dashboard = await dashboardService.getProfileDashboard(user.id);
          return dashboard;
        } catch (error) {
          throw new Error(`Dashboard fetch failed: ${error.message}`);
        }
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: QueryType,
});

