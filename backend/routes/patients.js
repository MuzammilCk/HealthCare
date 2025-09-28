const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getMedicalHistory,
  updateMedicalHistory,
  getDoctors,
  getAvailableSlots,
  bookAppointment,
  getAppointments,
  getPrescriptions,
  rateAppointment,
  cancelAppointment,
} = require('../controllers/patients');

const router = express.Router();

router.use(protect);
router.use(authorize('patient'));

router.route('/me/medical-history').get(getMedicalHistory).put(updateMedicalHistory);
router.get('/doctors', getDoctors);
router.get('/doctors/:doctorId/available-slots', getAvailableSlots);
router.route('/appointments').get(getAppointments).post(bookAppointment);
router.delete('/appointments/:appointmentId', cancelAppointment);
router.post('/appointments/:appointmentId/rate', rateAppointment);
router.get('/prescriptions', getPrescriptions);

module.exports = router;
