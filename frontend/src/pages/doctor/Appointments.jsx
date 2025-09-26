import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FiEdit2, FiCheckCircle, FiXCircle, FiClock, FiActivity } from 'react-icons/fi';
import { AppSelect } from '../../components/ui';

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
      const newStatus = payload.status;
      if (newStatus === 'Completed' || newStatus === 'Follow-up') {
        const appt = res.data?.data || list.find(a => a._id === id);
        navigate('/doctor/prescriptions/new', { state: { patientId: appt?.patientId?._id || appt?.patientId, appointmentId: id } });
      }
    } catch {
      alert('Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="text-center p-6">Loading appointments...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">My Appointments</h1>
      <div className="bg-white rounded-xl shadow-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-light-gray">
            <tr>
              <th className="text-left p-4 font-semibold text-text-primary">Date & Time</th>
              <th className="text-left p-4 font-semibold text-text-primary">Patient</th>
              <th className="text-left p-4 font-semibold text-text-primary">Status</th>
              <th className="text-left p-4 font-semibold text-text-primary">Notes</th>
              <th className="text-left p-4 font-semibold text-text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a._id} className="border-t border-slate-200 align-top">
                <td className="p-4">
                  <div className="font-medium text-text-primary">{new Date(a.date).toLocaleDateString()}</div>
                  <div className="text-text-secondary">{a.timeSlot}</div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-text-primary">{a.patientId?.name}</div>
                  <div className="text-text-secondary text-xs">{a.patientId?.email}</div>
                </td>
                <td className="p-4">
                  <AppSelect
                    value={a.status}
                    onChange={(value) => updateAppt(a._id, { status: value })}
                    options={[
                      { value: 'Scheduled', label: 'Scheduled' },
                      { value: 'Completed', label: 'Completed' },
                      { value: 'Cancelled', label: 'Cancelled' },
                      { value: 'Follow-up', label: 'Follow-up' }
                    ]}
                    icon={FiActivity}
                    disabled={updatingId === a._id}
                    size="sm"
                    className="min-w-[120px]"
                  />
                </td>
                <td className="p-4" style={{minWidth: 220}}>
                  <textarea
                    rows={2}
                    defaultValue={a.notes || ''}
                    onBlur={(e) => e.target.value !== a.notes && updateAppt(a._id, { notes: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 ease-in-out resize-none"
                    placeholder="Add notes…"
                    disabled={updatingId === a._id}
                  />
                </td>
                <td className="p-4 space-x-2 whitespace-nowrap">
                  {a.status === 'Scheduled' && (
                    <>
                      <button
                        className="inline-flex items-center px-3 py-1 rounded-md bg-green-100 text-green-800 text-xs font-medium hover:bg-green-200 disabled:opacity-50"
                        disabled={updatingId === a._id}
                        onClick={() => updateAppt(a._id, { status: 'Completed' })}
                      >
                        <FiCheckCircle className="mr-1.5"/>
                        Complete
                      </button>
                      <button
                        className="inline-flex items-center px-3 py-1 rounded-md bg-yellow-100 text-yellow-800 text-xs font-medium hover:bg-yellow-200 disabled:opacity-50"
                        disabled={updatingId === a._id}
                        onClick={() => navigate('/doctor/follow-up', { state: { appointment: a } })}
                      >
                        <FiClock className="mr-1.5"/>
                        Follow-up
                      </button>
                    </>
                  )}
                  {updatingId === a._id ? <span className="text-text-secondary text-xs">Saving…</span> : null}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td className="p-4 text-center text-text-secondary" colSpan="6">No appointments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}