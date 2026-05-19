/**
 * @swagger
 * tags:
 *   name: Logo
 *   description: Logo Image API
 * 
 * /recruiter/logo/{id}:
 *   get:
 *     summary: Get company logo directly
 *     tags: [Logo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Logo image returned
 *       404:
 *         description: Image not found
 */
