// backend/routes/aiSymptomChecker.js
const express = require('express');
const { checkSymptoms, getMySymptomChecks, getAllSymptomChecks } = require('../controllers/aiSymptomChecker');
const { protect, authorize } = require('../middleware/auth');
const { rateLimitSensitiveOps } = require('../middleware/security');
const router = express.Router();

// POST /api/ai/check-symptoms
// Protected route - requires authentication
// Body: { symptoms: string, age: number, sex: string }
// SECURITY: this calls a paid external LLM API (OpenRouter) per request and
// previously had no rate limit at all, unlike every other sensitive endpoint
// in this app (auth, profile) - an authenticated user could hammer it and
// run up API costs, or use it as a low-effort DoS vector. 20 requests / 15
// minutes comfortably covers a real user checking a few symptoms in one
// sitting.
router.route('/').post(protect, rateLimitSensitiveOps(15 * 60 * 1000, 20), checkSymptoms);

// GET /api/ai/check-symptoms/history - user's own history
router.get('/history', protect, getMySymptomChecks);

// GET /api/ai/check-symptoms/admin - admin listing of logs
router.get('/admin', protect, authorize('admin'), getAllSymptomChecks);

module.exports = router;
