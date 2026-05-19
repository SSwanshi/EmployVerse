/**
 * @swagger
 * tags:
 *   name: Proof
 *   description: Proof Document API
 * 
 * /recruiter/proof/{id}:
 *   get:
 *     summary: Get proof document
 *     tags: [Proof]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proof document (PDF/Image) returned
 *       404:
 *         description: Document not found
 */
