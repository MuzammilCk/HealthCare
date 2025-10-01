const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const User = require('../models/User');

/**
 * Create a Stripe checkout session for booking fee
 * Amount is stored and sent in paise (smallest currency unit)
 */
exports.createBookingCheckoutSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const patientId = req.user.id;

    // Validate appointment
    const appointment = await Appointment.findById(appointmentId).populate('doctorId', 'name');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.patientId.toString() !== patientId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    if (appointment.bookingFeeStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking fee already paid' });
    }

    // Get consultation fee from env (already in paise)
    const consultationFee = parseInt(process.env.CONSULTATION_FEE) || 25000; // Default 25000 paise = ₹250

    // Create Stripe checkout session
    // Stripe expects amount in smallest currency unit (paise for INR)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Consultation Booking Fee',
              description: `Appointment with Dr. ${appointment.doctorId.name}`,
            },
            unit_amount: consultationFee, // Amount in paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_ORIGIN}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_ORIGIN}/payment-cancelled`,
      metadata: {
        appointmentId: appointmentId,
        patientId: patientId,
        doctorId: appointment.doctorId._id.toString(),
        paymentType: 'booking_fee',
      },
    });

    // Create pending payment record
    const payment = new Payment({
      patientId,
      doctorId: appointment.doctorId._id,
      appointmentId,
      amount: consultationFee, // Store in paise
      paymentType: 'booking_fee',
      stripeSessionId: session.id,
      status: 'pending',
    });

    await payment.save();

    res.json({ 
      success: true, 
      sessionId: session.id,
      sessionUrl: session.url 
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ success: false, message: 'Failed to create checkout session' });
  }
};

/**
 * Create a Stripe checkout session for bill payment
 * Amount is stored and sent in paise (smallest currency unit)
 */
exports.createBillCheckoutSession = async (req, res) => {
  try {
    const { billId } = req.body;
    const patientId = req.user.id;

    // Validate bill
    const bill = await Bill.findById(billId)
      .populate('doctorId', 'name')
      .populate('appointmentId', 'date timeSlot');
    
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (bill.patientId.toString() !== patientId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Bill already paid' });
    }

    // Create Stripe checkout session
    // Stripe expects amount in smallest currency unit (paise for INR)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Medical Bill Payment',
              description: `Bill for appointment with Dr. ${bill.doctorId.name}`,
            },
            unit_amount: bill.totalAmount, // Amount already in paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_ORIGIN}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_ORIGIN}/payment-cancelled`,
      metadata: {
        billId: billId,
        patientId: patientId,
        doctorId: bill.doctorId._id.toString(),
        appointmentId: bill.appointmentId._id.toString(),
        paymentType: 'bill_payment',
      },
    });

    // Create pending payment record
    const payment = new Payment({
      patientId,
      doctorId: bill.doctorId._id,
      appointmentId: bill.appointmentId._id,
      billId,
      amount: bill.totalAmount, // Store in paise
      paymentType: 'bill_payment',
      stripeSessionId: session.id,
      status: 'pending',
    });

    await payment.save();

    res.json({ 
      success: true, 
      sessionId: session.id,
      sessionUrl: session.url 
    });
  } catch (error) {
    console.error('Error creating bill checkout session:', error);
    res.status(500).json({ success: false, message: 'Failed to create checkout session' });
  }
};

/**
 * Stripe webhook handler
 * Handles checkout.session.completed events
 */
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Find the payment record
      const payment = await Payment.findOne({ stripeSessionId: session.id });
      
      if (!payment) {
        console.error('Payment record not found for session:', session.id);
        return res.status(404).json({ success: false, message: 'Payment record not found' });
      }

      // Update payment record
      payment.status = 'completed';
      payment.paymentDate = new Date();
      payment.stripePaymentIntentId = session.payment_intent;
      await payment.save();

      const { paymentType, appointmentId, billId } = session.metadata;

      if (paymentType === 'booking_fee') {
        // Update appointment booking fee status
        await Appointment.findByIdAndUpdate(appointmentId, {
          bookingFeeStatus: 'paid',
        });

        // Send notification to patient
        const appointment = await Appointment.findById(appointmentId).populate('doctorId', 'name');
        if (global.sendNotification) {
          global.sendNotification(payment.patientId.toString(), {
            type: 'payment_success',
            message: `Payment successful for appointment with Dr. ${appointment.doctorId.name}`,
            appointmentId: appointmentId,
          });
        }
      } else if (paymentType === 'bill_payment') {
        // Update bill status
        const bill = await Bill.findByIdAndUpdate(
          billId,
          {
            status: 'paid',
            paidAt: new Date(),
            paymentId: payment._id,
          },
          { new: true }
        ).populate('doctorId', 'name');

        // Send notification to patient
        if (global.sendNotification) {
          global.sendNotification(payment.patientId.toString(), {
            type: 'payment_success',
            message: `Bill payment successful for appointment with Dr. ${bill.doctorId.name}`,
            billId: billId,
          });
        }

        // Send notification to doctor
        if (global.sendNotification) {
          global.sendNotification(payment.doctorId.toString(), {
            type: 'bill_paid',
            message: `Patient has paid the bill`,
            billId: billId,
          });
        }
      }

      console.log('Payment processed successfully:', payment._id);
    } catch (error) {
      console.error('Error processing payment:', error);
      return res.status(500).json({ success: false, message: 'Error processing payment' });
    }
  }

  res.json({ received: true });
};

/**
 * Get payment history for a patient
 */
exports.getPatientPayments = async (req, res) => {
  try {
    const patientId = req.user.id;

    const payments = await Payment.find({ 
      patientId,
      status: 'completed' 
    })
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'date timeSlot')
      .sort({ paymentDate: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
  }
};

/**
 * Get payment details by session ID
 */
exports.getPaymentBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const patientId = req.user.id;

    const payment = await Payment.findOne({ 
      stripeSessionId: sessionId,
      patientId 
    })
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'date timeSlot');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({ success: true, payment });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment details' });
  }
};
