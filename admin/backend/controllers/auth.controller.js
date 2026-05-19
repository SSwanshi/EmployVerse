const validUsers = [
  { email: "sarvjeet.s23@iiits.in", password: "123456@@", isPremium: true },
  { email: "sauravkumar.r23@iiits.in", password: "123456@@", isPremium: false },
  { email: "kartik.r23@iiits.in", password: "123456@@", isPremium: true },
  { email: "anuj.r23@iiits.in", password: "123456@@", isPremium: true },
  { email: "likhitha.b23@iiits.in", password: "123456@@", isPremium: true },
];

const { sendOtpEmail } = require('../utils/emailService');

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = validUsers.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate OTP for 2FA
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;

    try {
      const otpDeliveryResult = await sendOtpEmail(email, otp);
      res.json({
        success: true,
        require2FA: true,
        email: user.email,
        message: otpDeliveryResult?.delivered
          ? 'OTP sent to your email for 2-factor authentication'
          : 'OTP generated for 2-factor authentication. Check server console in local/dev mode.'
      });
    } catch (emailError) {
      console.error('2FA OTP email error:', emailError);
      return res.status(500).json({
        success: false,
        error: emailError.message || 'Failed to send 2FA OTP. Please try again later.'
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const verify2FA = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required'
      });
    }

    const user = validUsers.find((u) => u.email === email);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session. Please login again.'
      });
    }

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        error: 'OTP not found. Please login again.'
      });
    }

    if (new Date() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please login again.'
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    // OTP is valid, clear it
    user.otp = null;
    user.otpExpiry = null;

    // Set session user
    req.session.user = {
      email: user.email,
      isPremium: user.isPremium
    };

    res.json({
      success: true,
      message: '2FA verified. Login successful.',
      user: req.session.user
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true, message: "Logout successful" });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  login,
  verify2FA,
  logout,
  getCurrentUser
};

