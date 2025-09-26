const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { createNotification } = require('../utils/createNotification');

// GET /api/admin/kyc-requests
// List doctors with verificationStatus = 'Submitted'
exports.getKycRequests = async (req, res) => {
  try {
    const doctors = await Doctor.find({ verificationStatus: 'Submitted' })
      .populate('userId', 'name email')
      .populate('specializationId', 'name description');
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
      .populate('specializationId', 'name');

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
