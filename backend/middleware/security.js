// Additional security middleware for healthcare application

// Middleware to ensure patients can only access their own data
exports.ensureOwnPatientData = (req, res, next) => {
  // This middleware should be used after protect middleware
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  // For patient role, ensure they can only access their own data
  if (req.user.role === 'patient') {
    // If there's a patientId in params, ensure it matches the authenticated user
    if (req.params.patientId && req.params.patientId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only access your own data' });
    }
  }

  next();
};

// Middleware to ensure doctors can only access their own appointments/patients
exports.ensureOwnDoctorData = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  // For doctor role, additional checks can be added here
  if (req.user.role === 'doctor') {
    // This can be extended based on specific requirements
    // For now, we'll rely on controller-level checks
  }

  next();
};

// Middleware to validate appointment ownership
exports.validateAppointmentOwnership = async (req, res, next) => {
  try {
    const Appointment = require('../models/Appointment');
    const appointmentId = req.params.id || req.params.appointmentId;
    
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Appointment ID required' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check ownership based on user role
    if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: Not your appointment' });
    }

    if (req.user.role === 'doctor' && appointment.doctorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: Not your appointment' });
    }

    // Store appointment in request for use in controller
    req.appointment = appointment;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during ownership validation' });
  }
};

// Rate limiting middleware for sensitive operations
exports.rateLimitSensitiveOps = (req, res, next) => {
  // This is a placeholder for rate limiting implementation
  // In production, you would use a proper rate limiting library like express-rate-limit
  next();
};

// Input sanitization middleware
exports.sanitizeInput = (req, res, next) => {
  // Basic input sanitization
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  };

  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};
