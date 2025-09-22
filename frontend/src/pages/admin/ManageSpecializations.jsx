import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ManageSpecializations() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/specializations');
      setList(res.data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name) return alert('Name required');
    setSaving(true);
    try {
      await api.post('/specializations', { name, description });
      setName('');
      setDescription('');
      await load();
    } catch (e) {
      alert(e.response?.data?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-h2 font-bold mb-4">Manage Specializations</h1>

      <form onSubmit={onSubmit} className="bg-white p-4 rounded-xl shadow-card max-w-xl space-y-3 mb-6">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-12" placeholder="Cardiology" />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="Heart and cardiovascular care" />
        </div>
        <button disabled={saving} className="bg-primary text-white px-4 py-2 rounded-lg disabled:opacity-50">{saving ? 'Adding…' : 'Add Specialization'}</button>
      </form>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-4">Loading…</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-light-gray">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.description || '—'}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td className="p-3" colSpan="2">No specializations yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}