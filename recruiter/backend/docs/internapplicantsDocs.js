/**
 * @swagger
 * tags:
 *   name: InternApplicants
 *   description: Internship Applications API
 * 
 * /api/internapplicants/{internshipId}:
 *   get:
 *     summary: Get all applications for a specific internship
 *     tags: [InternApplicants]
 *     parameters:
 *       - in: path
 *         name: internshipId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Internship applications list returned
 * 
 * /api/internapplicants/{internshipId}/select/{applicantId}:
 *   post:
 *     summary: Select an applicant for an internship
 *     tags: [InternApplicants]
 *     parameters:
 *       - in: path
 *         name: internshipId
 *         required: true
 *       - in: path
 *         name: applicantId
 *         required: true
 *     responses:
 *       200:
 *         description: Applicant selected
 * 
 * /api/internapplicants/{internshipId}/reject/{applicantId}:
 *   post:
 *     summary: Reject an applicant for an internship
 *     tags: [InternApplicants]
 *     parameters:
 *       - in: path
 *         name: internshipId
 *         required: true
 *       - in: path
 *         name: applicantId
 *         required: true
 *     responses:
 *       200:
 *         description: Applicant rejected
 * 
 * /api/internapplicants/{internshipId}/resume/{resumeId}:
 *   get:
 *     summary: Get applicant resume for internship
 *     tags: [InternApplicants]
 *     parameters:
 *       - in: path
 *         name: internshipId
 *         required: true
 *       - in: path
 *         name: resumeId
 *         required: true
 *     responses:
 *       200:
 *         description: Resume file returned
 */
