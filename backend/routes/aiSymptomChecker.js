// backend/routes/aiSymptomChecker.js
const express = require('express');
const { checkSymptoms } = require('../controllers/aiSymptomChecker');
const { protect } = require('../middleware/auth');
const router = express.Router();

// POST /api/ai/check-symptoms
// Protected route - requires authentication
// Body: { symptoms: string, age: number, sex: string }
router.route('/').post(protect, checkSymptoms);

module.exports = router;
