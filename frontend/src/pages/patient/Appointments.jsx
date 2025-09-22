import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Appointments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

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
              <th className="text-left p-3">Doctor</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a._id} className="border-t">
                <td className="p-3">{new Date(a.date).toLocaleDateString()}</td>
                <td className="p-3">{a.timeSlot}</td>
                <td className="p-3">{a.doctorId?.name || '—'}</td>
                <td className="p-3">{a.status}</td>
                <td className="p-3">{a.notes || '—'}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td className="p-3" colSpan="5">No appointments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
