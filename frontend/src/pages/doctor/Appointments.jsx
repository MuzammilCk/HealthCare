import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function DoctorAppointments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

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
      await api.put(`/doctors/appointments/${id}`, payload);
      await load();
    } catch {
      alert('Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Appointments</h1>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Time</th>
              <th className="text-left p-3">Patient</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Notes</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a._id} className="border-t align-top">
                <td className="p-3">{new Date(a.date).toLocaleDateString()}</td>
                <td className="p-3">{a.timeSlot}</td>
                <td className="p-3">{a.patientId?.name} <div className="text-xs text-gray-500">{a.patientId?.email}</div></td>
                <td className="p-3">
                  <select
                    disabled={updatingId === a._id}
                    value={a.status}
                    onChange={(e) => updateAppt(a._id, { status: e.target.value })}
                    className="border rounded px-2 py-1"
                  >
                    <option>Scheduled</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </td>
                <td className="p-3" style={{minWidth: 220}}>
                  <textarea
                    rows={2}
                    defaultValue={a.notes || ''}
                    onBlur={(e) => e.target.value !== a.notes && updateAppt(a._id, { notes: e.target.value })}
                    className="w-full border rounded px-2 py-1"
                    placeholder="Add notes…"
                    disabled={updatingId === a._id}
                  />
                </td>
                <td className="p-3">
                  {updatingId === a._id ? 'Saving…' : ''}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td className="p-3" colSpan="6">No appointments.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
