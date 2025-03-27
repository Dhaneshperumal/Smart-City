/**
 * Authentication middleware for Smart City Application
 * Verifies JWT tokens and attaches user data to request object
 */
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Add user from payload
    req.user = decoded.user;
    
    // Check if user still exists and is not disabled
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (user.isDisabled) {
      return res.status(403).json({ message: 'Account is disabled' });
    }
    
    // Attach full user object to request
    req.userDetails = user;
    
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check specific roles
module.exports.checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.userDetails) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const hasRole = roles.some(role => req.userDetails.roles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ message: 'Access denied. Required role not found' });
    }
    
    next();
  };
};
