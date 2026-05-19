/**
 * @swagger
 * tags:
 *   name: Applicant
 *   description: APIs to get applicant details
 * 
 * /api/applicant/details/{applicantId}:
 *   get:
 *     summary: Get details of an applicant
 *     tags: [Applicant]
 *     parameters:
 *       - in: path
 *         name: applicantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Applicant details returned
 * 
 * /api/applicant/image/{applicantId}:
 *   get:
 *     summary: Get profile image of an applicant
 *     tags: [Applicant]
 *     parameters:
 *       - in: path
 *         name: applicantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image returned stream
 * 
 * /api/applicant/resume/{applicantId}:
 *   get:
 *     summary: Get resume document of an applicant
 *     tags: [Applicant]
 *     parameters:
 *       - in: path
 *         name: applicantId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resume file returned stream
 */
