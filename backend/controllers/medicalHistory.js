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
      .populate('lastUpdatedBy', 'name role');

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
    }

    await medicalHistory.save();

    // Send notification to patient
    await createNotification({
      userId: patientId,
      type: 'medical_history_updated',
      message: `Your medical history has been updated by Dr. ${req.user.name}`,
      relatedId: medicalHistory._id,
      relatedModel: 'MedicalHistory'
    });

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

    // Notify admin or assigned doctor
    // For now, we'll create a general notification
    await createNotification({
      userId: medicalHistory.lastUpdatedBy || medicalHistory.createdBy,
      type: 'correction_requested',
      message: `Patient has requested a correction to their medical history`,
      relatedId: medicalHistory._id,
      relatedModel: 'MedicalHistory'
    });

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
      .populate('lastUpdatedBy', 'name role');

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
