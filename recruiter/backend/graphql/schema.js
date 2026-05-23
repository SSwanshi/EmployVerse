const { buildSchema } = require('graphql');

const schema = buildSchema(`
  # ==================== LEGACY TYPES ====================
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

  # ==================== NEW ANALYTICS TYPES ====================
  
  type PostingStats {
    totalJobs: Int!
    totalInternships: Int!
    activeJobs: Int!
    activeInternships: Int!
    expiredJobs: Int!
    expiredInternships: Int!
    totalCompanies: Int!
  }

  type ApplicationStatsByStatus {
    pending: Int!
    selected: Int!
    rejected: Int!
  }

  type ApplicationStatsByType {
    jobApplications: Int!
    internshipApplications: Int!
  }

  type JobApplicationDetails {
    total: Int!
    pending: Int!
    selected: Int!
    rejected: Int!
  }

  type InternshipApplicationDetails {
    total: Int!
    pending: Int!
    selected: Int!
    rejected: Int!
  }

  type ApplicationStatsDetailed {
    total: Int!
    byType: ApplicationStatsByType!
    byStatus: ApplicationStatsByStatus!
    jobDetails: JobApplicationDetails!
    internshipDetails: InternshipApplicationDetails!
  }

  type CandidateStats {
    totalUniqueCandidates: Int!
    uniqueJobCandidates: Int!
    uniqueInternshipCandidates: Int!
  }

  type JobPerformance {
    id: String!
    title: String!
    company: String!
    applications: Int!
    salary: Int!
    location: String!
  }

  type InternshipPerformance {
    id: String!
    title: String!
    company: String!
    applications: Int!
    stipend: Int!
    location: String!
  }

  type PerformanceMetrics {
    topJobs: [JobPerformance!]!
    topInternships: [InternshipPerformance!]!
    averageApplicationsPerJob: String!
    averageApplicationsPerInternship: String!
  }

  type HiringPipeline {
    totalCandidates: Int!
    qualifiedCandidates: Int!
    selectedCandidates: Int!
    rejectedCandidates: Int!
    conversionRate: String!
  }

  type RecentApplication {
    id: String!
    candidateName: String!
    email: String!
    type: String!
    status: String!
    appliedAt: String!
  }

  type RecentActivities {
    applications: [RecentApplication!]!
  }

  type Last30DaysStats {
    jobApplications: Int!
    internshipApplications: Int!
    newJobs: Int!
    newInternships: Int!
  }

  type AnalyticsDashboard {
    postingStats: PostingStats!
    applicationStats: ApplicationStatsDetailed!
    candidateStats: CandidateStats!
    performanceMetrics: PerformanceMetrics!
    hiringPipeline: HiringPipeline!
    recentActivities: RecentActivities!
    last30DaysStats: Last30DaysStats!
    generatedAt: String!
  }

  type JobAnalyticsApplicant {
    id: String!
    name: String!
    email: String!
    phone: String!
    status: String!
    appliedAt: String!
  }

  type JobAnalyticsApplications {
    total: Int!
    pending: Int!
    selected: Int!
    rejected: Int!
  }

  type JobAnalyticsJob {
    id: String!
    title: String!
    location: String!
    salary: Int!
    positions: Int!
    createdAt: String!
    expiresAt: String!
  }

  type JobAnalytics {
    job: JobAnalyticsJob!
    applications: JobAnalyticsApplications!
    applicants: [JobAnalyticsApplicant!]!
  }

  # ==================== QUERIES ====================
  type Query {
    # Legacy queries
    recruiterDashboard: DashboardStatistics!
    applicationStatistics: DetailedApplicationStats!
    
    # New analytics queries
    analyticsDashboard: AnalyticsDashboard!
    jobAnalytics(jobId: String!): JobAnalytics!
  }
`);

module.exports = schema;
