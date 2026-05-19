/**
 * @swagger
 * tags:
 *   - name: GraphQL
 *     description: Admin GraphQL endpoint
 *
 * /graphql:
 *   post:
 *     summary: Execute GraphQL query or mutation
 *     tags: [GraphQL]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: GraphQL query or mutation string
 *               variables:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Variables used by the GraphQL operation
 *               operationName:
 *                 type: string
 *                 description: Optional GraphQL operation name
 *             required:
 *               - query
 *           examples:
 *             batchQuery:
 *               summary: Fetch applicants, recruiters, and companies in one request
 *               value:
 *                 query: |
 *                   query GetAllData {
 *                     batchQuery {
 *                       applicants {
 *                         id
 *                         firstName
 *                         lastName
 *                         email
 *                         companyName
 *                         appliedAt
 *                       }
 *                       recruiters {
 *                         id
 *                         firstName
 *                         lastName
 *                         email
 *                         createdAt
 *                       }
 *                       companies {
 *                         id
 *                         companyName
 *                         website
 *                         location
 *                         verified
 *                       }
 *                       totalApplicants
 *                       totalRecruiters
 *                       totalCompanies
 *                     }
 *                   }
 *     responses:
 *       200:
 *         description: GraphQL response payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   nullable: true
 *                 errors:
 *                   type: array
 *                   nullable: true
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *                       path:
 *                         type: array
 *                         items:
 *                           oneOf:
 *                             - type: string
 *                             - type: integer
 *                       locations:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             line:
 *                               type: integer
 *                             column:
 *                               type: integer
 */
