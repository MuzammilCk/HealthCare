const User = require('../models/User');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

// Configure multer for profile picture uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * @desc    Get current user profile
 * @route   GET /api/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const profileData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      district: user.district,
      photoUrl: user.photoUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // If user is a doctor, include hospital information
    if (user.role === 'doctor') {
      const Doctor = require('../models/Doctor');
      const doctorProfile = await Doctor.findOne({ userId: user._id })
        .populate('hospitalId', 'name address district city phone email')
        .populate('specializationId', 'name');
      
      if (doctorProfile) {
        profileData.doctorProfile = {
          hospitalId: doctorProfile.hospitalId,
          specializationId: doctorProfile.specializationId,
          consultationFee: doctorProfile.consultationFee,
          verificationStatus: doctorProfile.verificationStatus
        };
      }
    }

    res.json({ 
      success: true, 
      data: profileData
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update user profile information
 * @route   PUT /api/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation errors', 
      errors: errors.array() 
    });
  }

  try {
    const { name, email, district } = req.body;
    const userId = req.user.id;

    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is already in use by another account' 
        });
      }
    }

    // Prepare update object
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (district) updateData.district = district.trim();

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        district: user.district,
        photoUrl: user.photoUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Upload profile picture
 * @route   POST /api/profile/upload-picture
 * @access  Private
 */
exports.uploadProfilePicture = [
  upload.single('profilePicture'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No image file provided' 
        });
      }

      const userId = req.user.id;
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'profiles');
      try {
        await fs.access(uploadsDir);
      } catch {
        await fs.mkdir(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const filename = `profile_${userId}_${Date.now()}.jpg`;
      const filepath = path.join(uploadsDir, filename);

      // Process image with Sharp (resize, compress, convert to JPEG)
      await sharp(req.file.buffer)
        .resize(300, 300, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ 
          quality: 85,
          progressive: true
        })
        .toFile(filepath);

      // Delete old profile picture if it exists
      const user = await User.findById(userId);
      if (user.photoUrl) {
        const oldFilename = path.basename(user.photoUrl);
        const oldFilepath = path.join(uploadsDir, oldFilename);
        try {
          await fs.unlink(oldFilepath);
        } catch (error) {
          console.log('Old profile picture not found or already deleted');
        }
      }

      // Update user with new photo URL
      const photoUrl = `/uploads/profiles/${filename}`;
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { photoUrl },
        { new: true }
      ).select('-password');

      res.json({ 
        success: true, 
        message: 'Profile picture uploaded successfully',
        data: {
          photoUrl: updatedUser.photoUrl
        }
      });
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            success: false, 
            message: 'File size too large. Maximum size is 5MB.' 
          });
        }
      }
      
      res.status(500).json({ success: false, message: 'Server error during upload' });
    }
  }
];

/**
 * @desc    Remove profile picture
 * @route   DELETE /api/profile/picture
 * @access  Private
 */
exports.removeProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete the file if it exists
    if (user.photoUrl) {
      const filename = path.basename(user.photoUrl);
      const filepath = path.join(__dirname, '..', 'uploads', 'profiles', filename);
      
      try {
        await fs.unlink(filepath);
      } catch (error) {
        console.log('Profile picture file not found or already deleted');
      }
    }

    // Update user to remove photo URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { photoUrl: '' },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: 'Profile picture removed successfully',
      data: {
        photoUrl: updatedUser.photoUrl
      }
    });
  } catch (error) {
    console.error('Error removing profile picture:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/profile/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation errors', 
      errors: errors.array() 
    });
  }

  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = exports;
