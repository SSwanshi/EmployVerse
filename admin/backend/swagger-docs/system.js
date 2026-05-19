/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Admin service health check
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 service:
 *                   type: string
 *                 port:
 *                   type: integer
 *
 * /api/stats:
 *   get:
 *     summary: Get admin dashboard stats
 *     tags: [System]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard counts for jobs, internships, companies, and applicants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobCount:
 *                   type: integer
 *                 internshipCount:
 *                   type: integer
 *                 companyCount:
 *                   type: integer
 *                 applicantCount:
 *                   type: integer
 *       500:
 *         description: Internal server error
 */
