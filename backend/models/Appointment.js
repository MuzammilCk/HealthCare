const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Follow-up', 'cancelled_refunded', 'cancelled_no_refund'], 
      default: 'Scheduled' 
    },
    notes: { type: String, default: '' },
    isRated: { type: Boolean, default: false },
    bookingFeeStatus: { 
      type: String, 
      enum: ['unpaid', 'paid'], 
      default: 'unpaid',
      comment: 'Payment status for the consultation booking fee'
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
