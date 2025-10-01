const express = require('express');
const router = express.Router();
const billsController = require('../controllers/bills');
const { protect, restrictTo } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Doctor routes
router.post('/', restrictTo('doctor'), billsController.createBill);
router.get('/doctor', restrictTo('doctor'), billsController.getDoctorBills);
router.get('/doctor/stats', restrictTo('doctor'), billsController.getDoctorBillStats);
router.patch('/:billId', restrictTo('doctor'), billsController.updateBill);

// Patient routes
router.get('/patient', restrictTo('patient'), billsController.getPatientBills);

// Shared routes (both doctor and patient can access)
router.get('/:billId', billsController.getBillById);

module.exports = router;
