const Prescription = require('../models/Prescription');
const Inventory = require('../models/Inventory');
const Doctor = require('../models/Doctor');
const { createNotification } = require('../utils/createNotification');

exports.updatePrescriptionStatus = async (req, res) => {
  try {
    if (req.user.role !== 'pharmacist') {
      return res.status(403).json({ success: false, message: 'Only pharmacists can update prescription status' });
    }

    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['New', 'Pending Fulfillment', 'Filled', 'Partially Filled', 'Cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const prescription = await Prescription.findById(id).populate('doctorId', '_id').populate('patientId', '_id');
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (status === 'Filled' || status === 'Partially Filled') {
      const doctorProfile = await Doctor.findOne({ userId: prescription.doctorId._id }).select('hospitalId');
      const hospitalId = doctorProfile?.hospitalId;
      for (const med of prescription.medicines || []) {
        if (!med.purchaseFromHospital || !med.inventoryItemId) continue;
        const inv = await Inventory.findById(med.inventoryItemId);
        if (!inv) continue;
        if (hospitalId && inv.hospitalId && String(inv.hospitalId) !== String(hospitalId)) continue;
        inv.stockQuantity = Math.max(0, (inv.stockQuantity || 0) - (med.quantity || 0));
        await inv.save();
      }
    }

    prescription.status = status;
    await prescription.save();

    try {
      await createNotification(
        prescription.patientId._id || prescription.patientId,
        `Your prescription is now ${status}.`,
        '/patient/prescriptions',
        'prescription',
        { prescriptionId: prescription._id, status }
      );
    } catch {}

    res.json({ success: true, message: 'Prescription status updated', data: prescription });
  } catch (error) {
    console.error('Error updating prescription status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


