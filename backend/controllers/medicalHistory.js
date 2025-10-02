const MedicalHistory = require('../models/MedicalHistory');
const User = require('../models/User');
const { createNotification } = require('../utils/createNotification');

/**
 * Get medical history for a specific patient (Doctor/Admin access)
 */
exports.getPatientMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    let medicalHistory = await MedicalHistory.findOne({ patientId })
      .populate('createdBy', 'name role')
      .populate('lastUpdatedBy', 'name role')
      .populate('approvedBy', 'name role');

    // If no medical history exists, create a basic one
    if (!medicalHistory) {
      medicalHistory = new MedicalHistory({
        patientId,
        createdBy: req.user.id
      });
      await medicalHistory.save();
    }

    res.json({ success: true, data: medicalHistory });
  } catch (error) {
    console.error('Error fetching medical history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Update medical history (Doctor/Admin only)
 */
exports.updatePatientMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const updateData = req.body;

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    let medicalHistory = await MedicalHistory.findOne({ patientId });

    if (!medicalHistory) {
      // Create new medical history
      medicalHistory = new MedicalHistory({
        ...updateData,
        patientId,
        createdBy: req.user.id,
        lastUpdatedBy: req.user.id
      });
    } else {
      // Update existing medical history
      Object.keys(updateData).forEach(key => {
        if (key !== 'patientId' && key !== 'createdBy') {
          medicalHistory[key] = updateData[key];
        }
      });
      medicalHistory.lastUpdatedBy = req.user.id;
      
      // Clear correction request if it was pending
      if (medicalHistory.correctionRequested) {
        medicalHistory.correctionRequested = false;
        medicalHistory.correctionRequestMessage = null;
        medicalHistory.correctionRequestDate = null;
      }
      
      // Mark as needs review after update (will need re-approval)
      medicalHistory.approvalStatus = 'needs_review';
    }

    await medicalHistory.save();
    
    // Populate for response
    await medicalHistory.populate('approvedBy', 'name role');

    // Send notification to patient
    await createNotification(
      patientId,
      `Your medical history has been updated by Dr. ${req.user.name}`,
      '/patient/medical-history',
      'system',
      { medicalHistoryId: medicalHistory._id }
    );

    res.json({ 
      success: true, 
      message: 'Medical history updated successfully',
      data: medicalHistory 
    });
  } catch (error) {
    console.error('Error updating medical history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Request correction to medical history (Patient only)
 */
exports.requestCorrection = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Correction request message is required' 
      });
    }

    let medicalHistory = await MedicalHistory.findOne({ patientId });

    if (!medicalHistory) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medical history not found' 
      });
    }

    medicalHistory.correctionRequested = true;
    medicalHistory.correctionRequestMessage = message.trim();
    medicalHistory.correctionRequestDate = new Date();

    await medicalHistory.save();

    // Notify admin or assigned doctor if they exist
    if (medicalHistory.lastUpdatedBy || medicalHistory.createdBy) {
      await createNotification(
        medicalHistory.lastUpdatedBy || medicalHistory.createdBy,
        `Patient has requested a correction to their medical history`,
        '/doctor/patient-file',
        'system',
        { medicalHistoryId: medicalHistory._id, patientId }
      );
    }

    res.json({ 
      success: true, 
      message: 'Correction request submitted successfully' 
    });
  } catch (error) {
    console.error('Error requesting correction:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Get own medical history (Patient - Read only)
 */
exports.getOwnMedicalHistory = async (req, res) => {
  try {
    const patientId = req.user.id;

    let medicalHistory = await MedicalHistory.findOne({ patientId })
      .populate('createdBy', 'name role')
      .populate('lastUpdatedBy', 'name role')
      .populate('approvedBy', 'name role');

    if (!medicalHistory) {
      // Create a basic medical history if it doesn't exist
      medicalHistory = new MedicalHistory({
        patientId
      });
      await medicalHistory.save();
    }

    res.json({ success: true, data: medicalHistory });
  } catch (error) {
    console.error('Error fetching medical history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Approve medical history (Doctor only)
 */
exports.approveMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.id;

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    let medicalHistory = await MedicalHistory.findOne({ patientId });

    if (!medicalHistory) {
      return res.status(404).json({ 
        success: false, 
        message: 'Medical history not found' 
      });
    }

    // Approve the medical history
    medicalHistory.approvalStatus = 'approved';
    medicalHistory.approvedBy = doctorId;
    medicalHistory.approvedAt = new Date();
    
    // Clear correction request if exists
    if (medicalHistory.correctionRequested) {
      medicalHistory.correctionRequested = false;
      medicalHistory.correctionRequestMessage = null;
      medicalHistory.correctionRequestDate = null;
    }

    await medicalHistory.save();

    // Populate doctor name for response
    await medicalHistory.populate('approvedBy', 'name role');

    // Notify patient
    await createNotification(
      patientId,
      `Your medical history has been approved by Dr. ${req.user.name}`,
      '/patient/medical-history',
      'system',
      { medicalHistoryId: medicalHistory._id }
    );

    res.json({ 
      success: true, 
      message: 'Medical history approved successfully',
      data: medicalHistory 
    });
  } catch (error) {
    console.error('Error approving medical history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
