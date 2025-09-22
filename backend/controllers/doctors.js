const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Doctor = require('../models/Doctor');

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
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appt.doctorId.toString() !== req.user.id) return res.status(401).json({ success: false, message: 'Not authorized' });
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
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    doctor.availability = availability || [];
    await doctor.save();
    res.json({ success: true, data: doctor.availability });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createPrescription = async (req, res) => {
  const { appointmentId, medication, dosage, instructions } = req.body;
  try {
    const appt = await Appointment.findOne({ _id: appointmentId, doctorId: req.user.id, status: 'Completed' });
    if (!appt) return res.status(400).json({ success: false, message: 'Completed appointment not found' });
    const pres = await Prescription.create({ appointmentId, patientId: appt.patientId, doctorId: req.user.id, medication, dosage, instructions });
    res.status(201).json({ success: true, data: pres });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
