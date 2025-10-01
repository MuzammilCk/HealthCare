import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiUser, FiActivity, FiFileText, FiCheckCircle, FiClock, FiEdit3, FiDollarSign } from 'react-icons/fi';
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

export default function DoctorAppointments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
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
      if (newStatus === 'Completed' || newStatus === 'Follow-up') {
        const appt = res.data?.data || list.find(a => a._id === id);
        navigate('/doctor/prescriptions/new', { state: { patientId: appt?.patientId?._id || appt?.patientId, appointmentId: id } });
      }
    } catch {
      toast.error('Failed to update appointment.');
    } finally {
      setUpdatingId(null);
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage your patient appointments and consultations</p>
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
        <p className="text-gray-600">Manage your patient appointments and consultations</p>
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
                              disabled={updatingId === appointment._id}
                            >
                              Complete
                            </ActionButton>
                            <ActionButton
                              variant="warning"
                              size="xs"
                              icon={<FiClock className="w-3 h-3" />}
                              onClick={() => navigate('/doctor/follow-up', { state: { appointment } })}
                              disabled={updatingId === appointment._id}
                            >
                              Follow-up
                            </ActionButton>
                          </>
                        )}
                        {appointment.status === 'Completed' && (
                          <>
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
                              Prescription
                            </ActionButton>
                            <ActionButton
                              variant="success"
                              size="xs"
                              icon={<FiDollarSign className="w-3 h-3" />}
                              onClick={() => navigate('/doctor/generate-bill', { 
                                state: { appointment } 
                              })}
                            >
                              Bill
                            </ActionButton>
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
                        disabled={updatingId === appointment._id}
                        className="flex-1"
                      >
                        Mark Complete
                      </ActionButton>
                      <ActionButton
                        variant="warning"
                        size="sm"
                        icon={<FiClock className="w-4 h-4" />}
                        onClick={() => navigate('/doctor/follow-up', { state: { appointment } })}
                        disabled={updatingId === appointment._id}
                        className="flex-1"
                      >
                        Schedule Follow-up
                      </ActionButton>
                    </>
                  )}
                  {appointment.status === 'Completed' && (
                    <>
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
                        Prescription
                      </ActionButton>
                      <ActionButton
                        variant="success"
                        size="sm"
                        icon={<FiDollarSign className="w-4 h-4" />}
                        onClick={() => navigate('/doctor/generate-bill', { 
                          state: { appointment } 
                        })}
                        className="flex-1 justify-center"
                      >
                        Generate Bill
                      </ActionButton>
                    </>
                  )}
                </div>
              </div>
            </MobileCard>
          ))
        )}
      </div>
    </div>
  );
}