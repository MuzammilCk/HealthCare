import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Prescriptions() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/patients/prescriptions');
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
      <h1 className="text-2xl font-bold mb-4">My Prescriptions</h1>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Medication</th>
              <th className="text-left p-3">Dosage</th>
              <th className="text-left p-3">Instructions</th>
              <th className="text-left p-3">Doctor</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p._id} className="border-t">
                <td className="p-3">{new Date(p.dateIssued).toLocaleDateString()}</td>
                <td className="p-3">{p.medication}</td>
                <td className="p-3">{p.dosage}</td>
                <td className="p-3">{p.instructions}</td>
                <td className="p-3">{p.doctorId?.name || '—'}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td className="p-3" colSpan="5">No prescriptions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
