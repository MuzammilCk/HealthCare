import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function KycRequests() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [updatingId, setUpdatingId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/kyc-requests');
      setItems(res?.data?.data || []);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (doctorId, status) => {
    const reason = status === 'Rejected' ? prompt('Provide a rejection reason (optional):', '') : undefined;
    setUpdatingId(doctorId);
    try {
      await api.put(`/admin/kyc-requests/${doctorId}`, { status, reason });
      await fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to update');
    } finally {
      setUpdatingId('');
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-h2 font-bold mb-4">KYC Requests</h1>
      {items.length === 0 ? (
        <div className="text-gray-600">No pending KYC submissions.</div>
      ) : (
        <div className="space-y-3">
          {items.map((d) => (
            <div key={d._id} className="p-4 bg-white rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-semibold">{d?.userId?.name}</div>
                <div className="text-sm text-gray-600">{d?.userId?.email}</div>
                <div className="text-sm">Specialization: {d?.specializationId?.name}</div>
                <div className="mt-2">
                  <div className="text-xs text-gray-500">Documents:</div>
                  <ul className="list-disc list-inside text-sm">
                    {(d?.kyc?.documents || []).map((url, idx) => (
                      <li key={idx}><a href={url} target="_blank" rel="noreferrer" className="text-primary underline">{url}</a></li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex gap-2">
                <button disabled={updatingId === d._id} onClick={() => updateStatus(d._id, 'Approved')} className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-60">Approve</button>
                <button disabled={updatingId === d._id} onClick={() => updateStatus(d._id, 'Rejected')} className="px-3 py-2 rounded bg-red-600 text-white disabled:opacity-60">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
