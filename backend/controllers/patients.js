const MedicalHistory = require('../models/MedicalHistory');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const { createNotification } = require('../utils/createNotification');

exports.getMedicalHistory = async (req, res) => {
  try {
    const mh = await MedicalHistory.findOne({ patientId: req.user.id });
    if (!mh) return res.status(404).json({ success: false, message: 'Medical history not found' });
    res.json({ success: true, data: mh });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/patients/me/medical-history
exports.updateMedicalHistory = async (req, res) => {
  const { bloodType, allergies, pastConditions } = req.body;
  try {
    let mh = await MedicalHistory.findOne({ patientId: req.user.id });
    if (!mh) {
      mh = await MedicalHistory.create({
        patientId: req.user.id,
        bloodType,
        allergies: allergies || [],
        pastConditions: pastConditions || [],
      });
    } else {
      mh.bloodType = bloodType ?? mh.bloodType;
      mh.allergies = allergies ?? mh.allergies;
      mh.pastConditions = pastConditions ?? mh.pastConditions;
      mh.lastUpdated = Date.now();
      await mh.save();
    }
    res.json({ success: true, data: mh });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/patients/doctors
exports.getDoctors = async (req, res) => {
  try {
    const { district } = req.query;
    // --- THIS IS THE CHANGE ---
    // Only find doctors that have been explicitly approved.
    let query = { verificationStatus: 'Approved' };
    if (district) {
      query.district = district;
    }

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email')
      .populate('specializationId', 'name description');

    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/patients/appointments
exports.bookAppointment = async (req, res) => {
  const { doctorId, date, timeSlot } = req.body;
  try {
    const existing = await Appointment.findOne({ doctorId, date, timeSlot, status: 'Scheduled' });
    if (existing) return res.status(400).json({ success: false, message: 'Time slot not available' });
    
    const appt = await Appointment.create({ patientId: req.user.id, doctorId, date, timeSlot });
    
    // Populate appointment data for notifications
    const populatedAppt = await Appointment.findById(appt._id)
      .populate('patientId', 'name')
      .populate('doctorId', 'name');
    
    // Notify the doctor about the new appointment
    await createNotification(
      doctorId,
      `You have a new appointment with ${populatedAppt.patientId.name} on ${new Date(date).toLocaleDateString()} at ${timeSlot}`,
      '/doctor/appointments',
      'appointment',
      { appointmentId: appt._id, patientName: populatedAppt.patientId.name, date, timeSlot }
    );
    
    // Notify the patient about successful booking
    await createNotification(
      req.user.id,
      `Your appointment with Dr. ${populatedAppt.doctorId.name} for ${new Date(date).toLocaleDateString()} is confirmed`,
      '/patient/appointments',
      'appointment',
      { appointmentId: appt._id, doctorName: populatedAppt.doctorId.name, date, timeSlot }
    );
    
    res.status(201).json({ success: true, data: appt });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ success: false, message: 'Duplicate slot' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/patients/appointments
exports.getAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find({ patientId: req.user.id })
      .populate('doctorId', 'name')
      .sort({ date: 1, timeSlot: 1 });
    res.json({ success: true, count: appts.length, data: appts });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPrescriptions = async (req, res) => {
  try {
    const pres = await Prescription.find({ patientId: req.user.id }).populate('doctorId', 'name').sort({ dateIssued: -1 });
    res.json({ success: true, count: pres.length, data: pres });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/patients/appointments/:appointmentId
// Cancel an appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Find the appointment and verify ownership
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name')
      .populate('doctorId', 'name');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify the user is the patient who owns this appointment
    if (appointment.patientId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this appointment' });
    }

    // Check if appointment is already cancelled or completed
    if (appointment.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Appointment is already cancelled' });
    }

    if (appointment.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed appointment' });
    }

    // Check time-based business rule: must be at least 1 hour before appointment
    try {
      const now = new Date();
      
      // Parse appointment date properly
      let appointmentDate;
      if (typeof appointment.date === 'string') {
        appointmentDate = new Date(appointment.date + 'T00:00:00');
      } else {
        appointmentDate = new Date(appointment.date);
      }
      
      // Parse time slot intelligently
      let timeSlot = appointment.timeSlot || '';
      
      // Extract start time from time slot (handle ranges like "09:00-10:00")
      let startTime = timeSlot;
      if (timeSlot.includes('-')) {
        startTime = timeSlot.split('-')[0].trim();
      }
      
      // Normalize time format
      if (!startTime.includes(':')) {
        startTime = startTime + ':00';
      }
      
      // Create full datetime for appointment
      const appointmentDateTime = new Date(appointmentDate);
      const [hours, minutes] = startTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      // Calculate time difference
      const timeDiffMs = appointmentDateTime.getTime() - now.getTime();
      const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
      
      console.log('Backend cancellation check:', {
        appointmentDate: appointment.date,
        timeSlot: appointment.timeSlot,
        appointmentDateTime: appointmentDateTime.toISOString(),
        currentTime: now.toISOString(),
        timeDiffHours: timeDiffHours,
        canCancel: timeDiffHours >= 1
      });

      if (timeDiffMs < 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot cancel a past appointment' 
        });
      }

      if (timeDiffHours < 1) {
        const minutesRemaining = Math.max(0, Math.floor(timeDiffMs / (1000 * 60)));
        return res.status(400).json({ 
          success: false, 
          message: `Cannot cancel appointment. Only ${minutesRemaining} minutes remaining.` 
        });
      }
    } catch (error) {
      console.error('Error checking appointment cancellation eligibility in backend:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error validating appointment cancellation time' 
      });
    }

    // Update appointment status to cancelled
    appointment.status = 'Cancelled';
    await appointment.save();

    // Notify the doctor about the cancellation
    await createNotification(
      appointment.doctorId._id,
      `Appointment with ${appointment.patientId.name} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot} has been cancelled`,
      '/doctor/appointments',
      'appointment',
      { 
        appointmentId: appointment._id, 
        patientName: appointment.patientId.name, 
        date: appointment.date, 
        timeSlot: appointment.timeSlot,
        action: 'cancelled'
      }
    );

    // Notify the patient about successful cancellation
    await createNotification(
      req.user.id,
      `Your appointment with Dr. ${appointment.doctorId.name} for ${new Date(appointment.date).toLocaleDateString()} has been cancelled`,
      '/patient/appointments',
      'appointment',
      { 
        appointmentId: appointment._id, 
        doctorName: appointment.doctorId.name, 
        date: appointment.date, 
        timeSlot: appointment.timeSlot,
        action: 'cancelled'
      }
    );

    res.json({ 
      success: true, 
      message: 'Appointment cancelled successfully',
      data: appointment 
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/patients/appointments/:appointmentId/rate
// Rate a completed appointment's doctor
exports.rateAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    let { rating } = req.body;
    rating = Number(rating);

    // Validate user role
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can rate appointments' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
    }

    const appt = await Appointment.findById(appointmentId);
    if (!appt || appt.patientId.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Appointment not found or unauthorized' });
    }
    if (appt.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Appointment not completed' });
    }
    if (appt.isRated) {
      return res.status(400).json({ success: false, message: 'Appointment already rated' });
    }

    await Doctor.updateOne({ userId: appt.doctorId }, { $push: { ratings: rating } });
    appt.isRated = true;
    await appt.save();

    res.json({ success: true, message: 'Rating submitted' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};