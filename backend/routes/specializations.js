const express = require('express');
const { check } = require('express-validator');
const { getSpecializations, createSpecialization, updateSpecialization, deleteSpecialization } = require('../controllers/specializations');
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

router.put(
  '/:id',
  protect,
  authorize('admin'),
  [check('name', 'Name is required').not().isEmpty()],
  updateSpecialization
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteSpecialization
);

module.exports = router;
