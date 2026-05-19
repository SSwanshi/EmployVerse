/**
 * @swagger
 * tags:
 *   name: Recruiter
 *   description: Recruiter APIs (Jobs, Internships, Companies, Statistics)
 * 
 * /api/recruiter/companies:
 *   get:
 *     summary: Get all companies for the recruiter
 *     tags: [Recruiter]
 *     responses:
 *       200:
 *         description: Companies list returned
 * 
 * /api/recruiter/add-company:
 *   post:
 *     summary: Add a new company
 *     tags: [Recruiter]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *               proofDocument:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Company added
 * 
 * /api/recruiter/edit-company/{id}:
 *   get:
 *     summary: Get company by ID
 *     tags: [Recruiter]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company details returned
 *   post:
 *     summary: Update company by ID
 *     tags: [Recruiter]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
 *               proofDocument:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Company updated
 * 
 * /api/recruiter/delete-company/{companyId}:
 *   delete:
 *     summary: Delete a company by ID
 *     tags: [Recruiter]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company deleted
 * 
 * /api/recruiter/jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Recruiter]
 *     responses:
 *       200:
 *         description: Jobs returned
 * 
 * /api/recruiter/add-job:
 *   post:
 *     summary: Add a new job
 *     tags: [Recruiter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job added
 * 
 * /api/recruiter/edit-job/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Recruiter]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job returned
 *   put:
 *     summary: Update a job
 *     tags: [Recruiter]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Job updated
 * 
 * /api/recruiter/delete-job/{jobId}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Recruiter]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted
 * 
 * /api/recruiter/internships:
 *   get:
 *     summary: Get all internships
 *     tags: [Recruiter]
 *     responses:
 *       200:
 *         description: Internships returned
 * 
 * /api/recruiter/add-internship:
 *   post:
 *     summary: Add a new internship
 *     tags: [Recruiter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Internship added
 * 
 * /api/recruiter/edit-internship/{id}:
 *   get:
 *     summary: Get internship by ID
 *     tags: [Recruiter]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Internship returned
 *   put:
 *     summary: Update an internship
 *     tags: [Recruiter]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Internship updated
 * 
 * /api/recruiter/delete-intern/{intId}:
 *   delete:
 *     summary: Delete an internship
 *     tags: [Recruiter]
 *     parameters:
 *       - in: path
 *         name: intId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Internship deleted
 * 
 * /api/recruiter/home/statistics:
 *   get:
 *     summary: Get recruiter home statistics
 *     tags: [Recruiter]
 *     responses:
 *       200:
 *         description: Statistics returned
 */
