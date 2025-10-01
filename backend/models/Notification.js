const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true, trim: true },
    link: { type: String, default: '' },
    type: {
      type: String,
      enum: ['appointment', 'prescription', 'kyc', 'system', 'reminder', 'refund'],
      default: 'system',
    },
    metadata: { type: Object, default: {} },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);

