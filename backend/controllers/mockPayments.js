const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');
const User = require('../models/User');

// Generate a fake order ID (simulating payment gateway)
const generateFakeOrderId = () => {
  return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate a fake payment ID
const generateFakePaymentId = () => {
  return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a mock order for booking fee
 * NOW: Just validates data and creates order WITHOUT creating appointment
 */
exports.createMockBookingOrder = async (req, res) => {
  try {
    const { doctorId, date, timeSlot } = req.body;
    const patientId = req.user.id;

    // Validate required fields
    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate doctor exists and get their consultation fee
    const User = require('../models/User');
    const Doctor = require('../models/Doctor');
    
    const user = await User.findById(doctorId);
    if (!user || user.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const doctorProfile = await Doctor.findOne({ userId: doctorId });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Check for pending dues (limit bookings if 2+ unpaid bills)
    const Bill = require('../models/Bill');
    const unpaidBillsCount = await Bill.countDocuments({
      patientId,
      status: 'unpaid'
    });

    if (unpaidBillsCount >= 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'You must clear your pending dues to book further appointments. You have ' + unpaidBillsCount + ' unpaid bills.' 
      });
    }

    // Check if time slot is available (prevent double booking)
    const Appointment = require('../models/Appointment');
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      timeSlot,
      status: { $nin: ['Cancelled', 'cancelled_refunded', 'cancelled_no_refund'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: 'This time slot is not available' });
    }

    // Get consultation fee from doctor's profile (in paise)
    const consultationFee = doctorProfile.consultationFee || 25000; // Default 25000 paise = ₹250

    // Generate fake order ID (simulating payment gateway response)
    const fakeOrderId = generateFakeOrderId();

    // Return fake order details (simulating payment gateway)
    // NOTE: We do NOT create appointment or payment record yet
    res.json({ 
      success: true, 
      order: {
        id: fakeOrderId,
        amount: consultationFee,
        currency: 'INR',
        patientId: patientId,
        doctorId: doctorId,
        date: date,
        timeSlot: timeSlot,
        paymentType: 'booking_fee'
      }
    });
  } catch (error) {
    console.error('Error creating mock booking order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

/**
 * Create a mock order for bill payment
 * Simulates creating a payment order without calling external API
 */
exports.createMockBillOrder = async (req, res) => {
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

    // Generate fake order ID
    const fakeOrderId = generateFakeOrderId();

    // Create pending payment record
    const payment = new Payment({
      patientId,
      doctorId: bill.doctorId._id,
      appointmentId: bill.appointmentId._id,
      billId,
      amount: bill.totalAmount,
      paymentType: 'bill_payment',
      stripeSessionId: fakeOrderId,
      status: 'pending',
    });

    await payment.save();

    // Return fake order details
    res.json({ 
      success: true, 
      order: {
        id: fakeOrderId,
        amount: bill.totalAmount,
        currency: 'INR',
        billId: billId,
        appointmentId: bill.appointmentId._id.toString(),
        patientId: patientId,
        doctorId: bill.doctorId._id.toString(),
        paymentType: 'bill_payment'
      }
    });
  } catch (error) {
    console.error('Error creating mock bill order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

/**
 * Verify and complete mock payment
 * NOW: Creates appointment AFTER payment verification (Pay First, Book Later)
 */
exports.verifyMockPayment = async (req, res) => {
  try {
    const { orderId, paymentId, appointmentDetails } = req.body;
    const userId = req.user.id;

    // Generate fake payment ID if not provided
    const fakePaymentId = paymentId || generateFakePaymentId();

    // Check if this is a booking fee payment (has appointmentDetails)
    if (appointmentDetails) {
      const { doctorId, date, timeSlot } = appointmentDetails;

      // Double-check time slot is still available
      const Appointment = require('../models/Appointment');
      const existingAppointment = await Appointment.findOne({
        doctorId,
        date: new Date(date),
        timeSlot,
        status: { $nin: ['Cancelled', 'cancelled_refunded', 'cancelled_no_refund'] }
      });

      if (existingAppointment) {
        return res.status(400).json({ 
          success: false, 
          message: 'This time slot is no longer available' 
        });
      }

      // Get doctor's consultation fee
      const Doctor = require('../models/Doctor');
      const doctorProfile = await Doctor.findOne({ userId: doctorId });
      const consultationFee = doctorProfile?.consultationFee || 25000;

      // Step 1: Create the appointment with 'paid' status
      const appointment = new Appointment({
        patientId: userId,
        doctorId,
        date: new Date(date),
        timeSlot,
        status: 'Scheduled',
        bookingFeeStatus: 'paid', // Already paid!
      });

      await appointment.save();

      // Step 2: Create payment record
      const payment = new Payment({
        patientId: userId,
        doctorId,
        appointmentId: appointment._id,
        amount: consultationFee,
        paymentType: 'booking_fee',
        stripeSessionId: orderId,
        stripePaymentIntentId: fakePaymentId,
        status: 'completed',
        paymentDate: new Date(),
      });

      await payment.save();

      // Send notification to patient
      const User = require('../models/User');
      const doctor = await User.findById(doctorId).select('name');
      if (global.sendNotification) {
        global.sendNotification(userId, {
          type: 'payment_success',
          message: `Payment successful! Appointment confirmed with Dr. ${doctor.name}`,
          appointmentId: appointment._id,
        });
      }

      console.log('Appointment created after payment verification:', appointment._id);

      return res.json({ 
        success: true, 
        message: 'Payment verified and appointment created successfully',
        payment: {
          id: payment._id,
          orderId: orderId,
          paymentId: fakePaymentId,
          amount: payment.amount,
          status: payment.status,
          paymentType: payment.paymentType
        },
        appointment: {
          id: appointment._id,
          doctorId: appointment.doctorId,
          date: appointment.date,
          timeSlot: appointment.timeSlot,
          status: appointment.status
        }
      });
    }

    // Handle bill payment (existing logic)
    const payment = await Payment.findOne({ stripeSessionId: orderId });
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Verify user authorization
    if (payment.patientId.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    // Update payment record (simulating successful payment)
    payment.status = 'completed';
    payment.paymentDate = new Date();
    payment.stripePaymentIntentId = fakePaymentId;
    await payment.save();

    const { paymentType, billId } = payment;

    if (paymentType === 'bill_payment') {
      // Update bill status
      const Bill = require('../models/Bill');
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

    console.log('Mock payment processed successfully:', payment._id);

    res.json({ 
      success: true, 
      message: 'Payment verified successfully',
      payment: {
        id: payment._id,
        orderId: orderId,
        paymentId: fakePaymentId,
        amount: payment.amount,
        status: payment.status,
        paymentType: payment.paymentType
      }
    });
  } catch (error) {
    console.error('Error verifying mock payment:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
};

/**
 * Get patient's payment history
 * Returns all payments (booking fees, bill payments, refunds)
 */
exports.getPatientPayments = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { type } = req.query; // Optional filter by payment type

    const query = { patientId };
    if (type) {
      query.paymentType = type;
    }

    const payments = await Payment.find(query)
      .populate('doctorId', 'name')
      .populate('appointmentId', 'date timeSlot status')
      .populate('billId')
      .sort({ paymentDate: -1, createdAt: -1 });

    // Format payments for frontend
    const formattedPayments = payments.map(payment => ({
      _id: payment._id,
      amount: payment.amount,
      paymentType: payment.paymentType,
      status: payment.status,
      paymentDate: payment.paymentDate || payment.createdAt,
      doctor: payment.doctorId ? {
        _id: payment.doctorId._id,
        name: payment.doctorId.name
      } : null,
      appointment: payment.appointmentId ? {
        _id: payment.appointmentId._id,
        date: payment.appointmentId.date,
        timeSlot: payment.appointmentId.timeSlot,
        status: payment.appointmentId.status
      } : null,
      bill: payment.billId || null,
      metadata: payment.metadata || {}
    }));

    res.json({ success: true, payments: formattedPayments });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
  }
};
/**
 * Get payment details by order ID
 */
exports.getPaymentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const patientId = req.user.id;

    const payment = await Payment.findOne({ 
      stripeSessionId: orderId,
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
