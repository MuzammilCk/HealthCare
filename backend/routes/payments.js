const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments');
const { protect } = require('../middleware/auth');

// NOTE: the Stripe webhook route lives in server.js, not here. It must be
// registered with express.raw() BEFORE the app-wide express.json() parser
// runs, which is impossible to guarantee from within a router that gets
// mounted (via app.use) after that parser is already installed. Defining it
// here as well previously created a second, always-broken copy of the same
// route (json already parsed -> signature verification always fails).

// Protected routes - require authentication
router.post('/create-booking-checkout', protect, paymentsController.createBookingCheckoutSession);
router.post('/create-bill-checkout', protect, paymentsController.createBillCheckoutSession);
router.get('/history', protect, paymentsController.getPatientPayments);
router.get('/session/:sessionId', protect, paymentsController.getPaymentBySession);

module.exports = router;
