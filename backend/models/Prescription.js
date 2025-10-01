const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medication: { type: String, required: true },
    dosage: { type: String, required: true },
    instructions: { type: String, required: true },
    dateIssued: { type: Date, default: Date.now },
    price: { 
      type: Number, 
      default: 0,
      min: 0,
      comment: 'Price in paise (smallest currency unit)'
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
