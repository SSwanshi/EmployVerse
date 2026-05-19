/**
 * @swagger
 * components:
 *   schemas:
 *     Recruiter:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 * 
 * /api/recruiters:
 *   get:
 *     summary: Get all recruiters
 *     tags: [Recruiters]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of recruiters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recruiter'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 * 
 * /api/recruiters/{id}:
 *   get:
 *     summary: Get recruiter by ID
 *     tags: [Recruiters]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recruiter ID
 *     responses:
 *       200:
 *         description: Recruiter data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recruiter'
 *       404:
 *         description: Recruiter not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete recruiter
 *     tags: [Recruiters]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recruiter ID
 *     responses:
 *       200:
 *         description: Recruiter deleted
 *       404:
 *         description: Recruiter not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */