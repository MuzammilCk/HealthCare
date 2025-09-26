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
      <h1 className="text-2xl font-bold text-text-primary mb-6">Manage Specializations</h1>

      <form onSubmit={onSubmit} className="bg-white p-6 rounded-xl shadow-card max-w-2xl mx-auto space-y-4 mb-8">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Name</label>
          <input 
            id="name"
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full bg-bg-page border border-slate-300/70 rounded-lg py-2 h-12 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50" 
            placeholder="e.g., Cardiology" 
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Description</label>
          <textarea 
            id="description"
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            className="w-full bg-bg-page border border-slate-300/70 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/50" 
            placeholder="e.g., Heart and cardiovascular care"
            rows="3"
          />
        </div>
        <button 
          disabled={saving} 
          className="w-full bg-primary text-white font-bold px-4 py-2 rounded-lg h-12 transition-all duration-300 ease-in-out hover:bg-primary-light hover:shadow-lg hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {saving ? 'Adding…' : 'Add Specialization'}
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-card overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-text-secondary">Loading…</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-light-gray">
              <tr>
                <th className="text-left p-4 font-semibold text-text-primary">Name</th>
                <th className="text-left p-4 font-semibold text-text-primary">Description</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s._id} className="border-t border-slate-200">
                  <td className="p-4 text-text-primary">{s.name}</td>
                  <td className="p-4 text-text-secondary">{s.description || '—'}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td className="p-4 text-center text-text-secondary" colSpan="2">No specializations yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}