const express = require('express');
const { check } = require('express-validator');
const { register, login, getMe } = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { rateLimitSensitiveOps, sanitizeInput, securityHeaders } = require('../middleware/security');

const router = express.Router();

// Apply security middleware to all routes
router.use(securityHeaders);
router.use(sanitizeInput);

router.post(
  '/register',
  rateLimitSensitiveOps(15 * 60 * 1000, 3), // 3 attempts per 15 minutes
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Valid email required').isEmail(),
    check('password', 'Min 6 chars').isLength({ min: 6 }),
    check('role').optional().isIn(['patient', 'doctor', 'admin']),
  ],
  register
);

router.post(
  '/login',
  rateLimitSensitiveOps(15 * 60 * 1000, 5), // 5 attempts per 15 minutes
  [
    check('email', 'Valid email required').isEmail(),
    check('password', 'Password required').exists(),
  ],
  login
);

router.get('/me', protect, getMe);

module.exports = router;
