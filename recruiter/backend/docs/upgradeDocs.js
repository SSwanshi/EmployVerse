/**
 * @swagger
 * tags:
 *   name: Upgrade
 *   description: Stripe Checkout and Subscription API
 * 
 * /api/upgrade/create-checkout-session:
 *   post:
 *     summary: Create a Stripe checkout session for subscription
 *     tags: [Upgrade]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Checkout session created
 * 
 * /api/upgrade/verify-session:
 *   post:
 *     summary: Verify checkout session and upgrade the account
 *     tags: [Upgrade]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account upgraded successfully
 */
