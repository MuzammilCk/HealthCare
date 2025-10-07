const Bill = require('../models/Bill');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

/**
 * Create a new bill for a completed appointment
 * NEW: Inventory-based billing WITHOUT stock reduction (stock reduced on payment)
 */
exports.createBill = async (req, res) => {
  try {
    const { appointmentId, notes, useInventory = true } = req.body;
    const doctorId = req.user.id;

    // Validate appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.doctorId.toString() !== doctorId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    if (appointment.status !== 'Completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only create bills for completed appointments' 
      });
    }

    // Check if bill already generated (one-time only)
    if (appointment.finalBillGenerated) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bill already generated for this appointment' 
      });
    }

    // Get prescription for inventory-based billing
    const Prescription = require('../models/Prescription');
    const prescription = await Prescription.findOne({ appointmentId });
    
    let lineItems = [];
    let totalAmount = 0;

    if (useInventory && prescription && prescription.medicines && prescription.medicines.length > 0) {
      // INVENTORY-BASED BILLING
      const Doctor = require('../models/Doctor');
      const Inventory = require('../models/Inventory');

      // Get doctor's hospital
      const doctor = await Doctor.findOne({ userId: doctorId });
      if (!doctor || !doctor.hospitalId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Doctor not associated with any hospital. Cannot use inventory billing.' 
        });
      }

      // Filter medicines marked for hospital purchase
      const hospitalMedicines = prescription.medicines.filter(
        m => m.purchaseFromHospital === true
      );

      if (hospitalMedicines.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No medicines marked for hospital purchase in prescription' 
        });
      }

      // Build line items from inventory (CHECK 1: Initial availability check)
      for (const medicine of hospitalMedicines) {
        // Find medicine in inventory
        const inventoryItem = await Inventory.findOne({
          hospitalId: doctor.hospitalId,
          medicineName: { $regex: new RegExp(`^${medicine.medicineName}$`, 'i') },
          isActive: true
        });

        if (!inventoryItem) {
          return res.status(404).json({ 
            success: false, 
            message: `Medicine "${medicine.medicineName}" not found in hospital inventory` 
          });
        }

        // Check stock availability (first check - at bill creation)
        if (inventoryItem.stockQuantity < medicine.quantity) {
          return res.status(400).json({ 
            success: false, 
            message: `Insufficient stock for "${medicine.medicineName}". Available: ${inventoryItem.stockQuantity}, Required: ${medicine.quantity}` 
          });
        }

        // Add to line items (store inventory item ID for later stock reduction)
        const itemTotal = inventoryItem.price * medicine.quantity;
        lineItems.push({
          description: `${medicine.medicineName} - ${medicine.dosage} (${medicine.frequency} times for ${medicine.duration} days)`,
          quantity: medicine.quantity,
          amount: inventoryItem.price,
          inventoryItemId: inventoryItem._id // Store for payment processing
        });
        totalAmount += itemTotal;

        // NOTE: Stock is NOT reduced here - only reduced after successful payment
      }

      // Consultation fee is prepaid at booking; do not add here

    } else {
      // MANUAL BILLING (Legacy support)
      const { items } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'At least one bill item is required' 
        });
      }

      lineItems = items.map(item => {
        if (!item.description || !item.amount || item.amount < 0) {
          throw new Error('Invalid item data');
        }
        const quantity = item.quantity || 1;
        const itemTotal = Math.round(item.amount * quantity);
        totalAmount += itemTotal;
        
        return {
          description: item.description,
          quantity: quantity,
          amount: Math.round(item.amount),
        };
      });
    }

    // Create bill
    const bill = new Bill({
      appointmentId,
      patientId: appointment.patientId,
      doctorId,
      items: lineItems,
      totalAmount: Math.round(totalAmount),
      notes: notes || '',
      status: 'unpaid',
    });

    await bill.save();

    // Mark appointment as billed (one-time flag)
    appointment.finalBillGenerated = true;
    await appointment.save();

    // Populate for response
    await bill.populate('patientId', 'name email');
    await bill.populate('doctorId', 'name');
    await bill.populate('appointmentId', 'date timeSlot');

    // Send notification to patient
    if (global.sendNotification) {
      global.sendNotification(appointment.patientId.toString(), {
        type: 'new_bill',
        message: `New bill generated by Dr. ${req.user.name}`,
        billId: bill._id,
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Bill created successfully',
      bill 
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create bill' 
    });
  }
};

/**
 * Get all bills for a patient
 */
exports.getPatientBills = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { status } = req.query;

    const query = { patientId };
    if (status) {
      query.status = status;
    }

    const bills = await Bill.find(query)
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'date timeSlot')
      .sort({ createdAt: -1 });

    res.json({ success: true, bills });
  } catch (error) {
    console.error('Error fetching patient bills:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bills' });
  }
};

/**
 * Get all bills created by a doctor
 */
exports.getDoctorBills = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { status, appointmentId } = req.query;

    const query = { doctorId };
    if (status) {
      query.status = status;
    }
    if (appointmentId) {
      query.appointmentId = appointmentId;
    }

    const bills = await Bill.find(query)
      .populate('patientId', 'name email')
      .populate('appointmentId', 'date timeSlot')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bills });
  } catch (error) {
    console.error('Error fetching doctor bills:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bills' });
  }
};

/**
 * Get a single bill by ID
 */
exports.getBillById = async (req, res) => {
  try {
    const { billId } = req.params;
    const userId = req.user.id;

    const bill = await Bill.findById(billId)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'date timeSlot status');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    // Check authorization
    if (
      bill.patientId._id.toString() !== userId &&
      bill.doctorId._id.toString() !== userId
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    res.json({ success: true, bill });
  } catch (error) {
    console.error('Error fetching bill:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bill' });
  }
};

/**
 * Update bill (doctor only - e.g., cancel unpaid bill)
 */
exports.updateBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const { status, notes } = req.body;
    const doctorId = req.user.id;

    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (bill.doctorId.toString() !== doctorId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot modify a paid bill' 
      });
    }

    // Only allow cancelling unpaid bills
    if (status && status !== 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Can only cancel unpaid bills' 
      });
    }

    if (status) bill.status = status;
    if (notes !== undefined) bill.notes = notes;

    await bill.save();

    res.json({ 
      success: true, 
      message: 'Bill updated successfully',
      bill 
    });
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ success: false, message: 'Failed to update bill' });
  }
};

/**
 * Get bill statistics for doctor dashboard
 */
exports.getDoctorBillStats = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const stats = await Bill.aggregate([
      { $match: { doctorId: require('mongoose').Types.ObjectId(doctorId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    const formattedStats = {
      total: 0,
      unpaid: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 },
      cancelled: { count: 0, amount: 0 },
    };

    stats.forEach(stat => {
      formattedStats.total += stat.count;
      formattedStats[stat._id] = {
        count: stat.count,
        amount: stat.totalAmount,
      };
    });

    res.json({ success: true, stats: formattedStats });
  } catch (error) {
    console.error('Error fetching bill stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
};
