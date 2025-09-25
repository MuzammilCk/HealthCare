const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getMedicalHistory,
  updateMedicalHistory,
  getDoctors,
  bookAppointment,
  getAppointments,
  getPrescriptions,
  rateAppointment,
} = require('../controllers/patients');

const router = express.Router();

router.use(protect);

router.route('/me/medical-history').get(getMedicalHistory).put(updateMedicalHistory);
router.get('/doctors', getDoctors);
router.route('/appointments').get(getAppointments).post(bookAppointment);
router.post('/appointments/:appointmentId/rate', rateAppointment);
router.get('/prescriptions', getPrescriptions);

module.exports = router;
