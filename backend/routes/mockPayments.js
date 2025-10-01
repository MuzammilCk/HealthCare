const express = require('express');
const router = express.Router();
const mockPaymentsController = require('../controllers/mockPayments');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Create mock payment orders
router.post('/create-booking-order', mockPaymentsController.createMockBookingOrder);
router.post('/create-bill-order', mockPaymentsController.createMockBillOrder);

// Verify mock payment
router.post('/verify-payment', mockPaymentsController.verifyMockPayment);

// Get payment history and details
router.get('/history', mockPaymentsController.getPatientPayments);
router.get('/order/:orderId', mockPaymentsController.getPaymentByOrderId);

module.exports = router;
