const Appointment = require('../models/Appointment');

/**
 * Verifies a doctor has a legitimate care relationship with a patient before
 * granting access to that patient's clinical data (medical history, patient
 * file, etc). A relationship is established by the existence of any
 * appointment (any status, past or present) between the two.
 *
 * SECURITY: This closes a PHI-exposure gap where any authenticated doctor
 * could read or edit ANY patient's record by guessing/enumerating a
 * patientId, because the route layer only checked role ('doctor'), never
 * the doctor-patient relationship. Admins should bypass this check at the
 * call site (oversight role) rather than being special-cased here.
 *
 * @param {string|import('mongoose').Types.ObjectId} doctorId - User._id of the doctor
 * @param {string|import('mongoose').Types.ObjectId} patientId - User._id of the patient
 * @returns {Promise<boolean>}
 */
async function hasCareRelationship(doctorId, patientId) {
  if (!doctorId || !patientId) return false;
  const appointment = await Appointment.exists({ doctorId, patientId });
  return Boolean(appointment);
}

module.exports = { hasCareRelationship };
