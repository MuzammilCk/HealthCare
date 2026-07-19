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
    // SECURITY (defense-in-depth): this validator previously allowed
    // role='admin' to pass through to the controller, relying entirely on
    // controllers/auth.js's separate selfRegisterRoles whitelist to reject
    // it. That whitelist does correctly reject it today, but the two lists
    // disagreeing is fragile - a future edit to either one in isolation
    // could silently reopen self-service admin registration. Keep both in
    // sync: only patient/doctor may self-register.
    check('role', 'Role must be either patient or doctor')
      .optional()
      .isIn(['patient', 'doctor'])
      .withMessage('Role must be patient or doctor'),
  ],
  register
);

router.post(
  '/login',
  // SECURITY: was 50 attempts/15min, which does little to deter credential
  // stuffing / brute force against a healthcare app holding PHI. 10/15min
  // still comfortably covers legitimate typos while meaningfully slowing
  // automated guessing.
  rateLimitSensitiveOps(15 * 60 * 1000, 10),
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
