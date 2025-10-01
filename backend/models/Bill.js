const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  description: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1,
    default: 1
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0,
    comment: 'Amount per item in paise (smallest currency unit)'
  }
}, { _id: true });

const billSchema = new mongoose.Schema(
  {
    appointmentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Appointment', 
      required: true 
    },
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
    items: [billItemSchema],
    totalAmount: { 
      type: Number, 
      required: true,
      min: 0,
      comment: 'Total amount in paise (smallest currency unit)'
    },
    status: { 
      type: String, 
      enum: ['unpaid', 'paid', 'cancelled'], 
      default: 'unpaid' 
    },
    notes: { 
      type: String, 
      default: '' 
    },
    paidAt: { 
      type: Date 
    },
    paymentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Payment' 
    }
  },
  { timestamps: true }
);

// Indexes for efficient queries
billSchema.index({ patientId: 1, status: 1, createdAt: -1 });
billSchema.index({ appointmentId: 1 });
billSchema.index({ doctorId: 1, createdAt: -1 });

module.exports = mongoose.model('Bill', billSchema);
