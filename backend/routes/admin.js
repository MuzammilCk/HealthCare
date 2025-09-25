const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getKycRequests, updateKycStatus } = require('../controllers/admin');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// List all submitted KYC requests
router.get('/kyc-requests', getKycRequests);

// Update a specific doctor's KYC status
router.put('/kyc-requests/:doctorId', updateKycStatus);

module.exports = router;
