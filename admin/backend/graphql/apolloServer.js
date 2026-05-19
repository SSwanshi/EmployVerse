const { createHandler } = require('graphql-http/lib/use/express');
const { buildSchema } = require('graphql');
const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

// Build GraphQL schema from type definitions
const schema = buildSchema(typeDefs);

// Flatten resolvers for rootValue (needed for buildSchema approach)
const flatResolvers = {
  // Query resolvers
  applicants: resolvers.Query.applicants,
  applicant: resolvers.Query.applicant,
  recruiters: resolvers.Query.recruiters,
  recruiter: resolvers.Query.recruiter,
  companies: resolvers.Query.companies,
  companiesByVerificationStatus: resolvers.Query.companiesByVerificationStatus,
  company: resolvers.Query.company,
  batchQuery: resolvers.Query.batchQuery,
  stats: resolvers.Query.stats,
  
  // Mutation resolvers
  verifyCompany: resolvers.Mutation?.verifyCompany,
  deleteCompany: resolvers.Mutation?.deleteCompany,
  deleteApplicant: resolvers.Mutation?.deleteApplicant,
  deleteRecruiter: resolvers.Mutation?.deleteRecruiter,
};

// GraphiQL HTML
const graphiqlHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>GraphiQL</title>
  <style>
    body {
      height: 100%;
      margin: 0;
      width: 100%;
      overflow: hidden;
    }
    #graphiql {
      height: 100vh;
    }
  </style>
  <script
    crossorigin
    src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"
  ></script>
  <script
    crossorigin
    src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"
  ></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/graphiql@3/graphiql.min.css" />
</head>
<body>
  <div id="graphiql">Loading...</div>
  <script
    src="https://cdn.jsdelivr.net/npm/graphiql@3/graphiql.min.js"
    type="application/javascript"
  ></script>
  <script>
    ReactDOM.render(
      React.createElement(GraphiQL, {
        fetcher: GraphiQL.createFetcher({
          url: '/graphql',
        }),
        defaultQuery: '# Welcome to GraphiQL\\n# Paste your query here\\n{\\n  stats {\\n    totalApplicants\\n    totalRecruiters\\n    totalCompanies\\n  }\\n}',
      }),
      document.getElementById('graphiql'),
    );
  </script>
</body>
</html>
`;

function setupGraphQL(app) {
  // Handle GET requests - serve GraphiQL UI
  app.get('/graphql', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(graphiqlHtml);
  });
  
  app.use('/graphql', (req, res, next) => {
    if (req.method === 'POST') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid Bearer token' });
      }
    }
    next();
  });

  // Handle POST requests - GraphQL execution
  app.use('/graphql', createHandler({
    schema: schema,
    rootValue: flatResolvers,
  }));
  
  console.log('GraphQL endpoint configured at /graphql');
  console.log('GraphiQL UI available at http://localhost:9000/graphql');
}

module.exports = setupGraphQL;
