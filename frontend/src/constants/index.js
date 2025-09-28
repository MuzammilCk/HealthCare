// Shared constants for the HealthCare application

// Kerala districts list
export const KERALA_DISTRICTS = [
  "Thiruvananthapuram",
  "Kollam", 
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod"
];

// User roles
export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  ADMIN: 'admin'
};

// Appointment statuses
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  FOLLOW_UP: 'Follow-up'
};

// Notification types
export const NOTIFICATION_TYPES = {
  APPOINTMENT: 'appointment',
  KYC: 'kyc',
  SYSTEM: 'system',
  REMINDER: 'reminder'
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me'
  },
  PATIENTS: {
    APPOINTMENTS: '/patients/appointments',
    DOCTORS: '/patients/doctors',
    MEDICAL_HISTORY: '/patients/me/medical-history',
    PRESCRIPTIONS: '/patients/prescriptions'
  },
  DOCTORS: {
    APPOINTMENTS: '/doctors/appointments',
    AVAILABILITY: '/doctors/availability',
    PROFILE: '/doctors/profile'
  },
  NOTIFICATIONS: '/notifications'
};

// Time slots configuration
export const TIME_SLOT_CONFIG = {
  DURATION_MINUTES: 30,
  DEFAULT_START_TIME: '09:00',
  DEFAULT_END_TIME: '17:00'
};
