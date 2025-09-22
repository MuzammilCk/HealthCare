const express = require('express');
const { check } = require('express-validator');
const { register, login, getMe } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
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
  [
    check('email', 'Valid email required').isEmail(),
    check('password', 'Password required').exists(),
  ],
  login
);

router.get('/me', protect, getMe);

module.exports = router;
