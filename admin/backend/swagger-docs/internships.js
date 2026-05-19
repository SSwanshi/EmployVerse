/**
 * @swagger
 * components:
 *   schemas:
 *     Internship:
 *       type: object
 *       properties:
 *         intTitle:
 *           type: string
 *         intDescription:
 *           type: string
 *         intRequirements:
 *           type: string
 *         intStipend:
 *           type: number
 *         intLocation:
 *           type: string
 *         intDuration:
 *           type: number
 *         intExperience:
 *           type: number
 *         intPositions:
 *           type: number
 *         intCompany:
 *           type: string
 *           description: Company ID
 *         createdBy:
 *           type: string
 *           description: User ID
 *         intExpiry:
 *           type: string
 *           format: date
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - intTitle
 *         - intDescription
 * 
 * /api/internships:
 *   get:
 *     summary: Get all internships
 *     tags: [Internships]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of internships
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Internship'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 * 
 * /api/internships/{id}:
 *   get:
 *     summary: Get internship by ID
 *     tags: [Internships]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Internship ID
 *     responses:
 *       200:
 *         description: Internship data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Internship'
 *       404:
 *         description: Internship not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete internship
 *     tags: [Internships]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Internship ID
 *     responses:
 *       200:
 *         description: Internship deleted
 *       404:
 *         description: Internship not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */