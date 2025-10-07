const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String },
    quantity: { type: Number, required: true, default: 1 },
    purchaseFromHospital: { type: Boolean, default: false },
    inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' }, // Link to inventory for billed items
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicines: [medicineSchema],
    diagnosis: { type: String },
    notes: { type: String },
    dateIssued: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['New', 'Pending Fulfillment', 'Filled', 'Partially Filled', 'Cancelled'],
      default: 'New'
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
      comment: 'Consultation fee in paise (smallest currency unit)'
    },
    // Legacy fields for backward compatibility
    medication: { type: String },
    dosage: { type: String },
    instructions: { type: String },
    price: { 
      type: Number, 
      default: 0,
      min: 0,
      comment: 'Price in paise (smallest currency unit)'
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
