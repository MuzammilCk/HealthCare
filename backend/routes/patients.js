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
  getPatientFile,
  searchPatients,
} = require('../controllers/patients');

const router = express.Router();

router.use(protect);

// Patient-only routes
router.get('/doctors', authorize('patient'), getDoctors);
router.get('/doctors/:doctorId/available-slots', authorize('patient'), getAvailableSlots);
router.route('/appointments').get(authorize('patient'), getAppointments).post(authorize('patient'), bookAppointment);
router.post('/appointments/:id/cancel', authorize('patient'), cancelAppointment);
router.post('/appointments/:appointmentId/rate', authorize('patient'), rateAppointment);
router.get('/prescriptions', authorize('patient'), getPrescriptions);

// Doctor-only routes for patient file access
router.get('/search', authorize('doctor'), searchPatients);
router.get('/:patientId/file', authorize('doctor'), getPatientFile);

module.exports = router;
