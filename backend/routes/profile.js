const express = require('express');
const { check } = require('express-validator');
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  removeProfilePicture,
  changePassword
} = require('../controllers/profile');
const { protect } = require('../middleware/auth');
const { rateLimitSensitiveOps, sanitizeInput, securityHeaders } = require('../middleware/security');

const router = express.Router();

// Apply security middleware to all routes
router.use(securityHeaders);
router.use(sanitizeInput);

// All profile routes require authentication
router.use(protect);

// @route   GET /api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', getProfile);

// @route   PUT /api/profile
// @desc    Update user profile information
// @access  Private
router.put(
  '/',
  rateLimitSensitiveOps(15 * 60 * 1000, 10), // 10 updates per 15 minutes
  [
    check('name')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    check('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    check('district')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('District must be between 2 and 50 characters')
  ],
  updateProfile
);

// @route   POST /api/profile/upload-picture
// @desc    Upload profile picture
// @access  Private
router.post(
  '/upload-picture',
  rateLimitSensitiveOps(15 * 60 * 1000, 5), // 5 uploads per 15 minutes
  uploadProfilePicture
);

// @route   DELETE /api/profile/picture
// @desc    Remove profile picture
// @access  Private
router.delete(
  '/picture',
  rateLimitSensitiveOps(15 * 60 * 1000, 5), // 5 deletions per 15 minutes
  removeProfilePicture
);

// @route   PUT /api/profile/change-password
// @desc    Change user password
// @access  Private
router.put(
  '/change-password',
  rateLimitSensitiveOps(60 * 60 * 1000, 10), // 10 password changes per hour (more lenient)
  [
    check('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    check('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long')
  ],
  changePassword
);

module.exports = router;
