const Inventory = require('../models/Inventory');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');

/**
 * Get all inventory items for a hospital
 * GET /api/inventory/:hospitalId
 */
exports.getHospitalInventory = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { search, isLowStock } = req.query;

    // Build query
    const query = { hospitalId, isActive: true };
    
    if (search) {
      query.$or = [
        { medicineName: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } }
      ];
    }

    const inventory = await Inventory.find(query)
      .populate('hospitalId', 'name address')
      .sort({ medicineName: 1 });

    // Filter for low stock if requested
    let filteredInventory = inventory;
    if (isLowStock === 'true') {
      filteredInventory = inventory.filter(item => item.isLowStock);
    }

    res.json({ 
      success: true, 
      count: filteredInventory.length,
      inventory: filteredInventory 
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
  }
};

/**
 * Get doctor's hospital inventory
 * GET /api/inventory/my-hospital
 */
exports.getMyHospitalInventory = async (req, res) => {
  try {
    const doctorId = req.user.id;

    // Get doctor's hospital
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor || !doctor.hospitalId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not associated with any hospital' 
      });
    }

    const { search, isLowStock } = req.query;
    const query = { hospitalId: doctor.hospitalId, isActive: true };
    
    if (search) {
      query.$or = [
        { medicineName: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } }
      ];
    }

    const inventory = await Inventory.find(query)
      .populate('hospitalId', 'name address')
      .sort({ medicineName: 1 });

    // Filter for low stock if requested
    let filteredInventory = inventory;
    if (isLowStock === 'true') {
      filteredInventory = inventory.filter(item => item.isLowStock);
    }

    res.json({ 
      success: true, 
      count: filteredInventory.length,
      inventory: filteredInventory,
      hospital: doctor.hospitalId
    });
  } catch (error) {
    console.error('Error fetching my hospital inventory:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inventory' });
  }
};

/**
 * Add new medicine to inventory
 * POST /api/inventory
 */
exports.addInventoryItem = async (req, res) => {
  try {
    const doctorId = req.user.id;
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
      notes 
    } = req.body;

    // Get doctor's hospital
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor || !doctor.hospitalId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not associated with any hospital' 
      });
    }

    // Validate required fields
    if (!medicineName || stockQuantity === undefined || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Medicine name, stock quantity, and price are required' 
      });
    }

    // Check if medicine already exists in this hospital
    const existing = await Inventory.findOne({
      hospitalId: doctor.hospitalId,
      medicineName: { $regex: new RegExp(`^${medicineName}$`, 'i') }
    });

    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'Medicine already exists in inventory. Please update existing item.' 
      });
    }

    // Create new inventory item
    const inventoryItem = new Inventory({
      hospitalId: doctor.hospitalId,
      medicineName,
      genericName,
      manufacturer,
      stockQuantity,
      price: Math.round(price), // Ensure integer (paise)
      unit: unit || 'tablet',
      batchNumber,
      expiryDate,
      minStockLevel: minStockLevel || 10,
      notes,
      lastRestocked: new Date(),
    });

    await inventoryItem.save();

    res.status(201).json({ 
      success: true, 
      message: 'Medicine added to inventory successfully',
      item: inventoryItem 
    });
  } catch (error) {
    console.error('Error adding inventory item:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to add inventory item' 
    });
  }
};

/**
 * Update inventory item
 * PUT /api/inventory/:itemId
 */
exports.updateInventoryItem = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { itemId } = req.params;
    const updates = req.body;

    // Get doctor's hospital
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor || !doctor.hospitalId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not associated with any hospital' 
      });
    }

    // Find inventory item
    const item = await Inventory.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    // Verify item belongs to doctor's hospital
    if (item.hospitalId.toString() !== doctor.hospitalId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized: Item belongs to different hospital' 
      });
    }

    // Update allowed fields
    const allowedFields = [
      'genericName',
      'manufacturer',
      'stockQuantity',
      'price',
      'unit',
      'batchNumber',
      'expiryDate',
      'minStockLevel',
      'notes',
      'isActive'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'price') {
          item[field] = Math.round(updates[field]); // Ensure integer (paise)
        } else {
          item[field] = updates[field];
        }
      }
    });

    // Update lastRestocked if stock increased
    if (updates.stockQuantity && updates.stockQuantity > item.stockQuantity) {
      item.lastRestocked = new Date();
    }

    await item.save();

    res.json({ 
      success: true, 
      message: 'Inventory item updated successfully',
      item 
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to update inventory item' 
    });
  }
};

/**
 * Delete inventory item (soft delete)
 * DELETE /api/inventory/:itemId
 */
exports.deleteInventoryItem = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { itemId } = req.params;

    // Get doctor's hospital
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor || !doctor.hospitalId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not associated with any hospital' 
      });
    }

    // Find inventory item
    const item = await Inventory.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Inventory item not found' });
    }

    // Verify item belongs to doctor's hospital
    if (item.hospitalId.toString() !== doctor.hospitalId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized: Item belongs to different hospital' 
      });
    }

    // Soft delete
    item.isActive = false;
    await item.save();

    res.json({ 
      success: true, 
      message: 'Inventory item deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ success: false, message: 'Failed to delete inventory item' });
  }
};

/**
 * Get low stock items
 * GET /api/inventory/low-stock
 */
exports.getLowStockItems = async (req, res) => {
  try {
    const doctorId = req.user.id;

    // Get doctor's hospital
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor || !doctor.hospitalId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not associated with any hospital' 
      });
    }

    const inventory = await Inventory.find({
      hospitalId: doctor.hospitalId,
      isActive: true
    }).sort({ stockQuantity: 1 });

    const lowStockItems = inventory.filter(item => item.isLowStock);

    res.json({ 
      success: true, 
      count: lowStockItems.length,
      items: lowStockItems 
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch low stock items' });
  }
};

/**
 * Search medicines in inventory (for prescription)
 * GET /api/inventory/search
 */
exports.searchMedicines = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ success: true, medicines: [] });
    }

    // Get doctor's hospital
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor || !doctor.hospitalId) {
      return res.json({ success: true, medicines: [] });
    }

    const medicines = await Inventory.find({
      hospitalId: doctor.hospitalId,
      isActive: true,
      stockQuantity: { $gt: 0 },
      $or: [
        { medicineName: { $regex: query, $options: 'i' } },
        { genericName: { $regex: query, $options: 'i' } }
      ]
    })
    .select('medicineName genericName price stockQuantity unit')
    .limit(20)
    .sort({ medicineName: 1 });

    res.json({ 
      success: true, 
      medicines 
    });
  } catch (error) {
    console.error('Error searching medicines:', error);
    res.status(500).json({ success: false, message: 'Failed to search medicines' });
  }
};
