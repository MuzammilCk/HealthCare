const MedicalHistory = require('../models/MedicalHistory');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

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
      mh = await MedicalHistory.create({ patientId: req.user.id, bloodType, allergies: allergies || [], pastConditions: pastConditions || [] });
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
    const { district } = req.query; // Get district from query params
    let query = { $or: [ { verificationStatus: 'Approved' }, { verificationStatus: { $exists: false } } ] };

    // If a district is provided, add it to the database query
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
exports.bookAppointment = async (req, res) => {
  const { doctorId, date, timeSlot } = req.body;
  try {
    const existing = await Appointment.findOne({ doctorId, date, timeSlot, status: 'Scheduled' });
    if (existing) return res.status(400).json({ success: false, message: 'Time slot not available' });
    const appt = await Appointment.create({ patientId: req.user.id, doctorId, date, timeSlot });
    res.status(201).json({ success: true, data: appt });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ success: false, message: 'Duplicate slot' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find({ patientId: req.user.id }).populate('doctorId', 'name').sort({ date: 1, timeSlot: 1 });
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