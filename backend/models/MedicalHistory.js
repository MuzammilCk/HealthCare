const mongoose = require('mongoose');

// Structured sub-schemas for better data organization
const allergySchema = new mongoose.Schema({
  name: { type: String, required: true },
  severity: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'moderate' },
  reaction: { type: String },
  diagnosedDate: { type: Date }
}, { _id: true });

const conditionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  diagnosedDate: { type: Date },
  status: { type: String, enum: ['active', 'resolved', 'chronic'], default: 'active' },
  notes: { type: String }
}, { _id: true });

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String },
  frequency: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  prescribedBy: { type: String }
}, { _id: true });

const surgerySchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date },
  hospital: { type: String },
  notes: { type: String }
}, { _id: true });

const familyHistorySchema = new mongoose.Schema({
  condition: { type: String, required: true },
  relationship: { type: String, required: true },
  notes: { type: String }
}, { _id: true });

const medicalHistorySchema = new mongoose.Schema(
  {
    patientId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      unique: true 
    },
    
    // Basic Information
    bloodType: { 
      type: String, 
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown'
    },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    
    // Structured Medical Data
    allergies: [allergySchema],
    pastConditions: [conditionSchema],
    currentMedications: [medicationSchema],
    surgeries: [surgerySchema],
    familyHistory: [familyHistorySchema],
    
    // Lifestyle Information
    smokingStatus: { 
      type: String, 
      enum: ['never', 'former', 'current', 'unknown'],
      default: 'unknown'
    },
    alcoholConsumption: { 
      type: String, 
      enum: ['none', 'occasional', 'moderate', 'heavy', 'unknown'],
      default: 'unknown'
    },
    exerciseFrequency: { 
      type: String, 
      enum: ['none', 'rarely', 'weekly', 'daily', 'unknown'],
      default: 'unknown'
    },
    
    // Additional Notes
    additionalNotes: { type: String },
    
    // Audit Fields
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      comment: 'Doctor or admin who created this record'
    },
    lastUpdatedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      comment: 'Doctor or admin who last updated this record'
    },
    
    // Correction Request
    correctionRequested: { type: Boolean, default: false },
    correctionRequestMessage: { type: String },
    correctionRequestDate: { type: Date }
  },
  { timestamps: true }
);

// Index for faster queries
medicalHistorySchema.index({ patientId: 1 });

module.exports = mongoose.model('MedicalHistory', medicalHistorySchema);
