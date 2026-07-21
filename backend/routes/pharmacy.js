const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { updatePrescriptionStatus } = require('../controllers/pharmacy');

const router = express.Router();

router.use(protect);

// SECURITY (defense-in-depth): updatePrescriptionStatus already checks
// req.user.role === 'pharmacist' internally, so this was not currently
// exploitable, but the route layer had no independent backstop - every
// other role-restricted route in this app uses authorize() here. Without
// it, a future refactor of the controller that drops/loosens that check
// would silently reopen prescription-status tampering to any authenticated
// role (e.g. a patient marking their own prescription as dispensed).
router.put('/prescriptions/:id/status', authorize('pharmacist'), updatePrescriptionStatus);

module.exports = router;


