import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function MedicalHistory() {
  const [form, setForm] = useState({ bloodType: '', allergies: '', pastConditions: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/patients/me/medical-history');
        const mh = res.data.data;
        setForm({
          bloodType: mh.bloodType || '',
          allergies: (mh.allergies || []).join(', '),
          pastConditions: (mh.pastConditions || []).join(', '),
        });
      } catch (e) {
        if (e.response?.status === 404) setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/patients/me/medical-history', {
        bloodType: form.bloodType,
        allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        pastConditions: form.pastConditions ? form.pastConditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      alert('Saved');
      setNotFound(false);
    } catch (e) {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Medical History</h1>
      {notFound && <div className="mb-3 p-3 bg-yellow-50 text-yellow-700 rounded">No record yet. Create one below.</div>}
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm mb-1">Blood Type</label>
          <input name="bloodType" value={form.bloodType} onChange={onChange} className="w-full border rounded px-3 py-2" placeholder="O+" />
        </div>
        <div>
          <label className="block text-sm mb-1">Allergies (comma separated)</label>
          <input name="allergies" value={form.allergies} onChange={onChange} className="w-full border rounded px-3 py-2" placeholder="Peanuts, Pollen" />
        </div>
        <div>
          <label className="block text-sm mb-1">Past Conditions (comma separated)</label>
          <input name="pastConditions" value={form.pastConditions} onChange={onChange} className="w-full border rounded px-3 py-2" placeholder="Asthma" />
        </div>
        <button disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
      </form>
    </div>
  );
}
