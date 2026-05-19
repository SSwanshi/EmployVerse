/**
 * @swagger
 * components:
 *   schemas:
 *     Applicant:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         companyName:
 *           type: string
 *         resumeId:
 *           type: string
 *         appliedAt:
 *           type: string
 *           format: date-time
 *
 * /api/applicants:
 *   get:
 *     summary: Get all applicants
 *     tags: [Applicants]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of applicants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Applicant'
 *       500:
 *         description: Internal server error
 *
 * /api/applicants/{id}:
 *   get:
 *     summary: Get applicant by ID
 *     tags: [Applicants]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Applicant ID
 *     responses:
 *       200:
 *         description: Applicant data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Applicant'
 *       404:
 *         description: Applicant not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete applicant
 *     tags: [Applicants]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Applicant ID
 *     responses:
 *       200:
 *         description: Applicant deleted successfully
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Applicant not found
 *       500:
 *         description: Internal server error
 */
