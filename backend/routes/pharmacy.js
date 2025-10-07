const express = require('express');
const { protect } = require('../middleware/auth');
const { updatePrescriptionStatus } = require('../controllers/pharmacy');

const router = express.Router();

router.use(protect);

router.put('/prescriptions/:id/status', updatePrescriptionStatus);

module.exports = router;


