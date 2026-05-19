/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 * 
 * /api/auth/login:
 *   post:
 *     summary: Log in to a recruiter account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       400:
 *         description: Invalid credentials
 * 
 * /api/auth/verify-2fa:
 *   post:
 *     summary: Verify 2FA OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User email address
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP sent to email
 *     responses:
 *       200:
 *         description: 2FA verified successfully
 * 
 * /api/auth/signup:
 *   post:
 *     summary: Register a new recruiter
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created successfully
 * 
 * /api/auth/logout:
 *   post:
 *     summary: Log out from the recruiter account
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 * 
 * /api/auth/check-session:
 *   get:
 *     summary: Check if the user is authenticated
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Authenticated
 *       401:
 *         description: Unauthorized
 * 
 * /api/auth/user/profile:
 *   get:
 *     summary: Get user profile details
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User profile returned successfully
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               designation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 * 
 * /api/auth/user/profile-image:
 *   post:
 *     summary: Upload profile image
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 * 
 * /api/auth/profile-image/{id}:
 *   get:
 *     summary: Get profile image by user ID
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image returned stream
 * 
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request OTP to reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent
 * 
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify the password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified
 * 
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset the password after OTP verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 * 
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
