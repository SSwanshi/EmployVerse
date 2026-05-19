const User = require('../models/user');
const PremiumUser = require('../models/premium_user');
const bcrypt = require('bcrypt');
const { generateToken } = require('../config/jwt');
const { sendOtpEmail } = require('../utils/emailService');

const signup = async (req, res) => {
  const { firstName, lastName, email, phone, gender, password, confirmPassword } = req.body;

  try {
    if (!firstName || !lastName || !email || !phone || !gender || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      gender,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      message: 'Signup successful! Please login.',
      success: true
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.twoFactorEnabled) {
      const otp = generateOtp();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      try {
        await sendOtpEmail(user.email, otp);
        return res.json({
          success: true,
          require2FA: true,
          email: user.email,
          message: 'OTP sent to your email for 2-factor authentication'
        });
      } catch (emailError) {
        console.error('2FA OTP email error:', emailError);
        return res.status(500).json({
          success: false,
          error: emailError.message || 'Failed to send 2FA OTP. Please try again later.'
        });
      }
    }

    // Generate JWT token
    const token = generateToken({
      id: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });

    res.status(200).json({
      message: 'Login successful!',
      success: true,
      token,
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
};

const logout = async (req, res) => {
  // With JWT, logout is handled on the client side by removing the token
  // Optionally, you can implement token blacklisting here if needed
  res.json({ message: 'Logout successful', success: true });
};

const getCurrentUser = async (req, res) => {
  try {
    // User info is now attached to req by the auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findOne({ userId: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check premium status
    const premiumUser = await PremiumUser.findOne({ email: user.email });
    let isPremium = !!premiumUser;
    let premiumExpired = false;

    if (premiumUser && premiumUser.planExpiry) {
      if (new Date() > new Date(premiumUser.planExpiry)) {
        isPremium = false;
        premiumExpired = true;
      }
    }

    res.json({
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        gender: user.gender,
        isPremium,
        premiumExpired
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for forgot password
const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address'
      });
    }

    // Check if user exists before sending OTP
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email address. Please check your email or sign up.'
      });
    }

    // Generate OTP
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save OTP to user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP email via EmailJS
    try {
      await sendOtpEmail(email, otp);

      res.json({
        success: true,
        message: 'OTP has been sent to your email address'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Clear OTP if email fails
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      return res.status(500).json({
        success: false,
        error: emailError.message || 'Failed to send OTP email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email or OTP'
      });
    }

    // Check if OTP exists and is not expired
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        error: 'OTP not found or expired. Please request a new OTP.'
      });
    }

    if (new Date() > user.otpExpiry) {
      // Clear expired OTP
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new OTP.'
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    // OTP is valid
    res.json({
      success: true,
      message: 'OTP verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Reset password with OTP
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, OTP, and new password are required'
      });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 4 characters long'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email or OTP'
      });
    }

    // Verify OTP again
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        error: 'OTP not found or expired. Please request a new OTP.'
      });
    }

    if (new Date() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new OTP.'
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    // Reset password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Verify 2FA OTP and login
const verify2FA = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required'
      });
    }

    const user = await User.findOne({ email });
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
      await user.save();
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

    // OTP is valid, clear it and issue token
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = generateToken({
      id: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });

    res.json({
      success: true,
      message: '2FA verified. Login successful.',
      token,
      user: {
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getCurrentUser,
  sendForgotPasswordOtp,
  verifyOtp,
  resetPassword,
  verify2FA
};

