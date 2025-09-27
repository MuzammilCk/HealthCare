const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const { createNotification, createRoleBasedNotifications } = require('../utils/createNotification');

exports.getDoctorProfile = async (req, res) => {
  try {
    const doc = await Doctor.findOne({ userId: req.user.id })
      .populate('userId', 'name email')
      .populate('specializationId', 'name description');
    if (!doc) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    res.json({ success: true, data: doc });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getDoctorAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find({ doctorId: req.user.id }).populate('patientId', 'name email').sort({ date: 1, timeSlot: 1 });
    res.json({ success: true, count: appts.length, data: appts });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateAppointment = async (req, res) => {
  const { status, notes } = req.body;
  try {
    // Validate user role
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can update appointments' });
    }

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    
    // Ensure only the assigned doctor can update the appointment
    if (appt.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only update your own appointments' });
    }

    // Validate status transitions
    const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'Follow-up'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment status' });
    }

    // Update appointment
    if (status) appt.status = status;
    if (notes) appt.notes = notes;
    await appt.save();
    
    res.json({ success: true, data: appt });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateAvailability = async (req, res) => {
  const { availability } = req.body;
  try {
    console.log('updateAvailability called with:', { 
      userId: req.user?.id, 
      userRole: req.user?.role, 
      availability 
    });

    // Validate user role
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can update availability' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      console.log('Doctor profile not found for userId:', req.user.id);
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    console.log('Found doctor:', doctor._id);
    doctor.availability = availability || [];
    await doctor.save();
    console.log('Availability saved successfully');
    
    res.json({ success: true, data: doctor.availability });
  } catch (e) {
    console.error('Error updating availability:', e);
    res.status(500).json({ success: false, message: 'Server error: ' + e.message });
  }
};

// Doctor submits KYC documents and moves status to Submitted
exports.submitKyc = async (req, res) => {
  try {
    const { documents } = req.body; // Expect an array of file URLs/IDs from client-side upload
    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ success: false, message: 'No documents provided' });
    }

    const doctor = await Doctor.findOne({ userId: req.user.id })
      .populate('userId', 'name');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

    // Update KYC information
    doctor.kyc = doctor.kyc || {};
    doctor.kyc.documents = documents;
    doctor.kyc.submittedAt = new Date();
    // Reset review fields on resubmission
    doctor.kyc.reviewerId = undefined;
    doctor.kyc.reviewedAt = undefined;
    doctor.kyc.rejectedReason = undefined;

    // Only move to Submitted if Pending or Rejected
    if (doctor.verificationStatus === 'Pending' || doctor.verificationStatus === 'Rejected') {
      doctor.verificationStatus = 'Submitted';
    }

    await doctor.save();

    // Notify all admins about new KYC submission
    await createRoleBasedNotifications(
      'admin',
      `Dr. ${doctor.userId.name} has submitted a new KYC verification request`,
      '/admin/kyc-requests',
      'kyc',
      { doctorId: doctor._id, doctorName: doctor.userId.name }
    );

    res.status(200).json({ success: true, message: 'KYC submitted successfully', data: doctor });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a prescription for a completed appointment
exports.createPrescription = async (req, res) => {
  const { appointmentId, medication, dosage, instructions } = req.body;
  try {
    // Validate user role
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can create prescriptions' });
    }

    // Validate required fields
    if (!appointmentId || !medication || !dosage || !instructions) {
      return res.status(400).json({ success: false, message: 'All fields (appointmentId, medication, dosage, instructions) are required' });
    }

    const appt = await Appointment.findOne({ _id: appointmentId, doctorId: req.user.id, status: { $in: ['Completed', 'Follow-up'] } })
      .populate('patientId', 'name')
      .populate('doctorId', 'name');
    
    if (!appt) {
      return res.status(400).json({ success: false, message: 'Eligible appointment not found or you are not authorized to prescribe for this appointment' });
    }
    
    const pres = await Prescription.create({ appointmentId, patientId: appt.patientId, doctorId: req.user.id, medication, dosage, instructions });
    
    // Notify the patient about the new prescription
    await createNotification(
      appt.patientId._id || appt.patientId,
      `Dr. ${appt.doctorId.name} has issued a new prescription for you`,
      '/patient/prescriptions',
      'prescription',
      { prescriptionId: pres._id, doctorName: appt.doctorId.name, medication }
    );
    
    res.status(201).json({ success: true, data: pres });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Schedule a follow-up: update current appointment status, and create a new future appointment slot
exports.scheduleFollowUp = async (req, res) => {
  try {
    // Validate user role
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can schedule follow-ups' });
    }

    const { date, timeSlot, notes } = req.body;
    const current = await Appointment.findById(req.params.id).populate('patientId', 'name email');
    if (!current) return res.status(404).json({ success: false, message: 'Appointment not found' });
    
    // Ensure only the assigned doctor can schedule follow-up
    if (current.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only schedule follow-ups for your own appointments' });
    }

    if (!date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'date and timeSlot are required' });
    }

    // Validate that the appointment is in a state that allows follow-up
    if (!['Completed', 'Scheduled'].includes(current.status)) {
      return res.status(400).json({ success: false, message: 'Follow-up can only be scheduled for completed or scheduled appointments' });
    }

    // Mark current appointment as Follow-up planned and persist optional notes
    current.status = 'Follow-up';
    if (notes) current.notes = notes;
    await current.save();

    // Create new appointment for the selected future slot
    const followUpAppt = await Appointment.create({
      patientId: current.patientId._id || current.patientId,
      doctorId: req.user.id,
      date: new Date(date),
      timeSlot,
      status: 'Scheduled',
      notes: notes || ''
    });

    res.json({ success: true, data: { current, followUp: followUpAppt } });
  } catch (e) {
    // Handle uniqueness conflicts (same slot) gracefully
    if (e && e.code === 11000) {
      return res.status(400).json({ success: false, message: 'Selected slot is no longer available' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
