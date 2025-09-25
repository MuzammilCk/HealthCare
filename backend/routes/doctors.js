const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getDoctorProfile, getDoctorAppointments, updateAppointment, updateAvailability, createPrescription, submitKyc } = require('../controllers/doctors');

const router = express.Router();

router.use(protect);
router.use(authorize('doctor'));

router.get('/profile', getDoctorProfile);
router.get('/appointments', getDoctorAppointments);
router.put('/appointments/:id', updateAppointment);
router.put('/availability', updateAvailability);
router.post('/prescriptions', createPrescription);
router.post('/me/kyc', submitKyc);

module.exports = router;
