const User = require('../models/User');
const Doctor = require('../models/Doctor'); // Import the Doctor model
const { validationResult } = require('express-validator');
const { createRoleBasedNotifications } = require('../utils/createNotification');

// Helper to send cookie
const sendTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd, // only over HTTPS in production
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

/**
 * @desc    Register a new user (patient or doctor)
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Destructure all required fields from the request body, including the new 'district'
  const { name, email, password, role, specializationId, district } = req.body;

  try {
    // Check if a user with the given email already exists
    let existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Step 1: Create the new user with their district
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      district, // Save the district to the user model
    });

    // Step 2: If the user is a doctor, create their professional Doctor profile
    if (user.role === 'doctor') {
      // Validate that specialization and district are provided for doctors
      if (!specializationId) {
        return res.status(400).json({ success: false, message: 'Specialization is required for doctors.' });
      }
      if (!district) {
        return res.status(400).json({ success: false, message: 'District is required for doctors.' });
      }
      
      // Create the corresponding doctor document with their district
      await Doctor.create({
        userId: user._id,
        specializationId: specializationId,
        availability: [], // Doctors can set their availability later
        district: district, // Save the district to the doctor model
      });

      // Notify all admins about new doctor registration
      await createRoleBasedNotifications(
        'admin',
        `A new doctor, ${user.name}, has registered`,
        '/admin/manage-doctors',
        'system',
        { doctorId: user._id, doctorName: user.name, district }
      );
    }

    // Step 3: Set cookie and return user info
    const token = user.getSignedJwtToken();
    sendTokenCookie(res, token);
    res.status(201).json({ 
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, district: user.district }
    });

  } catch (e) {
    console.error(e);
    // If any part of the process fails, delete the user that might have been created
    // This prevents having an orphaned user account.
    await User.findOneAndDelete({ email });
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

/**
 * @desc    Login a user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = user.getSignedJwtToken();
    sendTokenCookie(res, token);
    res.json({ 
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, district: user.district }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    // req.user is set by the 'protect' middleware
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Logout current user (clear cookie)
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('token', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax', path: '/' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};