import { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiUser, FiFileText, FiStar, FiCheck } from 'react-icons/fi';
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

  const columns = [
    { label: 'Date & Time', icon: <FiCalendar className="w-4 h-4 text-blue-500" /> },
    { label: 'Doctor', icon: <FiUser className="w-4 h-4 text-teal-500" /> },
    { label: 'Status', icon: <FiCheck className="w-4 h-4 text-green-500" /> },
    { label: 'Notes', icon: <FiFileText className="w-4 h-4 text-orange-500" /> },
    { label: 'Rating', icon: <FiStar className="w-4 h-4 text-yellow-500" /> }
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
    </div>
  );
}