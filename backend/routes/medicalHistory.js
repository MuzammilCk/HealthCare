const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getPatientMedicalHistory,
  updatePatientMedicalHistory,
  requestCorrection,
  getOwnMedicalHistory,
  approveMedicalHistory
} = require('../controllers/medicalHistory');

// All routes require authentication
router.use(protect);

// Patient routes - Read only + Request correction
router.get('/me', restrictTo('patient'), getOwnMedicalHistory);
router.post('/me/request-correction', restrictTo('patient'), requestCorrection);

// Doctor/Admin routes - Full access
router.get('/patient/:patientId', restrictTo('doctor', 'admin'), getPatientMedicalHistory);
router.put('/patient/:patientId', restrictTo('doctor', 'admin'), updatePatientMedicalHistory);
router.post('/patient/:patientId/approve', restrictTo('doctor', 'admin'), approveMedicalHistory);

module.exports = router;
