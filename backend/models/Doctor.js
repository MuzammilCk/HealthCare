const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    slots: [{ type: String, required: true }],
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specializationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialization', required: true },
    availability: [availabilitySchema],
    // Optional profile fields
    bio: { type: String },
    qualifications: { type: String },
    languages: [{ type: String }],
    experienceYears: { type: Number },
    location: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
