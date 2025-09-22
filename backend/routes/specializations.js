const express = require('express');
const { check } = require('express-validator');
const { getSpecializations, createSpecialization } = require('../controllers/specializations');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getSpecializations);

router.post(
  '/',
  protect,
  authorize('admin'),
  [check('name', 'Name is required').not().isEmpty()],
  createSpecialization
);

module.exports = router;
