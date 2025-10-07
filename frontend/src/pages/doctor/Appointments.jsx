import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiUser, FiActivity, FiFileText, FiCheckCircle, FiClock, FiEdit3, FiDollarSign, FiXCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { AppSelect } from '../../components/ui';
import {
  ModernTableContainer,
  ModernTableHeader,
  ModernTableRow,
  ModernTableCell,
  StatusBadge,
  DateTimeDisplay,
  Avatar,
  ActionButton,
  EmptyState,
  LoadingState,
  MobileCard
} from '../../components/ui';
import { AppointmentSkeleton } from '../../components/ui/SkeletonLoader';

export default function DoctorAppointments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rescheduleData, setRescheduleData] = useState({ newDate: '', newTimeSlot: '', reason: '' });
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/doctors/appointments');
      setList(res.data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  
  const updateAppt = async (id, payload) => {
    setUpdatingId(id);
    try {
      const res = await api.put(`/doctors/appointments/${id}`, payload);
      await load();
      toast.success('Appointment updated successfully!');
      const newStatus = payload.status;
      if (newStatus === 'Completed') {
        const appt = res.data?.data || list.find(a => a._id === id);
        navigate('/doctor/prescriptions/new', { state: { patientId: appt?.patientId?._id || appt?.patientId, appointmentId: id } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update appointment.');
    } finally {
      setUpdatingId(null);
    }
  };

  const markAsMissed = async (id) => {
    if (!confirm('Are you sure you want to mark this appointment as missed? This will be recorded in the patient\'s file.')) {
      return;
    }
    setUpdatingId(id);
    try {
      await api.post(`/doctors/appointments/${id}/mark-missed`);
      await load();
      toast.success('Appointment marked as missed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark appointment as missed');
    } finally {
      setUpdatingId(null);
    }
  };

  const rejectAppointment = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setUpdatingId(selectedAppointment._id);
    try {
      await api.post(`/doctors/appointments/${selectedAppointment._id}/reject`, { reason: rejectionReason });
      await load();
      toast.success('Appointment rejected successfully');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedAppointment(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  const rescheduleAppointment = async () => {
    if (!rescheduleData.newDate || !rescheduleData.newTimeSlot) {
      toast.error('Please select a new date and time slot');
      return;
    }
    setUpdatingId(selectedAppointment._id);
    try {
      await api.put(`/doctors/appointments/${selectedAppointment._id}/reschedule`, rescheduleData);
      await load();
      toast.success('Appointment rescheduled successfully');
      setShowRescheduleModal(false);
      setRescheduleData({ newDate: '', newTimeSlot: '', reason: '' });
      setSelectedAppointment(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper: an appointment should be considered "future" only if its START time is still ahead
  const isFutureAppointment = (appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.date);

    if (appointment.timeSlot) {
      // Use slot START time (HH:MM-HH:MM)
      const startTimeString = appointment.timeSlot.split('-')[0];
      const [hours, minutes] = startTimeString.split(':').map(Number);

      const start = new Date(appointmentDate);
      start.setHours(hours, minutes, 0, 0);
      return start > now; // only disable if start is in the future
    }

    // If no timeSlot, future if the day is after today
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate > new Date(new Date().setHours(0, 0, 0, 0));
  };

  const columns = [
    { label: 'Date & Time', icon: <FiCalendar className="w-4 h-4 text-blue-500" /> },
    { label: 'Patient', icon: <FiUser className="w-4 h-4 text-teal-500" /> },
    { label: 'Status', icon: <FiActivity className="w-4 h-4 text-green-500" /> },
    { label: 'Notes', icon: <FiFileText className="w-4 h-4 text-orange-500" /> },
    { label: 'Actions', icon: <FiEdit3 className="w-4 h-4 text-purple-500" /> }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary-dark mb-2">My Appointments</h1>
          <p className="text-gray-600 dark:text-text-secondary-dark">Manage your patient appointments and consultations</p>
        </div>
        <div className="hidden md:block">
          <ModernTableContainer>
            <AppointmentSkeleton count={5} />
          </ModernTableContainer>
        </div>
        <div className="md:hidden space-y-4">
          <AppointmentSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary-dark mb-2">My Appointments</h1>
        <p className="text-gray-600 dark:text-text-secondary-dark">Manage your patient appointments and consultations</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <ModernTableContainer
          title="Appointment Schedule"
          subtitle={`${list.length} appointment${list.length !== 1 ? 's' : ''} found`}
        >
          {list.length === 0 ? (
            <EmptyState
              icon={<FiCalendar className="w-8 h-8 text-gray-400" />}
              title="No Appointments Scheduled"
              description="You don't have any appointments yet. They will appear here when patients book with you."
            />
          ) : (
            <table className="min-w-full">
              <ModernTableHeader columns={columns} />
              <tbody>
                {list.map((appointment, index) => (
                  <ModernTableRow key={appointment._id} isEven={index % 2 === 0}>
                    <ModernTableCell>
                      <DateTimeDisplay 
                        date={appointment.date} 
                        time={appointment.timeSlot}
                      />
                    </ModernTableCell>
                    
                    <ModernTableCell>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          name={appointment.patientId?.name || 'Unknown Patient'} 
                          size="sm"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {appointment.patientId?.name || 'Unknown Patient'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patientId?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </ModernTableCell>
                    
                    <ModernTableCell>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={appointment.status} type="appointment" />
                        {updatingId === appointment._id && (
                          <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                        )}
                      </div>
                    </ModernTableCell>
                    
                    <ModernTableCell className="max-w-xs">
                      <div className="relative">
                        <textarea
                          rows={2}
                          defaultValue={appointment.notes || ''}
                          onBlur={(e) => {
                            if (e.target.value !== appointment.notes) {
                              updateAppt(appointment._id, { notes: e.target.value });
                            }
                          }}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 ease-in-out resize-none hover:bg-white"
                          placeholder="Add notes for this appointment..."
                          disabled={updatingId === appointment._id}
                        />
                      </div>
                    </ModernTableCell>
                    
                    <ModernTableCell>
                      <div className="flex items-center gap-2">
                        {appointment.status === 'Scheduled' && (
                          <>
                            <ActionButton
                              variant="success"
                              size="xs"
                              icon={<FiCheckCircle className="w-3 h-3" />}
                              onClick={() => updateAppt(appointment._id, { status: 'Completed' })}
                              disabled={updatingId === appointment._id || isFutureAppointment(appointment)}
                              title={isFutureAppointment(appointment) ? "Cannot complete future appointments" : "Mark as completed"}
                            >
                              Complete
                            </ActionButton>
                            <ActionButton
                              variant="warning"
                              size="xs"
                              icon={<FiClock className="w-3 h-3" />}
                              onClick={() => navigate('/doctor/follow-up', { state: { appointment } })}
                              disabled={updatingId === appointment._id || isFutureAppointment(appointment)}
                              title={isFutureAppointment(appointment) ? "Cannot schedule follow-up for future appointments" : "Schedule follow-up"}
                            >
                              Follow-up
                            </ActionButton>
                          </>
                        )}
                        {appointment.status === 'Completed' && (
                          <>
                            {!appointment.prescriptionGenerated ? (
                              <ActionButton
                                variant="primary"
                                size="xs"
                                icon={<FiFileText className="w-3 h-3" />}
                                onClick={() => navigate('/doctor/prescriptions/new', { 
                                  state: { 
                                    patientId: appointment.patientId?._id, 
                                    appointmentId: appointment._id 
                                  } 
                                })}
                              >
                                Prescribe
                              </ActionButton>
                            ) : (
                              <ActionButton
                                variant="success"
                                size="xs"
                                icon={<FiFileText className="w-3 h-3" />}
                                onClick={async () => {
                                  try {
                                    const res = await api.get('/doctors/prescriptions', { 
                                      params: { appointmentId: appointment._id } 
                                    });
                                    if (res.data.data && res.data.data.length > 0) {
                                      navigate(`/doctor/prescriptions/${res.data.data[0]._id}`);
                                    }
                                  } catch (err) {
                                    toast.error('Failed to load prescription');
                                  }
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                View Prescription
                              </ActionButton>
                            )}
                            {appointment.finalBillGenerated && (
                              <ActionButton
                                variant="info"
                                size="xs"
                                icon={<FiDollarSign className="w-3 h-3" />}
                                onClick={async () => {
                                  try {
                                    const res = await api.get('/bills/doctor', { 
                                      params: { appointmentId: appointment._id } 
                                    });
                                    if (res.data.data && res.data.data.length > 0) {
                                      navigate(`/doctor/bills/${res.data.data[0]._id}`);
                                    } else {
                                      toast.error('Bill not found');
                                    }
                                  } catch (err) {
                                    toast.error('Failed to load bill');
                                  }
                                }}
                              >
                                View Bill
                              </ActionButton>
                            )}
                          </>
                        )}
                      </div>
                    </ModernTableCell>
                  </ModernTableRow>
                ))}
              </tbody>
            </table>
          )}
        </ModernTableContainer>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {list.length === 0 ? (
          <MobileCard>
            <EmptyState
              icon={<FiCalendar className="w-8 h-8 text-gray-400" />}
              title="No Appointments Scheduled"
              description="You don't have any appointments yet."
            />
          </MobileCard>
        ) : (
          list.map((appointment) => (
            <MobileCard key={appointment._id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      name={appointment.patientId?.name || 'Unknown Patient'} 
                      size="md"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.patientId?.name || 'Unknown Patient'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {appointment.patientId?.email || 'No email'}
                      </p>
                      <DateTimeDisplay 
                        date={appointment.date} 
                        time={appointment.timeSlot}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={appointment.status} type="appointment" />
                    {updatingId === appointment._id && (
                      <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
                  <textarea
                    rows={3}
                    defaultValue={appointment.notes || ''}
                    onBlur={(e) => {
                      if (e.target.value !== appointment.notes) {
                        updateAppt(appointment._id, { notes: e.target.value });
                      }
                    }}
                    className="mt-1 w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 ease-in-out resize-none"
                    placeholder="Add notes for this appointment..."
                    disabled={updatingId === appointment._id}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {appointment.status === 'Scheduled' && (
                    <>
                      <ActionButton
                        variant="success"
                        size="sm"
                        icon={<FiCheckCircle className="w-4 h-4" />}
                        onClick={() => updateAppt(appointment._id, { status: 'Completed' })}
                        disabled={updatingId === appointment._id || isFutureAppointment(appointment)}
                        title={isFutureAppointment(appointment) ? "Cannot complete future appointments" : "Mark as completed"}
                        className="flex-1"
                      >
                        Mark Complete
                      </ActionButton>
                      <ActionButton
                        variant="warning"
                        size="sm"
                        icon={<FiClock className="w-4 h-4" />}
                        onClick={() => navigate('/doctor/follow-up', { state: { appointment } })}
                        disabled={updatingId === appointment._id || isFutureAppointment(appointment)}
                        title={isFutureAppointment(appointment) ? "Cannot schedule follow-up for future appointments" : "Schedule follow-up"}
                        className="flex-1"
                      >
                        Schedule Follow-up
                      </ActionButton>
                    </>
                  )}
                  {appointment.status === 'Completed' && (
                    <>
                      {!appointment.prescriptionGenerated ? (
                        <ActionButton
                          variant="primary"
                          size="sm"
                          icon={<FiFileText className="w-4 h-4" />}
                          onClick={() => navigate('/doctor/prescriptions/new', { 
                            state: { 
                              patientId: appointment.patientId?._id, 
                              appointmentId: appointment._id 
                            } 
                          })}
                          className="flex-1 justify-center"
                        >
                          Prescribe
                        </ActionButton>
                      ) : (
                        <ActionButton
                          variant="success"
                          size="sm"
                          icon={<FiFileText className="w-4 h-4" />}
                          onClick={async () => {
                            try {
                              const res = await api.get('/doctors/prescriptions', { 
                                params: { appointmentId: appointment._id } 
                              });
                              if (res.data.data && res.data.data.length > 0) {
                                navigate(`/doctor/prescriptions/${res.data.data[0]._id}`);
                              }
                            } catch (err) {
                              toast.error('Failed to load prescription');
                            }
                          }}
                          className="flex-1 justify-center bg-green-600 hover:bg-green-700"
                        >
                          View Prescription
                        </ActionButton>
                      )}
                      {appointment.finalBillGenerated && (
                        <ActionButton
                          variant="info"
                          size="sm"
                          icon={<FiDollarSign className="w-4 h-4" />}
                          onClick={async () => {
                            try {
                              const res = await api.get('/bills/doctor', { 
                                params: { appointmentId: appointment._id } 
                              });
                              if (res.data.data && res.data.data.length > 0) {
                                navigate(`/doctor/bills/${res.data.data[0]._id}`);
                              } else {
                                toast.error('Bill not found');
                              }
                            } catch (err) {
                              toast.error('Failed to load bill');
                            }
                          }}
                          className="flex-1 justify-center"
                        >
                          View Bill
                        </ActionButton>
                      )}
                    </>
                  )}
                </div>
              </div>
            </MobileCard>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-bg-card-dark rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-text-primary-dark mb-4">Reject Appointment</h3>
            <p className="text-gray-600 dark:text-text-secondary-dark mb-4">
              Please provide a reason for rejecting this appointment. The patient will be notified.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
              rows={4}
              placeholder="e.g., Emergency surgery scheduled, Personal emergency, etc."
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedAppointment(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={updatingId}
              >
                Cancel
              </button>
              <button
                onClick={rejectAppointment}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={updatingId || !rejectionReason.trim()}
              >
                {updatingId ? 'Rejecting...' : 'Reject Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-bg-card-dark rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-text-primary-dark mb-4">Reschedule Appointment</h3>
            <p className="text-gray-600 dark:text-text-secondary-dark mb-4">
              Select a new date and time for this appointment. The patient will be notified.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                <input
                  type="date"
                  value={rescheduleData.newDate}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Time Slot</label>
                <input
                  type="text"
                  value={rescheduleData.newTimeSlot}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newTimeSlot: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g., 09:00-10:00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                <textarea
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="Reason for rescheduling..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleData({ newDate: '', newTimeSlot: '', reason: '' });
                  setSelectedAppointment(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={updatingId}
              >
                Cancel
              </button>
              <button
                onClick={rescheduleAppointment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={updatingId || !rescheduleData.newDate || !rescheduleData.newTimeSlot}
              >
                {updatingId ? 'Rescheduling...' : 'Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}