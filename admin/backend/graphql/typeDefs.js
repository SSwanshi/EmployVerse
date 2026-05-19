const typeDefs = `
  type Applicant {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    companyName: String!
    resumeId: String
    appliedAt: String!
  }

  type Recruiter {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    createdAt: String!
  }

  type Company {
    id: ID!
    companyName: String!
    website: String
    location: String
    logoId: String
    verified: Boolean!
    proofDocumentId: String
    createdAt: String!
    updatedAt: String!
  }

  type BatchQueryResult {
    applicants: [Applicant!]!
    recruiters: [Recruiter!]!
    companies: [Company!]!
    totalApplicants: Int!
    totalRecruiters: Int!
    totalCompanies: Int!
  }

  type Query {
    # Individual queries
    applicants: [Applicant!]!
    applicant(id: ID!): Applicant
    
    recruiters: [Recruiter!]!
    recruiter(id: ID!): Recruiter
    
    companies: [Company!]!
    companiesByVerificationStatus(verified: Boolean!): [Company!]!
    company(id: ID!): Company
    
    # Batch query - get all data in one request
    batchQuery: BatchQueryResult!
    
    # Statistics
    stats: AdminStats!
  }

  type AdminStats {
    totalApplicants: Int!
    totalRecruiters: Int!
    totalCompanies: Int!
    verifiedCompanies: Int!
    unverifiedCompanies: Int!
  }

  type Mutation {
    # Company mutations
    verifyCompany(id: ID!): MutationResult!
    deleteCompany(id: ID!): MutationResult!
    
    # Applicant mutations
    deleteApplicant(id: ID!): MutationResult!
    
    # Recruiter mutations
    deleteRecruiter(id: ID!): MutationResult!
  }

  type MutationResult {
    success: Boolean!
    message: String!
    data: Company
  }
`;

module.exports = typeDefs;
