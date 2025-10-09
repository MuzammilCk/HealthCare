const mongoose = require('mongoose');

const symptomCheckLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    input: {
      symptoms: { type: String, required: true, trim: true },
      age: { type: Number, required: true, min: 1, max: 120 },
      sex: { type: String, required: true, enum: ['male', 'female', 'other'] }
    },
    resultSummary: {
      potentialConditionsCount: { type: Number, default: 0 },
      firstAidSuggestion: { type: String, default: '' }
    },
    response: { type: mongoose.Schema.Types.Mixed },
    error: { type: String, default: '' },
    meta: {
      ip: { type: String },
      userAgent: { type: String }
    }
  },
  { timestamps: true }
);

symptomCheckLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SymptomCheckLog', symptomCheckLogSchema);


