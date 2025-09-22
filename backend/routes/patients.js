const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getMedicalHistory,
  updateMedicalHistory,
  getDoctors,
  bookAppointment,
  getAppointments,
  getPrescriptions,
} = require('../controllers/patients');

const router = express.Router();

router.use(protect);

router.route('/me/medical-history').get(getMedicalHistory).put(updateMedicalHistory);
router.get('/doctors', getDoctors);
router.route('/appointments').get(getAppointments).post(bookAppointment);
router.get('/prescriptions', getPrescriptions);

module.exports = router;
