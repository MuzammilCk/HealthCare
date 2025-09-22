const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bloodType: { type: String },
    allergies: [{ type: String }],
    pastConditions: [{ type: String }],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model('MedicalHistory', medicalHistorySchema);
