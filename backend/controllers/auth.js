const User = require('../models/User');
const Doctor = require('../models/Doctor'); // Import the Doctor model
const { validationResult } = require('express-validator');

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

  const { name, email, password, role, specializationId } = req.body;

  try {
    // Check if user already exists
    let existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Step 1: Create the new user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
    });

    // Step 2: If the user is a doctor, create their professional Doctor profile
    if (user.role === 'doctor') {
      // A specialization is required for a doctor profile
      if (!specializationId) {
        // This is a server-side validation check. The frontend should also prevent this.
        return res.status(400).json({ success: false, message: 'Specialization is required for doctors.' });
      }
      
      // Create the corresponding doctor document
      await Doctor.create({
        userId: user._id,
        specializationId: specializationId,
        availability: [], // Doctors can set their availability later
      });
    }

    // Step 3: Return the token and user info
    const token = user.getSignedJwtToken();
    res.status(201).json({ 
      success: true, 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });

  } catch (e) {
    console.error(e);
    // Important: If any part of the process fails, delete the user that might have been created
    // This prevents having a user account without a corresponding doctor profile.
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
    res.json({ 
      success: true, 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
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