const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  // Check for token in Authorization header first, then query parameter (for resume downloads)
  const authHeader = req.headers.authorization;
  let token = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    // Support token in query parameter for direct link access (e.g., resume viewing)
    token = req.query.token;
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'recruiter-jwt-secret');
    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    req.user = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      profileImage: user.profileImage,
      isPremium: user.isPremium
    };
    req.userId = user._id;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
};

module.exports = {
  requireAuth
};
