const express = require('express');
const { check } = require('express-validator');
const { register, login, getMe, logout } = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { rateLimitSensitiveOps, sanitizeInput, securityHeaders } = require('../middleware/security');

const router = express.Router();

// Apply security middleware to all routes
router.use(securityHeaders);
router.use(sanitizeInput);

router.post(
  '/register',
  rateLimitSensitiveOps(15 * 60 * 1000, 50), // 50 attempts per 15 minutes
  [
    check('name', 'Name is required')
      .not().isEmpty()
      .trim()
      .escape()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    check('email', 'Please include a valid email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format'),
    check('password', 'Password must be at least 6 characters')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    check('district', 'District is required')
      .not().isEmpty()
      .trim()
      .escape()
      .withMessage('District is required'),
    check('role', 'Role must be either patient or doctor')
      .optional()
      .isIn(['patient', 'doctor', 'admin'])
      .withMessage('Role must be patient, doctor, or admin'),
  ],
  register
);

router.post(
  '/login',
  rateLimitSensitiveOps(15 * 60 * 1000, 50), // 50 attempts per 15 minutes
  [
    check('email', 'Please include a valid email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format'),
    check('password', 'Password is required')
      .exists()
      .withMessage('Password is required'),
  ],
  login
);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
