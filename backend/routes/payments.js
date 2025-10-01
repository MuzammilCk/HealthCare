const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments');
const { protect } = require('../middleware/auth');

// Webhook route - must be BEFORE express.json() middleware
// This is handled separately in server.js with raw body
router.post('/webhook', express.raw({ type: 'application/json' }), paymentsController.stripeWebhook);

// Protected routes - require authentication
router.post('/create-booking-checkout', protect, paymentsController.createBookingCheckoutSession);
router.post('/create-bill-checkout', protect, paymentsController.createBillCheckoutSession);
router.get('/history', protect, paymentsController.getPatientPayments);
router.get('/session/:sessionId', protect, paymentsController.getPaymentBySession);

module.exports = router;
