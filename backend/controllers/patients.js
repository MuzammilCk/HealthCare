const mongoose = require('mongoose');
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

exports.getDoctors = async (req, res) => {
  try {
    const { district, search, specializationId, page = 1, limit = 20 } = req.query;

    // The aggregation pipeline. We perform lookups first to get all necessary data.
    const pipeline = [
      // 1. Start with approved doctors
      { 
        $match: { verificationStatus: 'Approved' } 
      },
      // 2. Join with the 'users' collection to get doctor's name, email, etc.
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId'
        }
      },
      { $unwind: '$userId' },
      // 3. Join with 'specializations' collection to get specialization name
      {
        $lookup: {
          from: 'specializations',
          localField: 'specializationId',
          foreignField: '_id',
          as: 'specializationId'
        }
      },
      { $unwind: '$specializationId' }
    ];

    // 4. Build a dynamic and consolidated match stage for all filters
    const matchConditions = [];

    if (district) {
      // Filter by the district field on the Doctor model
      matchConditions.push({ district: district });
    }

    if (specializationId && mongoose.Types.ObjectId.isValid(specializationId)) {
      // Filter by the specialization's ID (which is now an object after the lookup)
      matchConditions.push({ 'specializationId._id': new mongoose.Types.ObjectId(specializationId) });
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      // Search across multiple fields from the joined collections
      matchConditions.push({
        $or: [
          { 'userId.name': searchRegex },
          { 'specializationId.name': searchRegex },
          { qualifications: searchRegex },
          { bio: searchRegex }
        ]
      });
    }

    // 5. If there are any filters, add them to the pipeline in a single $match stage
    if (matchConditions.length > 0) {
      pipeline.push({ $match: { $and: matchConditions } });
    }

    // 6. Add sorting fields after all filtering is done
    pipeline.push({
      $addFields: {
        averageRating: {
          $cond: {
            if: { $gt: [{ $size: { $ifNull: ['$ratings', []] } }, 0] },
            then: { $avg: '$ratings' },
            else: 0
          }
        }
      }
    });

    pipeline.push({
      $sort: {
        averageRating: -1,
        'userId.name': 1
      }
    });

    // 7. Handle Pagination
    // Create a parallel pipeline to get the total count *before* applying skip/limit
    const countPipeline = [...pipeline, { $count: 'total' }];
    
    // Add pagination to the main data pipeline
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Execute both pipelines concurrently for efficiency
    const [doctors, countResult] = await Promise.all([
      Doctor.aggregate(pipeline),
      Doctor.aggregate(countPipeline)
    ]);
    
    const totalCount = countResult[0]?.total || 0;

    res.json({
      success: true,
      count: doctors.length,
      total: totalCount,
      page: parseInt(page),
      pages: Math.ceil(totalCount / parseInt(limit)),
      data: doctors
    });
  } catch (e) {
    console.error('Error fetching doctors:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const dateObj = new Date(date + 'T00:00:00');
    const dayIndex = dateObj.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[dayIndex];

    const dayAvailability = doctor.availability.find(av =>
      (av.day || '').toLowerCase() === dayName.toLowerCase()
    );

    if (!dayAvailability || !dayAvailability.slots) {
      return res.json({ success: true, data: [] });
    }
    
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
      
      for (let time = startMinutes; time < endMinutes; time += 30) {
        const slotStart = formatTime(time);
        const slotEnd = formatTime(time + 30);
        slots.push(`${slotStart}-${slotEnd}`);
      }
      
      return slots;
    };

    const allAvailableSlots = [];
    dayAvailability.slots.forEach(range => {
      allAvailableSlots.push(...expandTimeRange(range));
    });

    const bookedAppointments = await Appointment.find({
      doctorId: doctorId,
      date: dateObj,
      status: 'Scheduled'
    }).select('timeSlot');

    const bookedSlots = bookedAppointments.map(apt => apt.timeSlot);

    const availableSlots = allAvailableSlots.filter(slot =>
      !bookedSlots.includes(slot)
    );

    res.json({
      success: true,
      data: availableSlots
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.bookAppointment = async (req, res) => {
  const { doctorId, date, timeSlot } = req.body;
  try {
    const existing = await Appointment.findOne({ doctorId, date, timeSlot, status: 'Scheduled' });
    if (existing) return res.status(400).json({ success: false, message: 'Time slot not available' });

    const appt = await Appointment.create({ patientId: req.user.id, doctorId, date, timeSlot });

    const populatedAppt = await Appointment.findById(appt._id)
      .populate('patientId', 'name')
      .populate('doctorId', 'name');

    await createNotification(
      doctorId,
      `You have a new appointment with ${populatedAppt.patientId.name} on ${new Date(date).toLocaleDateString()} at ${timeSlot}`,
      '/doctor/appointments',
      'appointment',
      { appointmentId: appt._id, patientName: populatedAppt.patientId.name, date, timeSlot }
    );

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

exports.cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name')
      .populate('doctorId', 'name');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.patientId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this appointment' });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Appointment is already cancelled' });
    }

    if (appointment.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed appointment' });
    }

    try {
      const now = new Date();
      
      let appointmentDate;
      if (typeof appointment.date === 'string') {
        appointmentDate = new Date(appointment.date + 'T00:00:00');
      } else {
        appointmentDate = new Date(appointment.date);
      }
      
      let timeSlot = appointment.timeSlot || '';
      
      let startTime = timeSlot;
      if (timeSlot.includes('-')) {
        startTime = timeSlot.split('-')[0].trim();
      }
      
      if (!startTime.includes(':')) {
        startTime = startTime + ':00';
      }
      
      const appointmentDateTime = new Date(appointmentDate);
      const [hours, minutes] = startTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      const timeDiffMs = appointmentDateTime.getTime() - now.getTime();
      const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

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

    appointment.status = 'Cancelled';
    await appointment.save();

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

exports.rateAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    let { rating } = req.body;
    rating = Number(rating);

    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can rate appointments' });
    }

    if (!rating || rating < 1 || 5 < rating) {
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