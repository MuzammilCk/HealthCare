const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Normalize a YYYY-MM-DD (or any parseable date) string to UTC midnight.
 *
 * IMPORTANT: this parses the calendar-date components directly rather than
 * round-tripping through a locale-dependent `new Date(dateString)` +
 * local getters, so the result is identical regardless of the server's TZ
 * environment variable. (The previous per-file implementations of this
 * function used `date.getFullYear()/getMonth()/getDate()` - local-time
 * getters - on a Date built from the input string, which shifts the
 * resulting UTC-midnight instant by a day whenever the server runs in a
 * negative-UTC-offset timezone. See fix commit for a reproduction.)
 *
 * @param {string} dateInput - e.g. "2026-08-05" or an ISO string
 * @returns {Date} UTC midnight for that calendar date
 */
function normalizeDateToUTC(dateInput) {
  const s = String(dateInput);
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0));
  }
  // Fallback for non-ISO input: use UTC getters (not local) on the parsed date.
  const parsed = new Date(s);
  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Expand a doctor's declared availability ranges (e.g. "09:00-13:00") into
 * individual bookable slots. SLOT_MINUTES is the single source of truth for
 * slot granularity across the whole app - do not duplicate this logic.
 */
const SLOT_MINUTES = 60;

function expandTimeRange(timeRange, slotMinutes = SLOT_MINUTES) {
  const [startTime, endTime] = timeRange.split('-');
  const parseTime = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const formatTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };
  const startMinutes = parseTime(startTime);
  const endMinutes = parseTime(endTime);
  const slots = [];
  for (let t = startMinutes; t < endMinutes; t += slotMinutes) {
    slots.push(`${formatTime(t)}-${formatTime(t + slotMinutes)}`);
  }
  return slots;
}

/**
 * Single source of truth for "what slots is this doctor bookable for on
 * this date". Used by BOTH the public doctor-facing endpoint and the
 * patient-facing endpoint so they can never disagree again.
 *
 * Previously doctors.js generated 60-minute slots and patients.js generated
 * 30-minute slots from the same availability data. Because booked slots are
 * matched by exact string equality (e.g. "10:00-10:30" vs "10:00-11:00"),
 * that mismatch meant a slot booked through one endpoint's format was not
 * recognized as taken by the other - a real double-booking vector.
 *
 * @param {string} doctorUserId - the doctor's User._id
 * @param {string} dateInput - requested date
 * @returns {Promise<{doctor: object|null, availableSlots: string[]}>}
 */
async function getAvailableSlotsForDate(doctorUserId, dateInput) {
  const doctor = await Doctor.findOne({ userId: doctorUserId });
  if (!doctor) return { doctor: null, availableSlots: [] };

  const dateObj = normalizeDateToUTC(dateInput);
  const dayName = DAY_NAMES[dateObj.getUTCDay()]; // UTC-safe, not local getDay()

  const dayAvailability = (doctor.availability || []).find(
    (av) => (av.day || '').toLowerCase() === dayName.toLowerCase()
  );

  if (!dayAvailability || !dayAvailability.slots) {
    return { doctor, availableSlots: [] };
  }

  const allSlots = [];
  dayAvailability.slots.forEach((range) => {
    allSlots.push(...expandTimeRange(range));
  });

  const bookedAppointments = await Appointment.find({
    doctorId: doctorUserId,
    date: dateObj,
    status: 'Scheduled',
  }).select('timeSlot');

  const bookedSlots = new Set(bookedAppointments.map((a) => a.timeSlot));
  const availableSlots = allSlots.filter((slot) => !bookedSlots.has(slot));

  return { doctor, availableSlots };
}

/**
 * Validates a booking request BEFORE an Appointment is ever created.
 *
 * SECURITY / DOMAIN: neither controllers/patients.js:bookAppointment nor
 * controllers/mockPayments.js:verifyMockPayment previously checked (a) that
 * the doctor's KYC verificationStatus is 'Approved', or (b) that the
 * requested timeSlot actually falls within the doctor's declared
 * availability. The doctor directory (getDoctors) filters to Approved
 * doctors, but that is a UI convenience only - the booking endpoints
 * themselves accepted ANY doctorId/date/timeSlot as long as the exact slot
 * string wasn't already taken, so a client that already knows a doctorId
 * (e.g. from a prior page, a script, or brute-forcing ObjectIds) could book
 * a Pending/Submitted/Rejected doctor, or book a slot the doctor never
 * offered (e.g. 3am), and have it treated as a normal paid appointment.
 *
 * @returns {Promise<{ok: true, doctor: object} | {ok: false, status: number, message: string}>}
 */
async function validateBookingRequest(doctorUserId, dateInput, timeSlot) {
  const doctor = await Doctor.findOne({ userId: doctorUserId });
  if (!doctor) {
    return { ok: false, status: 404, message: 'Doctor not found' };
  }
  if (doctor.verificationStatus !== 'Approved') {
    return {
      ok: false,
      status: 400,
      message: 'This doctor has not completed verification and cannot be booked yet',
    };
  }
  if (!timeSlot || typeof timeSlot !== 'string') {
    return { ok: false, status: 400, message: 'A valid time slot is required' };
  }

  const { availableSlots } = await getAvailableSlotsForDate(doctorUserId, dateInput);
  if (!availableSlots.includes(timeSlot)) {
    return {
      ok: false,
      status: 400,
      message: 'Selected time slot is not available',
    };
  }

  return { ok: true, doctor };
}

module.exports = {
  normalizeDateToUTC,
  expandTimeRange,
  getAvailableSlotsForDate,
  validateBookingRequest,
  DAY_NAMES,
  SLOT_MINUTES,
};
