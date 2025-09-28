import { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiUser, FiFileText, FiStar, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';
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

  // Handle actual cancellation
  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    
    setCancellingId(appointmentToCancel._id);
    try {
      await api.delete(`/patients/appointments/${appointmentToCancel._id}`);
      setList(prev => prev.map(x => 
        x._id === appointmentToCancel._id 
          ? { ...x, status: 'Cancelled' } 
          : x
      ));
      toast.success('Appointment cancelled successfully!');
      setShowCancelModal(false);
      setAppointmentToCancel(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  };

  const columns = [
    { label: 'Date & Time', icon: <FiCalendar className="w-4 h-4 text-blue-500" /> },
    { label: 'Doctor', icon: <FiUser className="w-4 h-4 text-teal-500" /> },
    { label: 'Status', icon: <FiCheck className="w-4 h-4 text-green-500" /> },
    { label: 'Notes', icon: <FiFileText className="w-4 h-4 text-orange-500" /> },
    { label: 'Rating', icon: <FiStar className="w-4 h-4 text-yellow-500" /> },
    { label: 'Actions', icon: <FiX className="w-4 h-4 text-red-500" /> }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Track and manage your medical appointments</p>
        </div>
        <ModernTableContainer>
          <LoadingState rows={5} />
        </ModernTableContainer>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
        <p className="text-gray-600">Track and manage your medical appointments</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <ModernTableContainer
          title="Appointment History"
          subtitle={`${list.length} appointment${list.length !== 1 ? 's' : ''} found`}
        >
          {list.length === 0 ? (
            <EmptyState
              icon={<FiCalendar className="w-8 h-8 text-gray-400" />}
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
                          <div className="font-medium text-gray-900">
                            {appointment.doctorId?.name || 'Unknown Doctor'}
                          </div>
                          <div className="text-sm text-gray-500">Doctor</div>
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
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                              <FiCheck className="w-3 h-3" />
                              Rated
                            </span>
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
                                icon={<FiCheck className="w-3 h-3" />}
                                onClick={() => handleRating(appointment._id, ratingInputs[appointment._id])}
                                disabled={submittingId === appointment._id}
                              >
                                {submittingId === appointment._id ? 'Submitting...' : 'Submit'}
                              </ActionButton>
                            )}
                          </div>
                        )
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
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
                                  icon={<FiX className="w-3 h-3" />}
                                  onClick={() => handleCancelRequest(appointment)}
                                  disabled={cancellingId === appointment._id}
                                  className="w-full"
                                >
                                  {cancellingId === appointment._id ? 'Cancelling...' : 'Cancel Appointment'}
                                </ActionButton>
                                <div className="text-xs text-green-600 font-medium text-center">
                                  {cancelInfo.reason}
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <FiAlertTriangle className="w-3 h-3" />
                                  <span className="font-medium">Cannot Cancel</span>
                                </div>
                                <div className="text-xs text-gray-500 text-center">
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
              icon={<FiCalendar className="w-8 h-8 text-gray-400" />}
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
                      <h3 className="font-semibold text-gray-900">
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
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
                    <p className="mt-1 text-gray-700">{appointment.notes}</p>
                  </div>
                )}
                
                {appointment.status === 'Scheduled' && (() => {
                  const cancelInfo = getAppointmentCancellationInfo(appointment);
                  return (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</label>
                      <div className="mt-2">
                        {cancelInfo.canCancel ? (
                          <div className="space-y-2">
                            <ActionButton
                              variant="danger"
                              size="sm"
                              icon={<FiX className="w-4 h-4" />}
                              onClick={() => handleCancelRequest(appointment)}
                              disabled={cancellingId === appointment._id}
                              className="w-full justify-center"
                            >
                              {cancellingId === appointment._id ? 'Cancelling...' : 'Cancel Appointment'}
                            </ActionButton>
                            <div className="text-center">
                              <div className="text-sm text-green-600 font-medium">
                                {cancelInfo.reason}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <FiAlertTriangle className="w-5 h-5 text-amber-500" />
                              <span className="font-medium text-gray-700">Cannot Cancel</span>
                            </div>
                            <div className="text-sm text-gray-600">
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
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rating</label>
                    <div className="mt-2">
                      {appointment.isRated ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <FiCheck className="w-3 h-3" />
                          Rated
                        </span>
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
                              icon={<FiCheck className="w-4 h-4" />}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FiAlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel Appointment</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you sure you want to cancel your appointment with{' '}
                <span className="font-semibold">{appointmentToCancel.doctorId?.name}</span>?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    <span className="font-medium">{new Date(appointmentToCancel.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4" />
                    <span className="font-medium">{appointmentToCancel.timeSlot}</span>
                  </div>
                  {(() => {
                    const cancelInfo = getAppointmentCancellationInfo(appointmentToCancel);
                    return (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-300">
                        <FiClock className="w-4 h-4 text-blue-500" />
                        <span className="text-blue-600 font-medium">{cancelInfo.reason}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <FiAlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Important:</p>
                    <p>Once cancelled, this appointment slot will be available for other patients to book.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setAppointmentToCancel(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={cancellingId === appointmentToCancel._id}
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancelAppointment}
                disabled={cancellingId === appointmentToCancel._id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancellingId === appointmentToCancel._id ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}