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

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map();

// Rate limiting middleware for sensitive operations
exports.rateLimitSensitiveOps = (windowMs = 15 * 60 * 1000, maxRequests = 5) => {
  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (rateLimitStore.has(identifier)) {
      const requests = rateLimitStore.get(identifier).filter(time => time > windowStart);
      rateLimitStore.set(identifier, requests);
    }
    
    // Get current requests in window
    const requests = rateLimitStore.get(identifier) || [];
    
    if (requests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
      });
    }
    
    // Add current request
    requests.push(now);
    rateLimitStore.set(identifier, requests);
    
    next();
  };
};

// Enhanced input sanitization middleware
exports.sanitizeInput = (req, res, next) => {
  const validator = require('validator');
  
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Trim whitespace
    str = str.trim();
    
    // Remove script tags and other dangerous HTML
    str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    str = str.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    str = str.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
    str = str.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
    str = str.replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '');
    str = str.replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '');
    
    // Remove javascript: and data: URLs
    str = str.replace(/javascript:/gi, '');
    str = str.replace(/data:/gi, '');
    str = str.replace(/vbscript:/gi, '');
    
    // Remove on* event handlers
    str = str.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Escape HTML entities for safety
    str = validator.escape(str);
    
    return str;
  };

  const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          // Sanitize key names too
          const sanitizedKey = typeof key === 'string' ? key.replace(/[^\w\-_.]/g, '') : key;
          sanitized[sanitizedKey] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    return obj;
  };

  // Sanitize all input
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};

// Additional security headers middleware
exports.securityHeaders = (req, res, next) => {
  // Prevent XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enforce HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");
  
  next();
};
