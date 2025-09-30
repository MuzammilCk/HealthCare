const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const { createNotification, createRoleBasedNotifications } = require('../utils/createNotification');

// Utility function to normalize date to UTC midnight
const normalizeDateToUTC = (dateString) => {
  const date = new Date(dateString);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
};

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
      date: normalizeDateToUTC(date),
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

// GET /api/doctors/:id/available-slots?date=YYYY-MM-DD
exports.getAvailableSlots = async (req, res) => {
  try {
    const { id: doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter is required' });
    }

    // Parse the date and get day of week
    const dateObj = normalizeDateToUTC(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[dateObj.getDay()];

    // Find the doctor
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Find doctor's availability for this day
    const dayAvailability = doctor.availability.find(av => 
      (av.day || '').toLowerCase() === dayName.toLowerCase()
    );

    if (!dayAvailability || !dayAvailability.slots) {
      return res.json({ success: true, data: [] });
    }

    // Expand time ranges into individual slots
    const expandTimeRange = (timeRange) => {
      const [startTime, endTime] = timeRange.split('-');
      const slots = [];
      
      const parseTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      };
      
      const startMinutes = parseTime(startTime);
      const endMinutes = parseTime(endTime);
      
      // Generate 1-hour slots as requested
      for (let time = startMinutes; time < endMinutes; time += 60) {
        const slotStart = formatTime(time);
        const slotEnd = formatTime(time + 60);
        slots.push(`${slotStart}-${slotEnd}`);
      }
      
      return slots;
    };

    // Expand all time ranges into individual slots
    const allAvailableSlots = [];
    dayAvailability.slots.forEach(range => {
      allAvailableSlots.push(...expandTimeRange(range));
    });

    // Get all scheduled appointments for this doctor on this date
    const bookedAppointments = await Appointment.find({
      doctorId: doctorId,
      date: dateObj,
      status: 'Scheduled'
    }).select('timeSlot');

    const bookedSlots = bookedAppointments.map(apt => apt.timeSlot);

    // Filter out booked slots from available slots
    const availableSlots = allAvailableSlots.filter(slot => 
      !bookedSlots.includes(slot)
    );

    res.json({ 
      success: true, 
      data: availableSlots,
      debug: {
        dayName,
        totalSlots: dayAvailability.slots,
        bookedSlots,
        availableCount: availableSlots.length
      }
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/doctors/:id/available-dates?month=M&year=YYYY
exports.getAvailableDates = async (req, res) => {
  try {
    const { id: doctorId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year parameters are required' });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ success: false, message: 'Month must be between 1 and 12' });
    }

    // Find the doctor
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Get all appointments for this doctor in the specified month
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0); // Last day of month

    const appointments = await Appointment.find({
      doctorId: doctorId,
      date: {
        $gte: startDate,
        $lte: endDate
      },
      status: 'Scheduled'
    }).select('date timeSlot');

    // Create a map of booked slots per date
    const bookedSlotsPerDate = {};
    appointments.forEach(apt => {
      const dateStr = apt.date.toISOString().split('T')[0];
      if (!bookedSlotsPerDate[dateStr]) {
        bookedSlotsPerDate[dateStr] = [];
      }
      bookedSlotsPerDate[dateStr].push(apt.timeSlot);
    });

    // Helper function to calculate total slots for a day
    const calculateTotalSlotsForDay = (dayName) => {
      const dayAvailability = doctor.availability.find(av => 
        (av.day || '').toLowerCase() === dayName.toLowerCase()
      );
      
      if (!dayAvailability || !dayAvailability.slots) {
        return 0;
      }

      let totalSlots = 0;
      dayAvailability.slots.forEach(range => {
        const [startTime, endTime] = range.split('-');
        const parseTime = (timeStr) => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          return hours * 60 + minutes;
        };
        
        const startMinutes = parseTime(startTime);
        const endMinutes = parseTime(endTime);
        const duration = endMinutes - startMinutes;
        totalSlots += Math.floor(duration / 60); // 1-hour slots
      });

      return totalSlots;
    };

    const availableDates = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Iterate through each day of the month
    for (let day = 1; day <= endDate.getDate(); day++) {
      const currentDate = new Date(yearNum, monthNum - 1, day);
      
      // Skip past dates
      if (currentDate < today) {
        continue;
      }

      const dayName = dayNames[currentDate.getDay()];
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Calculate total available slots for this day
      const totalSlots = calculateTotalSlotsForDay(dayName);
      
      // If doctor doesn't work on this day, skip
      if (totalSlots === 0) {
        continue;
      }

      // Count booked slots for this date
      const bookedSlots = bookedSlotsPerDate[dateStr] || [];
      
      // If there are available slots, add to available dates
      if (bookedSlots.length < totalSlots) {
        availableDates.push(dateStr);
      }
    }

    res.json({ 
      success: true, 
      data: availableDates,
      debug: {
        month: monthNum,
        year: yearNum,
        totalDaysChecked: endDate.getDate(),
        availableDaysCount: availableDates.length
      }
    });
  } catch (error) {
    console.error('Error fetching available dates:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
