const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    patientId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    doctorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    appointmentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Appointment' 
    },
    billId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Bill' 
    },
    amount: { 
      type: Number, 
      required: true,
      min: 0,
      comment: 'Amount in paise (smallest currency unit)'
    },
    paymentType: { 
      type: String, 
      enum: ['booking_fee', 'bill_payment', 'refund'], 
      required: true 
    },
    stripeSessionId: { 
      type: String, 
      required: true 
    },
    stripePaymentIntentId: { 
      type: String 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded'], 
      default: 'pending' 
    },
    paymentDate: { 
      type: Date 
    },
    metadata: { 
      type: mongoose.Schema.Types.Mixed 
    }
  },
  { timestamps: true }
);

// Indexes for efficient queries
paymentSchema.index({ patientId: 1, createdAt: -1 });
paymentSchema.index({ stripeSessionId: 1 });
paymentSchema.index({ appointmentId: 1 });
paymentSchema.index({ billId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
