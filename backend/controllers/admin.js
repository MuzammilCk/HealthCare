const Doctor = require('../models/Doctor');

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

// PUT /api/admin/kyc-requests/:doctorId
// Update a doctor's KYC status to Approved or Rejected
exports.updateKycStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status, reason } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'Approved' or 'Rejected'" });
    }

    const doctor = await Doctor.findById(doctorId);
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
    res.json({ success: true, message: `Doctor KYC ${status.toLowerCase()}`, data: doctor });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
