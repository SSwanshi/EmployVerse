const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type ApplicationStats {
    totalApplications: Int!
    pendingApplications: Int!
    selectedCandidates: Int!
    rejectedCandidates: Int!
  }

  type DashboardStatistics {
    companyCount: Int!
    jobCount: Int!
    internshipCount: Int!
    candidateCount: Int!
    applicationStats: ApplicationStats!
    clientSatisfaction: String!
  }

  type Application {
    id: String!
    applicantId: String!
    applicantName: String!
    email: String!
    applicationType: String!
    status: String!
    appliedDate: String!
  }

  type DetailedApplicationStats {
    totalApplications: Int!
    pendingApplications: Int!
    selectedCandidates: Int!
    rejectedCandidates: Int!
    applications: [Application!]!
  }

  type Query {
    recruiterDashboard: DashboardStatistics!
    applicationStatistics: DetailedApplicationStats!
  }
`);

module.exports = schema;
