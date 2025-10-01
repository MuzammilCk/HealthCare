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
    bio: { type: String },
    qualifications: { type: String },
    languages: [{ type: String }],
    experienceYears: { type: Number },
    location: { type: String },
    photoUrl: { type: String },
    district: { type: String, trim: true },
    // KYC / Verification
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Submitted', 'Approved', 'Rejected'],
      default: 'Pending',
      required: true,
    },
    kyc: {
      documents: [{ type: String }], // store signed URLs / file IDs
      submittedAt: { type: Date },
      reviewedAt: { type: Date },
      reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rejectedReason: { type: String },
    },
    // Patient ratings (1-5)
    ratings: [{ type: Number, min: 1, max: 5 }],
    // Consultation fee in paise (e.g., 25000 = ₹250)
    consultationFee: { 
      type: Number, 
      required: true, 
      default: 25000,
      min: 0,
      comment: 'Consultation fee in paise (smallest currency unit)'
    },
  },
  { timestamps: true }
);

// Expose virtuals in outputs
doctorSchema.set('toJSON', { virtuals: true });
doctorSchema.set('toObject', { virtuals: true });

// Virtual: averageRating from ratings array
doctorSchema.virtual('averageRating').get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((a, b) => a + b, 0);
  return Number((sum / this.ratings.length).toFixed(1));
});

module.exports = mongoose.model('Doctor', doctorSchema);