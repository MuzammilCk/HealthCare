// backend/routes/aiSymptomChecker.js
const express = require('express');
const { checkSymptoms, getMySymptomChecks, getAllSymptomChecks } = require('../controllers/aiSymptomChecker');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// POST /api/ai/check-symptoms
// Protected route - requires authentication
// Body: { symptoms: string, age: number, sex: string }
router.route('/').post(protect, checkSymptoms);

// GET /api/ai/check-symptoms/history - user's own history
router.get('/history', protect, getMySymptomChecks);

// GET /api/ai/check-symptoms/admin - admin listing of logs
router.get('/admin', protect, authorize('admin'), getAllSymptomChecks);

module.exports = router;
