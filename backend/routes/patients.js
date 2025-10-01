const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
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
router.get('/doctors', getDoctors);
router.get('/doctors/:doctorId/available-slots', getAvailableSlots);
router.route('/appointments').get(getAppointments).post(bookAppointment);
router.post('/appointments/:id/cancel', cancelAppointment);
router.post('/appointments/:appointmentId/rate', rateAppointment);
router.get('/prescriptions', getPrescriptions);

module.exports = router;
