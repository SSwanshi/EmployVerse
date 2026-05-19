const { verifyToken } = require('../config/jwt');

const requireAuth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authenticated - No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify and decode token
    const decoded = verifyToken(token);
    
    // Attach user info to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authenticated - Invalid token' });
  }
};

const requireAuthRedirect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.redirect('/login');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.redirect('/login');
  }
};

module.exports = {
  requireAuth,
  requireAuthRedirect
};

