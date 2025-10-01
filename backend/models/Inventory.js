const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    medicineName: {
      type: String,
      required: true,
      trim: true,
    },
    genericName: {
      type: String,
      trim: true,
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      comment: 'Price per unit in paise (smallest currency unit)',
    },
    unit: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'other'],
      default: 'tablet',
    },
    batchNumber: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
    },
    minStockLevel: {
      type: Number,
      default: 10,
      comment: 'Minimum stock level for alerts',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastRestocked: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index for unique medicine per hospital
inventorySchema.index({ hospitalId: 1, medicineName: 1 }, { unique: true });

// Virtual for low stock alert
inventorySchema.virtual('isLowStock').get(function () {
  return this.stockQuantity <= this.minStockLevel;
});

// Method to check if medicine is available
inventorySchema.methods.isAvailable = function (quantity) {
  return this.stockQuantity >= quantity && this.isActive;
};

// Method to reduce stock
inventorySchema.methods.reduceStock = async function (quantity) {
  if (this.stockQuantity < quantity) {
    throw new Error('Insufficient stock');
  }
  this.stockQuantity -= quantity;
  return await this.save();
};

// Method to add stock
inventorySchema.methods.addStock = async function (quantity) {
  this.stockQuantity += quantity;
  this.lastRestocked = new Date();
  return await this.save();
};

// Expose virtuals in JSON
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
