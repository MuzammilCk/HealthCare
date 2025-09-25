import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(''); // '', 'rating_desc', 'rating_asc'

  const fetchDoctors = async (sort = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/doctors${sort ? `?sortBy=${sort}` : ''}`);
      setDoctors(res.data.data || []);
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(sortBy);
  }, [sortBy]);

  const onRemove = async (userId) => {
    if (!confirm('Remove this doctor? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/doctors/${userId}`);
      setDoctors((prev) => prev.filter((d) => d.userId?._id !== userId));
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to remove doctor');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Doctors</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-secondary">Sort:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded px-2 py-1">
            <option value="">Default</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="rating_asc">Lowest Rated</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-light-gray text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Specialization</th>
              <th className="p-3">District</th>
              <th className="p-3">Avg Rating</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-3" colSpan={6}>Loading…</td></tr>
            ) : doctors.length ? (
              doctors.map((doc) => (
                <tr key={doc._id} className="border-t">
                  <td className="p-3">{doc.userId?.name}</td>
                  <td className="p-3">{doc.userId?.email}</td>
                  <td className="p-3">{doc.specializationId?.name || '—'}</td>
                  <td className="p-3">{doc.userId?.district || doc.district || '—'}</td>
                  <td className="p-3">{typeof doc.averageRating === 'number' ? `${doc.averageRating}★` : '0★'}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => onRemove(doc.userId?._id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Remove</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td className="p-3" colSpan={6}>No doctors found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
