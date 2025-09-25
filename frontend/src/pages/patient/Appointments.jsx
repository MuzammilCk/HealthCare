import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Appointments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingInputs, setRatingInputs] = useState({}); // { [appointmentId]: number }
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

  if (loading) return <div>Loading…</div>;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-info text-white';
      case 'Completed':
        return 'bg-secondary text-white';
      case 'Cancelled':
        return 'bg-medium-gray text-white';
      default:
        return 'bg-light-gray text-dark-charcoal';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Appointments</h1>
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-light-gray">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Time</th>
              <th className="text-left p-3">Doctor</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Notes</th>
              <th className="text-left p-3">Rate</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a._id} className="border-t">
                <td className="p-3">{new Date(a.date).toLocaleDateString()}</td>
                <td className="p-3">{a.timeSlot}</td>
                <td className="p-3">{a.doctorId?.name || '—'}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(a.status)}`}>{a.status}</span></td>
                <td className="p-3">{a.notes || '—'}</td>
                <td className="p-3">
                  {a.status === 'Completed' ? (
                    a.isRated ? (
                      <span className="text-green-700 text-xs bg-green-50 border border-green-200 px-2 py-1 rounded">Rated</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select
                          className="border rounded px-2 py-1"
                          value={ratingInputs[a._id] || ''}
                          onChange={(e) => setRatingInputs(prev => ({ ...prev, [a._id]: Number(e.target.value) }))}
                        >
                          <option value="">Select</option>
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}★</option>)}
                        </select>
                        <button
                          disabled={!ratingInputs[a._id] || submittingId === a._id}
                          onClick={async () => {
                            if (!ratingInputs[a._id]) return;
                            setSubmittingId(a._id);
                            try {
                              await api.post(`/patients/appointments/${a._id}/rate`, { rating: ratingInputs[a._id] });
                              setList(prev => prev.map(x => x._id === a._id ? { ...x, isRated: true } : x));
                            } catch (e) {
                              alert(e?.response?.data?.message || 'Failed to submit rating');
                            } finally {
                              setSubmittingId(null);
                            }
                          }}
                          className="px-3 py-1 bg-primary text-white rounded disabled:opacity-60"
                        >
                          {submittingId === a._id ? 'Submitting…' : 'Rate'}
                        </button>
                      </div>
                    )
                  ) : (
                    <span className="text-xs text-text-secondary">—</span>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td className="p-3" colSpan="6">No appointments yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}