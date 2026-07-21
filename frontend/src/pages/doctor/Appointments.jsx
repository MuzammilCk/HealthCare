import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  User,
  Activity,
  FileText,
  CheckCircle2,
  Clock,
  Pencil,
  DollarSign,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
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
import Reveal from '../../components/Reveal';

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
    { label: 'Date & Time', icon: <Calendar className="h-4 w-4 text-brand-cyan-fg" /> },
    { label: 'Patient', icon: <User className="h-4 w-4 text-brand-teal" /> },
    { label: 'Status', icon: <Activity className="h-4 w-4 text-success-fg" /> },
    { label: 'Notes', icon: <FileText className="h-4 w-4 text-amber-500" /> },
    { label: 'Actions', icon: <Pencil className="h-4 w-4 text-brand-violet" /> }
  ];

  if (loading) {
    return (
      <div className="space-y-6 bg-background text-foreground">
        <div>
          <h1 className="mb-2 font-head text-3xl font-bold tracking-tight text-foreground">My Appointments</h1>
          <p className="text-muted-foreground">Manage your patient appointments and consultations</p>
        </div>
        <div className="hidden md:block">
          <ModernTableContainer>
            <AppointmentSkeleton count={5} />
          </ModernTableContainer>
        </div>
        <div className="space-y-4 md:hidden">
          <AppointmentSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background text-foreground">
      <Reveal>
        <div>
          <h1 className="mb-2 font-head text-3xl font-bold tracking-tight text-foreground">My Appointments</h1>
          <p className="text-muted-foreground">Manage your patient appointments and consultations</p>
        </div>
      </Reveal>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <ModernTableContainer
          title="Appointment Schedule"
          subtitle={`${list.length} appointment${list.length !== 1 ? 's' : ''} found`}
        >
          {list.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-8 w-8 text-muted-foreground" />}
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
                          <div className="font-medium text-foreground">
                            {appointment.patientId?.name || 'Unknown Patient'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.patientId?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </ModernTableCell>

                    <ModernTableCell>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={appointment.status} type="appointment" />
                        {updatingId === appointment._id && (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-cyan/40 border-t-brand-cyan"></div>
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
                          className="w-full resize-none rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan hover:bg-foreground/5"
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
                              icon={<CheckCircle2 className="h-3 w-3" />}
                              onClick={() => updateAppt(appointment._id, { status: 'Completed' })}
                              disabled={updatingId === appointment._id || isFutureAppointment(appointment)}
                              title={isFutureAppointment(appointment) ? "Cannot complete future appointments" : "Mark as completed"}
                            >
                              Complete
                            </ActionButton>
                            <ActionButton
                              variant="warning"
                              size="xs"
                              icon={<Clock className="h-3 w-3" />}
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
                                icon={<FileText className="h-3 w-3" />}
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
                                icon={<FileText className="h-3 w-3" />}
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
                                className="bg-success hover:brightness-110"
                              >
                                View Prescription
                              </ActionButton>
                            )}
                            {appointment.finalBillGenerated && (
                              <ActionButton
                                variant="info"
                                size="xs"
                                icon={<DollarSign className="h-3 w-3" />}
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
      <div className="space-y-4 lg:hidden">
        {list.length === 0 ? (
          <MobileCard>
            <EmptyState
              icon={<Calendar className="h-8 w-8 text-muted-foreground" />}
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
                      <h3 className="font-semibold text-foreground">
                        {appointment.patientId?.name || 'Unknown Patient'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
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
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-cyan/40 border-t-brand-cyan"></div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</label>
                  <textarea
                    rows={3}
                    defaultValue={appointment.notes || ''}
                    onBlur={(e) => {
                      if (e.target.value !== appointment.notes) {
                        updateAppt(appointment._id, { notes: e.target.value });
                      }
                    }}
                    className="mt-1 w-full resize-none rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan"
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
                        icon={<CheckCircle2 className="h-4 w-4" />}
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
                        icon={<Clock className="h-4 w-4" />}
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
                          icon={<FileText className="h-4 w-4" />}
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
                          icon={<FileText className="h-4 w-4" />}
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
                          className="flex-1 justify-center bg-success hover:brightness-110"
                        >
                          View Prescription
                        </ActionButton>
                      )}
                      {appointment.finalBillGenerated && (
                        <ActionButton
                          variant="info"
                          size="sm"
                          icon={<DollarSign className="h-4 w-4" />}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass w-full max-w-md rounded-xl p-6 shadow-glow">
            <h3 className="mb-4 font-head text-xl font-bold text-foreground">Reject Appointment</h3>
            <p className="mb-4 text-muted-foreground">
              Please provide a reason for rejecting this appointment. The patient will be notified.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full resize-none rounded-lg border border-border bg-background/60 px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-error/30 focus:border-error"
              rows={4}
              placeholder="e.g., Emergency surgery scheduled, Personal emergency, etc."
            />
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedAppointment(null);
                }}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-foreground transition-colors hover:bg-foreground/5"
                disabled={updatingId}
              >
                Cancel
              </button>
              <button
                onClick={rejectAppointment}
                className="flex-1 rounded-lg bg-error px-4 py-2 text-white transition-colors hover:brightness-110 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass w-full max-w-md rounded-xl p-6 shadow-glow">
            <h3 className="mb-4 font-head text-xl font-bold text-foreground">Reschedule Appointment</h3>
            <p className="mb-4 text-muted-foreground">
              Select a new date and time for this appointment. The patient will be notified.
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">New Date</label>
                <input
                  type="date"
                  value={rescheduleData.newDate}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background/60 px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">New Time Slot</label>
                <input
                  type="text"
                  value={rescheduleData.newTimeSlot}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newTimeSlot: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background/60 px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan"
                  placeholder="e.g., 09:00-10:00"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Reason (Optional)</label>
                <textarea
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  className="w-full resize-none rounded-lg border border-border bg-background/60 px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan"
                  rows={3}
                  placeholder="Reason for rescheduling..."
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleData({ newDate: '', newTimeSlot: '', reason: '' });
                  setSelectedAppointment(null);
                }}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-foreground transition-colors hover:bg-foreground/5"
                disabled={updatingId}
              >
                Cancel
              </button>
              <button
                onClick={rescheduleAppointment}
                className="flex-1 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-teal px-4 py-2 text-white shadow-glow transition-colors hover:brightness-110 disabled:opacity-50"
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
