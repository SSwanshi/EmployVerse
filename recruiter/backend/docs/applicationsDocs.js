/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Job Applications API
 * 
 * /api/applications/{jobId}:
 *   get:
 *     summary: Get all applications for a specific job
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Applications list returned
 * 
 * /api/applications/{jobId}/select/{applicantId}:
 *   post:
 *     summary: Select an applicant for a job
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *       - in: path
 *         name: applicantId
 *         required: true
 *     responses:
 *       200:
 *         description: Applicant selected
 * 
 * /api/applications/{jobId}/reject/{applicantId}:
 *   post:
 *     summary: Reject an applicant for a job
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *       - in: path
 *         name: applicantId
 *         required: true
 *     responses:
 *       200:
 *         description: Applicant rejected
 * 
 * /api/applications/{jobId}/resume/{resumeId}:
 *   get:
 *     summary: Get applicant resume
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *       - in: path
 *         name: resumeId
 *         required: true
 *     responses:
 *       200:
 *         description: Resume file returned
 */
