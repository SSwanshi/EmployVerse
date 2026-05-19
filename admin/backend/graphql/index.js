const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const setupGraphQL = require('./apolloServer');

module.exports = {
  typeDefs,
  resolvers,
  setupGraphQL
};
