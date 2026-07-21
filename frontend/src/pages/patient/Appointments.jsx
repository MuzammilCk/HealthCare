import { useEffect, useState } from 'react';
import { Calendar, Clock, User, FileText, Star, Check, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import {
  ModernTableContainer,
  ModernTableHeader,
  ModernTableRow,
  ModernTableCell,
  StatusBadge,
  StarRating,
  DateTimeDisplay,
  Avatar,
  ExpandableText,
  ActionButton,
  EmptyState,
  LoadingState,
  MobileCard
} from '../../components/ui';
import { Badge, Button } from '../../components/ui';
import { AppointmentSkeleton, PageSkeleton } from '../../components/ui/SkeletonLoader';
import { usePageLoading } from '../../hooks/useLoading';

export default function Appointments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingInputs, setRatingInputs] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/patients/appointments');
        setList(res.data.data);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRating = async (appointmentId, rating) => {
    setSubmittingId(appointmentId);
    try {
      await api.post(`/patients/appointments/${appointmentId}/rate`, { rating });
      setList(prev => prev.map(x => x._id === appointmentId ? { ...x, isRated: true } : x));
      toast.success('Rating submitted successfully!');
      setRatingInputs(prev => ({ ...prev, [appointmentId]: 0 }));
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmittingId(null);
    }
  };

  // Smart appointment cancellation logic with detailed time analysis
  const getAppointmentCancellationInfo = (appointment) => {
    if (appointment.status !== 'Scheduled') {
      return { canCancel: false, reason: 'Appointment is not scheduled', timeRemaining: null };
    }

    try {
      // Get current time
      const now = new Date();

      // Parse appointment date (handle both string and Date objects)
      let appointmentDate;
      if (typeof appointment.date === 'string') {
        // Handle YYYY-MM-DD format and ISO strings
        appointmentDate = appointment.date.includes('T')
          ? new Date(appointment.date)
          : new Date(appointment.date + 'T00:00:00');
      } else {
        appointmentDate = new Date(appointment.date);
      }

      // Validate the parsed date
      if (isNaN(appointmentDate.getTime())) {
        console.error('Invalid appointment date:', appointment.date);
        return {
          canCancel: false,
          reason: 'Invalid appointment date',
          timeRemaining: null
        };
      }

      // Parse time slot intelligently
      let timeSlot = appointment.timeSlot || '';

      let startTime = timeSlot;
      if (timeSlot.includes('-')) {
        startTime = timeSlot.split('-')[0].trim();
      }

      // Convert startTime to 24h hours/minutes robustly (supports "HH:mm", "HH:mm:ss", "HH:mm AM/PM", "HH AM/PM")
      const toHoursMinutes = (timeStr) => {
        if (!timeStr) return { hours: 0, minutes: 0 };
        let s = String(timeStr).trim();
        const hasAM = /\bAM\b/i.test(s);
        const hasPM = /\bPM\b/i.test(s);
        s = s.replace(/\bAM\b|\bPM\b/gi, '').trim();
        // If seconds are present, drop them
        const parts = s.split(':');
        let h = parseInt(parts[0], 10);
        let m = parts.length > 1 ? parseInt(parts[1], 10) : 0;
        if (Number.isNaN(h)) h = 0;
        if (Number.isNaN(m)) m = 0;
        if (hasPM && h < 12) h += 12;
        if (hasAM && h === 12) h = 0;
        return { hours: h, minutes: m };
      };

      // Normalize time format if missing minutes
      if (!startTime.includes(':')) startTime = startTime + ':00';
      const { hours, minutes } = toHoursMinutes(startTime);

      // Create full datetime for appointment
      const appointmentDateTime = new Date(appointmentDate);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      // Validate the final appointment datetime
      if (isNaN(appointmentDateTime.getTime())) {
        console.error('Invalid appointment datetime created:', { appointmentDate, hours, minutes });
        return {
          canCancel: false,
          reason: 'Invalid appointment time',
          timeRemaining: null
        };
      }

      // Calculate time difference
      const timeDiffMs = appointmentDateTime.getTime() - now.getTime();
      const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
      const timeDiffDays = timeDiffMs / (1000 * 60 * 60 * 24);

      // Determine cancellation eligibility and reason
      if (timeDiffMs < 0) {
        return {
          canCancel: false,
          reason: 'Appointment is in the past',
          timeRemaining: null
        };
      }

      if (timeDiffHours < 1) {
        const minutesRemaining = Math.max(0, Math.floor(timeDiffMs / (1000 * 60)));
        return {
          canCancel: false,
          reason: `Less than 1 hour remaining (${minutesRemaining} minutes)`,
          timeRemaining: minutesRemaining
        };
      }

      if (timeDiffHours < 24) {
        const hoursRemaining = Math.max(0, Math.floor(timeDiffHours));
        const minutesRemaining = Math.max(0, Math.floor((timeDiffHours - hoursRemaining) * 60));
        return {
          canCancel: true,
          reason: `Can cancel (${hoursRemaining}h ${minutesRemaining}m remaining)`,
          timeRemaining: timeDiffHours
        };
      }

      if (timeDiffDays < 7) {
        const daysRemaining = Math.max(0, Math.floor(timeDiffDays));
        const hoursRemaining = Math.max(0, Math.floor((timeDiffDays - daysRemaining) * 24));
        return {
          canCancel: true,
          reason: `Can cancel (${daysRemaining}d ${hoursRemaining}h remaining)`,
          timeRemaining: timeDiffDays
        };
      }

      return {
        canCancel: true,
        reason: `Can cancel (${Math.max(0, Math.floor(timeDiffDays))} days remaining)`,
        timeRemaining: timeDiffDays
      };

    } catch (error) {
      console.error('Error analyzing appointment cancellation:', error, {
        appointmentDate: appointment.date,
        timeSlot: appointment.timeSlot,
        status: appointment.status
      });
      return {
        canCancel: false,
        reason: 'Unable to determine cancellation eligibility',
        timeRemaining: null
      };
    }
  };

  // Backward compatibility function
  const canCancelAppointment = (appointment) => {
    return getAppointmentCancellationInfo(appointment).canCancel;
  };

  // Handle cancellation request
  const handleCancelRequest = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  // Handle actual cancellation with refund logic
  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    setCancellingId(appointmentToCancel._id);
    const loadingToast = toast.loading('Cancelling appointment...');

    try {
      const response = await api.post(`/patients/appointments/${appointmentToCancel._id}/cancel`);

      // Update appointment in list
      setList(prev => prev.map(x =>
        x._id === appointmentToCancel._id
          ? { ...x, status: response.data.refundEligible ? 'cancelled_refunded' : 'cancelled_no_refund' }
          : x
      ));

      toast.dismiss(loadingToast);

      // Show appropriate success message based on refund eligibility
      if (response.data.refundEligible) {
        const refundAmount = (response.data.refundAmount / 100).toFixed(2);
        toast.success(
          `Appointment cancelled successfully! ₹${refundAmount} (${response.data.refundPercentage}%) refund processed.`,
          { duration: 5000 }
        );
      } else {
        toast.success(response.data.message || 'Appointment cancelled successfully!');
      }

      setShowCancelModal(false);
      setAppointmentToCancel(null);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error?.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const columns = [
    { label: 'Date & Time', icon: <Calendar className="w-4 h-4 text-brand-cyan-fg" /> },
    { label: 'Doctor', icon: <User className="w-4 h-4 text-brand-teal" /> },
    { label: 'Status', icon: <Check className="w-4 h-4 text-success-fg" /> },
    { label: 'Notes', icon: <FileText className="w-4 h-4 text-amber-500" /> },
    { label: 'Rating', icon: <Star className="w-4 h-4 text-amber-500" /> },
    { label: 'Actions', icon: <X className="w-4 h-4 text-error-fg" /> }
  ];

  if (loading) {
    return (
      <div className="space-y-6 bg-background text-foreground">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Appointments</h1>
          <p className="text-muted-foreground">Track and manage your medical appointments</p>
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
    <div className="space-y-6 bg-background text-foreground">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Appointments</h1>
        <p className="text-muted-foreground">Track and manage your medical appointments</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <ModernTableContainer
          title="Appointment History"
          subtitle={`${list.length} appointment${list.length !== 1 ? 's' : ''} found`}
        >
          {list.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-8 h-8 text-muted-foreground" />}
              title="No Appointments Found"
              description="You don't have any appointments yet. Book your first appointment to get started."
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
                          name={appointment.doctorId?.name || 'Unknown Doctor'}
                          size="sm"
                        />
                        <div>
                          <div className="font-medium text-foreground">
                            {appointment.doctorId?.name || 'Unknown Doctor'}
                          </div>
                          <div className="text-sm text-muted-foreground">Doctor</div>
                        </div>
                      </div>
                    </ModernTableCell>

                    <ModernTableCell>
                      <StatusBadge status={appointment.status} type="appointment" />
                    </ModernTableCell>

                    <ModernTableCell className="max-w-xs">
                      <ExpandableText text={appointment.notes} maxLength={50} />
                    </ModernTableCell>

                    <ModernTableCell>
                      {appointment.status === 'Completed' ? (
                        appointment.isRated ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="success">
                              <Check className="w-3 h-3" />
                              Rated
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <StarRating
                              rating={ratingInputs[appointment._id] || 0}
                              interactive={true}
                              onRate={(rating) => setRatingInputs(prev => ({ ...prev, [appointment._id]: rating }))}
                              size="sm"
                            />
                            {ratingInputs[appointment._id] > 0 && (
                              <ActionButton
                                variant="success"
                                size="xs"
                                icon={<Check className="w-3 h-3" />}
                                onClick={() => handleRating(appointment._id, ratingInputs[appointment._id])}
                                disabled={submittingId === appointment._id}
                              >
                                {submittingId === appointment._id ? 'Submitting...' : 'Submit'}
                              </ActionButton>
                            )}
                          </div>
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </ModernTableCell>

                    <ModernTableCell>
                      {appointment.status === 'Scheduled' && (() => {
                        const cancelInfo = getAppointmentCancellationInfo(appointment);
                        return (
                          <div className="flex flex-col gap-2">
                            {cancelInfo.canCancel ? (
                              <div className="flex flex-col gap-1">
                                <ActionButton
                                  variant="danger"
                                  size="xs"
                                  icon={<X className="w-3 h-3" />}
                                  onClick={() => handleCancelRequest(appointment)}
                                  disabled={cancellingId === appointment._id}
                                  className="w-full"
                                >
                                  {cancellingId === appointment._id ? 'Cancelling...' : 'Cancel Appointment'}
                                </ActionButton>
                                <div className="text-xs text-success-fg font-medium text-center">
                                  {cancelInfo.reason}
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1 p-2 bg-foreground/5 rounded-lg">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span className="font-medium">Cannot Cancel</span>
                                </div>
                                <div className="text-xs text-muted-foreground text-center">
                                  {cancelInfo.reason}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </ModernTableCell>
                  </ModernTableRow>
                ))}
              </tbody>
            </table>
          )}
        </ModernTableContainer>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {list.length === 0 ? (
          <MobileCard>
            <EmptyState
              icon={<Calendar className="w-8 h-8 text-muted-foreground" />}
              title="No Appointments Found"
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
                      name={appointment.doctorId?.name || 'Unknown Doctor'}
                      size="md"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {appointment.doctorId?.name || 'Unknown Doctor'}
                      </h3>
                      <DateTimeDisplay
                        date={appointment.date}
                        time={appointment.timeSlot}
                      />
                    </div>
                  </div>
                  <StatusBadge status={appointment.status} type="appointment" />
                </div>

                {appointment.notes && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</label>
                    <p className="mt-1 text-foreground">{appointment.notes}</p>
                  </div>
                )}

                {appointment.status === 'Scheduled' && (() => {
                  const cancelInfo = getAppointmentCancellationInfo(appointment);
                  return (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</label>
                      <div className="mt-2">
                        {cancelInfo.canCancel ? (
                          <div className="space-y-2">
                            <ActionButton
                              variant="danger"
                              size="sm"
                              icon={<X className="w-4 h-4" />}
                              onClick={() => handleCancelRequest(appointment)}
                              disabled={cancellingId === appointment._id}
                              className="w-full justify-center"
                            >
                              {cancellingId === appointment._id ? 'Cancelling...' : 'Cancel Appointment'}
                            </ActionButton>
                            <div className="text-center">
                              <div className="text-sm text-success-fg font-medium">
                                {cancelInfo.reason}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-foreground/5 p-4 rounded-lg border border-border">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-5 h-5 text-amber-500" />
                              <span className="font-medium text-foreground">Cannot Cancel</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {cancelInfo.reason}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {appointment.status === 'Completed' && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rating</label>
                    <div className="mt-2">
                      {appointment.isRated ? (
                        <Badge variant="success">
                          <Check className="w-3 h-3" />
                          Rated
                        </Badge>
                      ) : (
                        <div className="space-y-2">
                          <StarRating
                            rating={ratingInputs[appointment._id] || 0}
                            interactive={true}
                            onRate={(rating) => setRatingInputs(prev => ({ ...prev, [appointment._id]: rating }))}
                            size="md"
                          />
                          {ratingInputs[appointment._id] > 0 && (
                            <ActionButton
                              variant="success"
                              size="sm"
                              icon={<Check className="w-4 h-4" />}
                              onClick={() => handleRating(appointment._id, ratingInputs[appointment._id])}
                              disabled={submittingId === appointment._id}
                              className="w-full justify-center"
                            >
                              {submittingId === appointment._id ? 'Submitting...' : 'Submit Rating'}
                            </ActionButton>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </MobileCard>
          ))
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && appointmentToCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass rounded-xl shadow-card border border-border w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-error/15 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-error-fg" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Cancel Appointment</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-foreground mb-3">
                Are you sure you want to cancel your appointment with{' '}
                <span className="font-semibold">{appointmentToCancel.doctorId?.name}</span>?
              </p>
              <div className="bg-foreground/5 p-4 rounded-lg border border-border">
                <div className="text-sm text-muted-foreground space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{new Date(appointmentToCancel.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{appointmentToCancel.timeSlot}</span>
                  </div>
                  {(() => {
                    const cancelInfo = getAppointmentCancellationInfo(appointmentToCancel);
                    return (
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Clock className="w-4 h-4 text-brand-cyan-fg" />
                        <span className="text-brand-cyan-fg font-medium">{cancelInfo.reason}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="mt-3 p-3 bg-amber-400/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-amber-600">Important:</p>
                    <p>Once cancelled, this appointment slot will be available for other patients to book.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCancelModal(false);
                  setAppointmentToCancel(null);
                }}
                disabled={cancellingId === appointmentToCancel._id}
                className="flex-1"
              >
                Keep Appointment
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelAppointment}
                disabled={cancellingId === appointmentToCancel._id}
                className="flex-1"
              >
                {cancellingId === appointmentToCancel._id ? 'Cancelling...' : 'Yes, Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
