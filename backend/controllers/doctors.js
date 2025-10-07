const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
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
      .populate('specializationId', 'name description')
      .populate('hospitalId', 'name address district city phone');
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
    const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'Missed', 'Rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment status' });
    }

    // Prevent completing clearly future-dated appointments (but allow same-day regardless of time)
    if (status === 'Completed') {
      const now = new Date();
      const appointmentDate = new Date(appt.date);
      const endOfDay = new Date(appointmentDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (endOfDay > now && appointmentDate.toDateString() !== now.toDateString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot complete a future-dated appointment.'
        });
      }
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

/**
 * Create a smart prescription with inventory integration
 * Supports both billed items (from inventory) and prescribed-only items
 * Automatically generates bill after prescription is created
 */
exports.createPrescription = async (req, res) => {
  try {
    const { 
      appointmentId, 
      billedMedicines = [],      // Medicines from inventory to be billed
      prescribedOnlyMedicines = [], // Medicines prescribed but not billed
      diagnosis,
      notes,
      consultationFee,
      generateBill = true         // Flag to auto-generate bill
    } = req.body;
    
    const doctorId = req.user.id;

    // Validate user role
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can create prescriptions' });
    }

    // Validate required fields
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Appointment ID is required' });
    }

    // Find and validate appointment
    const appt = await Appointment.findOne({ 
      _id: appointmentId, 
      doctorId: doctorId, 
      status: 'Completed'
    })
      .populate('patientId', 'name')
      .populate('doctorId', 'name');
    
    if (!appt) {
      return res.status(400).json({ 
        success: false, 
        message: 'Eligible appointment not found or you are not authorized to prescribe for this appointment' 
      });
    }

    // Check if prescription already generated (one-time action)
    if (appt.prescriptionGenerated) {
      return res.status(400).json({ 
        success: false, 
        message: 'Prescription already generated for this appointment' 
      });
    }

    // Get doctor's hospital for inventory validation
    const Inventory = require('../models/Inventory');
    const doctor = await Doctor.findOne({ userId: doctorId });
    
    // Validate and process billed medicines
    const processedBilledMedicines = [];
    if (billedMedicines && billedMedicines.length > 0) {
      if (!doctor || !doctor.hospitalId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Doctor not associated with any hospital. Cannot bill medicines from inventory.' 
        });
      }

      for (const med of billedMedicines) {
        // Find medicine in inventory
        const inventoryItem = await Inventory.findOne({
          hospitalId: doctor.hospitalId,
          medicineName: { $regex: new RegExp(`^${med.medicineName}$`, 'i') },
          isActive: true
        });

        if (!inventoryItem) {
          return res.status(404).json({ 
            success: false, 
            message: `Medicine "${med.medicineName}" not found in hospital inventory` 
          });
        }

        // Check stock availability (first check)
        if (inventoryItem.stockQuantity < med.quantity) {
          return res.status(400).json({ 
            success: false, 
            message: `Insufficient stock for "${med.medicineName}". Available: ${inventoryItem.stockQuantity}, Required: ${med.quantity}` 
          });
        }

        processedBilledMedicines.push({
          medicineName: med.medicineName,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions || '',
          quantity: med.quantity,
          purchaseFromHospital: true,
          inventoryItemId: inventoryItem._id
        });
      }
    }

    // Process prescribed-only medicines
    const processedPrescribedOnly = prescribedOnlyMedicines.map(med => ({
      medicineName: med.medicineName,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions || '',
      quantity: med.quantity || 1,
      purchaseFromHospital: false
    }));

    // Combine all medicines
    const allMedicines = [...processedBilledMedicines, ...processedPrescribedOnly];

    if (allMedicines.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one medicine must be prescribed' 
      });
    }

    // Get consultation fee (from request or doctor's default)
    const finalConsultationFee = consultationFee !== undefined 
      ? Math.round(consultationFee) 
      : (doctor?.consultationFee || 25000);

    // Create prescription
    const prescription = new Prescription({
      appointmentId,
      patientId: appt.patientId._id || appt.patientId,
      doctorId: doctorId,
      medicines: allMedicines,
      diagnosis: diagnosis || '',
      notes: notes || '',
      consultationFee: finalConsultationFee,
      dateIssued: new Date()
    });

    await prescription.save();

    // Always generate bill with doctor fee (and medicines if any)
    let bill = null;
    const Bill = require('../models/Bill');
    
    const lineItems = [];
    let totalAmount = 0;

    // Add billed medicines to line items (if any)
    for (const med of processedBilledMedicines) {
      const inventoryItem = await Inventory.findById(med.inventoryItemId);
      const itemTotal = inventoryItem.price * med.quantity;
      
      lineItems.push({
        description: `${med.medicineName} - ${med.dosage} (${med.frequency} for ${med.duration})`,
        quantity: med.quantity,
        amount: inventoryItem.price,
        inventoryItemId: inventoryItem._id
      });
      totalAmount += itemTotal;
    }

    // Always add doctor fee
    lineItems.push({
      description: 'Doctor Fee',
      quantity: 1,
      amount: finalConsultationFee
    });
    totalAmount += finalConsultationFee;

    // Create bill
    bill = new Bill({
      appointmentId,
      patientId: appt.patientId._id || appt.patientId,
      doctorId: doctorId,
      items: lineItems,
      totalAmount: Math.round(totalAmount),
      status: 'unpaid'
    });

    await bill.save();

    // Mark appointment as both prescription and bill generated (atomic operation)
    appt.prescriptionGenerated = true;
    appt.finalBillGenerated = true;
    await appt.save();

    // Notify patient about prescription and bill
    await createNotification(
      appt.patientId._id || appt.patientId,
      `Dr. ${appt.doctorId.name} has issued a new prescription and bill for you`,
      '/patient/prescriptions',
      'prescription',
      { prescriptionId: prescription._id, billId: bill._id, doctorName: appt.doctorId.name }
    );

    res.status(201).json({ 
      success: true, 
      message: 'Prescription created successfully',
      data: {
        prescription,
        bill: bill || null,
        billGenerated: bill !== null
      }
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error' 
    });
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

    // Return all structurally available (unbooked) slots for the requested date
    // Client-side will handle any time-based filtering based on user's local time
    res.json({ data: availableSlots });
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

    // Helper to format date as local YYYY-MM-DD to avoid UTC shifting
    const formatLocalYmd = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Create a map of booked slots per date (keyed by local date string)
    const bookedSlotsPerDate = {};
    appointments.forEach(apt => {
      const aptDate = new Date(apt.date);
      const dateStr = formatLocalYmd(aptDate);
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
      const dateStr = formatLocalYmd(currentDate);
      
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

/**
 * Get prescriptions created by doctor
 */
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { patientId, appointmentId } = req.query;

    const query = { doctorId };
    if (patientId) query.patientId = patientId;
    if (appointmentId) query.appointmentId = appointmentId;

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'name email')
      .populate('appointmentId', 'date timeSlot status')
      .sort({ dateIssued: -1 });

    res.json({ 
      success: true, 
      count: prescriptions.length,
      data: prescriptions 
    });
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get single prescription by ID (read-only view)
 */
exports.getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    const prescription = await Prescription.findById(id)
      .populate('patientId', 'name email district')
      .populate('doctorId', 'name')
      .populate('appointmentId', 'date timeSlot status');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Verify doctor owns this prescription
    if (prescription.doctorId._id.toString() !== doctorId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    res.json({ success: true, data: prescription });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get single bill by ID (read-only view)
 */
exports.getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;
    const Bill = require('../models/Bill');

    const bill = await Bill.findById(id)
      .populate('patientId', 'name email district')
      .populate('doctorId', 'name')
      .populate('appointmentId', 'date timeSlot status');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    // Verify doctor owns this bill
    if (bill.doctorId._id.toString() !== doctorId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    res.json({ success: true, data: bill });
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update doctor profile including consultation fee
 */
exports.updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const updateData = req.body;

    // Find doctor profile
    const doctorProfile = await Doctor.findOne({ userId: doctorId });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Update allowed fields
    const allowedFields = [
      'bio', 
      'qualifications', 
      'languages', 
      'experienceYears', 
      'location', 
      'district',
      'consultationFee' // Allow updating consultation fee
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        doctorProfile[field] = updateData[field];
      }
    });

    await doctorProfile.save();

    // Populate and return updated profile
    const updatedProfile = await Doctor.findById(doctorProfile._id)
      .populate('userId', 'name email')
      .populate('specializationId', 'name description')
      .populate('hospitalId', 'name address district city phone');

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      data: updatedProfile 
    });
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

/**
 * Mark appointment as missed (patient didn't show up)
 * Can only be done after appointment time has passed
 */
exports.markAppointmentMissed = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    // Validate user role
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can mark appointments as missed' });
    }

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name email missedAppointments')
      .populate('doctorId', 'name');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Ensure only the assigned doctor can mark as missed
    if (appointment.doctorId._id.toString() !== doctorId) {
      return res.status(403).json({ success: false, message: 'You can only mark your own appointments as missed' });
    }

    // Check if appointment is scheduled
    if (appointment.status !== 'Scheduled') {
      return res.status(400).json({ success: false, message: 'Only scheduled appointments can be marked as missed' });
    }

    // Verify that appointment time has passed
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    
    if (appointment.timeSlot) {
      const endTimeString = appointment.timeSlot.split('-')[1]; // e.g., "10:00"
      const [hours, minutes] = endTimeString.split(':').map(Number);
      
      const appointmentEndTime = new Date(appointmentDate);
      appointmentEndTime.setHours(hours, minutes, 0, 0);
      
      if (appointmentEndTime > now) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot mark appointment as missed before the appointment time has passed' 
        });
      }
    }

    // Mark appointment as missed
    appointment.status = 'Missed';
    await appointment.save();

    // Increment patient's missed appointments count
    await User.findByIdAndUpdate(
      appointment.patientId._id,
      { $inc: { missedAppointments: 1 } }
    );

    // Notify patient
    await createNotification(
      appointment.patientId._id,
      `Your appointment with Dr. ${appointment.doctorId.name} on ${new Date(appointment.date).toLocaleDateString()} was marked as missed. Please cancel appointments in advance to avoid this.`,
      '/patient/appointments',
      'appointment',
      { appointmentId: appointment._id, action: 'missed' }
    );

    res.json({ 
      success: true, 
      message: 'Appointment marked as missed',
      data: appointment 
    });
  } catch (error) {
    console.error('Error marking appointment as missed:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Reject an appointment (doctor emergency or unavailability)
 */
exports.rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const doctorId = req.user.id;

    // Validate user role
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can reject appointments' });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Ensure only the assigned doctor can reject
    if (appointment.doctorId._id.toString() !== doctorId) {
      return res.status(403).json({ success: false, message: 'You can only reject your own appointments' });
    }

    // Check if appointment is scheduled
    if (appointment.status !== 'Scheduled') {
      return res.status(400).json({ success: false, message: 'Only scheduled appointments can be rejected' });
    }

    // Mark appointment as rejected
    appointment.status = 'Rejected';
    appointment.rejectionReason = reason;
    await appointment.save();

    // Notify patient
    await createNotification(
      appointment.patientId._id,
      `Your appointment with Dr. ${appointment.doctorId.name} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot} has been rejected. Reason: ${reason}`,
      '/patient/appointments',
      'appointment',
      { appointmentId: appointment._id, action: 'rejected', reason }
    );

    res.json({ 
      success: true, 
      message: 'Appointment rejected successfully',
      data: appointment 
    });
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Reschedule an appointment to a new date/time
 */
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newTimeSlot, reason } = req.body;
    const doctorId = req.user.id;

    // Validate user role
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Only doctors can reschedule appointments' });
    }

    if (!newDate || !newTimeSlot) {
      return res.status(400).json({ success: false, message: 'New date and time slot are required' });
    }

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Ensure only the assigned doctor can reschedule
    if (appointment.doctorId._id.toString() !== doctorId) {
      return res.status(403).json({ success: false, message: 'You can only reschedule your own appointments' });
    }

    // Check if appointment is scheduled
    if (appointment.status !== 'Scheduled') {
      return res.status(400).json({ success: false, message: 'Only scheduled appointments can be rescheduled' });
    }

    // Check if new slot is available
    const normalizedNewDate = normalizeDateToUTC(newDate);
    const existingAppt = await Appointment.findOne({
      doctorId: doctorId,
      date: normalizedNewDate,
      timeSlot: newTimeSlot,
      status: 'Scheduled',
      _id: { $ne: id } // Exclude current appointment
    });

    if (existingAppt) {
      return res.status(400).json({ success: false, message: 'Selected time slot is not available' });
    }

    // Store old details for notification
    const oldDate = appointment.date;
    const oldTimeSlot = appointment.timeSlot;

    // Update appointment
    appointment.date = normalizedNewDate;
    appointment.timeSlot = newTimeSlot;
    if (reason) {
      appointment.notes = `Rescheduled by doctor. Reason: ${reason}`;
    }
    await appointment.save();

    // Notify patient
    await createNotification(
      appointment.patientId._id,
      `Your appointment with Dr. ${appointment.doctorId.name} has been rescheduled from ${new Date(oldDate).toLocaleDateString()} at ${oldTimeSlot} to ${new Date(newDate).toLocaleDateString()} at ${newTimeSlot}${reason ? `. Reason: ${reason}` : ''}`,
      '/patient/appointments',
      'appointment',
      { 
        appointmentId: appointment._id, 
        action: 'rescheduled',
        oldDate,
        oldTimeSlot,
        newDate,
        newTimeSlot,
        reason 
      }
    );

    res.json({ 
      success: true, 
      message: 'Appointment rescheduled successfully',
      data: appointment 
    });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
