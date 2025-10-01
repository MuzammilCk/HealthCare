const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Inventory = require('../models/Inventory');
const { createNotification } = require('../utils/createNotification');

// GET /api/admin/kyc-requests
// List doctors with verificationStatus = 'Submitted'
exports.getKycRequests = async (req, res) => {
  try {
    const doctors = await Doctor.find({ verificationStatus: 'Submitted' })
      .populate('userId', 'name email')
      .populate('specializationId', 'name description')
      .populate('hospitalId', 'name district');
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/doctors
// List all doctors with populated user and specialization
exports.getAllDoctors = async (req, res) => {
  try {
    const { sortBy } = req.query;
    const doctors = await Doctor.find()
      .populate('userId', 'name email district')
      .populate('specializationId', 'name')
      .populate('hospitalId', 'name district');

    if (sortBy === 'rating_desc') {
      doctors.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === 'rating_asc') {
      doctors.sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0));
    }

    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/admin/doctors/:userId
// Remove a doctor User and their Doctor profile
exports.deleteDoctor = async (req, res) => {
  try {
    const { userId } = req.params;
    await Doctor.findOneAndDelete({ userId });
    await User.findByIdAndDelete(userId);
    res.json({ success: true, message: 'Doctor removed successfully' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/kyc-requests/:doctorId
// Update a doctor's KYC status to Approved or Rejected
exports.updateKycStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, reason } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'Approved' or 'Rejected'" });
    }

    const doctor = await Doctor.findById(doctorId)
      .populate('userId', 'name');
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    doctor.verificationStatus = status;
    doctor.kyc = doctor.kyc || {};
    doctor.kyc.reviewedAt = new Date();
    doctor.kyc.reviewerId = req.user.id;
    if (status === 'Rejected') {
      doctor.kyc.rejectedReason = reason || 'Not specified';
    } else {
      doctor.kyc.rejectedReason = undefined;
    }

    await doctor.save();

    // Notify the doctor about KYC status update
    const message = status === 'Approved' 
      ? 'Congratulations! Your KYC has been approved.'
      : `Your KYC has been rejected. Reason: ${reason || 'Not specified'}`;

    await createNotification(
      doctor.userId._id,
      message,
      '/doctor/kyc',
      'kyc',
      { status, reason, doctorId: doctor._id }
    );

    res.json({ success: true, message: `Doctor KYC ${status.toLowerCase()}`, data: doctor });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== HOSPITAL MANAGEMENT ====================

// GET /api/admin/hospitals
// Get all hospitals
exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ name: 1 });
    res.json({ success: true, count: hospitals.length, data: hospitals });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/admin/hospitals
// Create a new hospital
exports.createHospital = async (req, res) => {
  try {
    const { name, address, phone, email, district, city, pincode, registrationNumber } = req.body;

    // Validate required fields
    if (!name || !address || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, address, and phone are required' 
      });
    }

    // Check if hospital with same registration number exists
    if (registrationNumber) {
      const existing = await Hospital.findOne({ registrationNumber });
      if (existing) {
        return res.status(400).json({ 
          success: false, 
          message: 'Hospital with this registration number already exists' 
        });
      }
    }

    const hospital = await Hospital.create({
      name,
      address,
      phone,
      email,
      district,
      city,
      state: 'Kerala',
      pincode,
      registrationNumber,
    });

    res.status(201).json({ success: true, data: hospital });
  } catch (e) {
    console.error('Create hospital error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/hospitals/:id
// Update a hospital
exports.updateHospital = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email, district, city, pincode, registrationNumber, isActive } = req.body;

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Check if registration number is being changed and if it conflicts
    if (registrationNumber && registrationNumber !== hospital.registrationNumber) {
      const existing = await Hospital.findOne({ registrationNumber, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ 
          success: false, 
          message: 'Hospital with this registration number already exists' 
        });
      }
    }

    // Update fields
    if (name) hospital.name = name;
    if (address) hospital.address = address;
    if (phone) hospital.phone = phone;
    if (email !== undefined) hospital.email = email;
    if (district !== undefined) hospital.district = district;
    if (city !== undefined) hospital.city = city;
    if (pincode !== undefined) hospital.pincode = pincode;
    if (registrationNumber !== undefined) hospital.registrationNumber = registrationNumber;
    if (isActive !== undefined) hospital.isActive = isActive;

    await hospital.save();

    res.json({ success: true, data: hospital });
  } catch (e) {
    console.error('Update hospital error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/admin/hospitals/:id
// Delete a hospital
exports.deleteHospital = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any doctors are associated with this hospital
    const doctorCount = await Doctor.countDocuments({ hospitalId: id });
    if (doctorCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete hospital. ${doctorCount} doctor(s) are associated with it.` 
      });
    }

    // Check if any inventory items exist for this hospital
    const inventoryCount = await Inventory.countDocuments({ hospitalId: id });
    if (inventoryCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete hospital. ${inventoryCount} inventory item(s) exist for it.` 
      });
    }

    const hospital = await Hospital.findByIdAndDelete(id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.json({ success: true, message: 'Hospital deleted successfully' });
  } catch (e) {
    console.error('Delete hospital error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== INVENTORY MANAGEMENT ====================

// GET /api/admin/inventory
// Get all inventory items across all hospitals
exports.getAllInventory = async (req, res) => {
  try {
    const { hospitalId } = req.query;

    const query = {};
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }

    const inventory = await Inventory.find(query)
      .populate('hospitalId', 'name district')
      .sort({ hospitalId: 1, medicineName: 1 });

    res.json({ success: true, count: inventory.length, data: inventory });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/admin/inventory
// Add a new inventory item
exports.createInventoryItem = async (req, res) => {
  try {
    const {
      hospitalId,
      medicineName,
      genericName,
      manufacturer,
      stockQuantity,
      price,
      unit,
      batchNumber,
      expiryDate,
      minStockLevel,
      notes,
    } = req.body;

    // Validate required fields
    if (!hospitalId || !medicineName || price === undefined || stockQuantity === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Hospital, medicine name, price, and stock quantity are required' 
      });
    }

    // Check if hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Check if medicine already exists for this hospital
    const existing = await Inventory.findOne({ hospitalId, medicineName });
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'This medicine already exists in the hospital inventory. Use update to modify it.' 
      });
    }

    const inventoryItem = await Inventory.create({
      hospitalId,
      medicineName,
      genericName,
      manufacturer,
      stockQuantity,
      price,
      unit,
      batchNumber,
      expiryDate,
      minStockLevel,
      notes,
      lastRestocked: new Date(),
    });

    const populatedItem = await Inventory.findById(inventoryItem._id)
      .populate('hospitalId', 'name district');

    res.status(201).json({ success: true, data: populatedItem });
  } catch (e) {
    console.error('Create inventory error:', e);
    if (e.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'This medicine already exists in the hospital inventory' 
      });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/inventory/:id
// Update an inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      medicineName,
      genericName,
      manufacturer,
      stockQuantity,
      price,
      unit,
      batchNumber,
      expiryDate,
      minStockLevel,
      isActive,
      notes,
    } = req.body;

    const inventoryItem = await Inventory.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    // Update fields
    if (medicineName) inventoryItem.medicineName = medicineName;
    if (genericName !== undefined) inventoryItem.genericName = genericName;
    if (manufacturer !== undefined) inventoryItem.manufacturer = manufacturer;
    if (stockQuantity !== undefined) {
      inventoryItem.stockQuantity = stockQuantity;
      inventoryItem.lastRestocked = new Date();
    }
    if (price !== undefined) inventoryItem.price = price;
    if (unit) inventoryItem.unit = unit;
    if (batchNumber !== undefined) inventoryItem.batchNumber = batchNumber;
    if (expiryDate !== undefined) inventoryItem.expiryDate = expiryDate;
    if (minStockLevel !== undefined) inventoryItem.minStockLevel = minStockLevel;
    if (isActive !== undefined) inventoryItem.isActive = isActive;
    if (notes !== undefined) inventoryItem.notes = notes;

    await inventoryItem.save();

    const populatedItem = await Inventory.findById(id)
      .populate('hospitalId', 'name district');

    res.json({ success: true, data: populatedItem });
  } catch (e) {
    console.error('Update inventory error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/admin/inventory/:id
// Delete an inventory item
exports.deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const inventoryItem = await Inventory.findByIdAndDelete(id);
    if (!inventoryItem) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    res.json({ success: true, message: 'Inventory item deleted successfully' });
  } catch (e) {
    console.error('Delete inventory error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
