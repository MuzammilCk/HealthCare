const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  // Ensure user exists and has a role
  if (!req.user || !req.user.role) {
    return res.status(401).json({ success: false, message: 'User authentication required' });
  }
  
  // Check if user's role is in the allowed roles
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ 
      success: false, 
      message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
    });
  }
  
  next();
};
