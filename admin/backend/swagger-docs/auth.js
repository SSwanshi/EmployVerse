/**
 * @swagger
 * components:
 *   schemas:
 *     AdminSessionUser:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         isPremium:
 *           type: boolean
 *     AuthLoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     AuthVerify2FARequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         otp:
 *           type: string
 *           example: "123456"
 *
 * /api/auth/login:
 *   post:
 *     summary: Login admin and request OTP for 2FA
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 *
 * /api/auth/verify-2fa:
 *   post:
 *     summary: Verify OTP and complete login
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthVerify2FARequest'
 *     responses:
 *       200:
 *         description: 2FA verified and session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/AdminSessionUser'
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Internal server error
 *
 * /api/auth/logout:
 *   post:
 *     summary: Logout current admin session
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Logout failed
 *
 * /api/auth/me:
 *   get:
 *     summary: Get currently authenticated admin user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current session user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/AdminSessionUser'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
