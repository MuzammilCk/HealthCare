const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { 
  getDoctorProfile, 
  updateDoctorProfile, 
  getDoctorAppointments, 
  updateAppointment, 
  updateAvailability, 
  createPrescription, 
  getDoctorPrescriptions,
  getPrescriptionById,
  getBillById,
  submitKyc, 
  scheduleFollowUp, 
  getAvailableSlots, 
  getAvailableDates 
} = require('../controllers/doctors');

const router = express.Router();

// Public routes for appointment booking (no auth required)
router.get('/:id/available-slots', getAvailableSlots);
router.get('/:id/available-dates', getAvailableDates);

// Protected routes for doctors only
router.use(protect);
router.use(authorize('doctor'));

router.get('/profile', getDoctorProfile);
router.put('/profile', updateDoctorProfile);
router.get('/appointments', getDoctorAppointments);
router.put('/appointments/:id', updateAppointment);
router.post('/appointments/:id/follow-up', scheduleFollowUp);
router.put('/availability', updateAvailability);
router.post('/prescriptions', createPrescription);
router.get('/prescriptions', getDoctorPrescriptions);
router.get('/prescriptions/:id', getPrescriptionById);
router.get('/bills/:id', getBillById);
router.post('/me/kyc', submitKyc);

module.exports = router;
