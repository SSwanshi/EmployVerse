const express = require('express');
const { graphql } = require('graphql');
const schema = require('../graphql/schema');
const resolvers = require('../graphql/resolvers');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/graphql', requireAuth, async (req, res) => {
  const { query, variables } = req.body;

  if (!query) {
    return res.status(400).json({
      success: false,
      error: 'Query is required'
    });
  }

  try {
    const context = {
      userId: req.userId.toString(),
      user: req.user
    };

    console.log('[GraphQL] UserId from context:', context.userId);

    const result = await graphql({
      schema,
      source: query,
      variableValues: variables,
      rootValue: resolvers.Query,
      contextValue: context
    });

    if (result.errors) {
      console.error('[GraphQL Errors]:', result.errors);
      return res.status(400).json({
        success: false,
        errors: result.errors.map(err => ({
          message: err.message,
          locations: err.locations,
          path: err.path
        }))
      });
    }

    return res.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('GraphQL Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

module.exports = router;
