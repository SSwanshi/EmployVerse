const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
} = require("graphql");
const { GraphQLJSONObject } = require("graphql-type-json");

const applicantReadService = require("../services/applicantRead.service");

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
  },
});

module.exports = new GraphQLSchema({
  query: QueryType,
});

