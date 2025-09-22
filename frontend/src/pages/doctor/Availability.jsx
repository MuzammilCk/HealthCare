import api from '../../services/api';
import { useEffect, useState } from 'react';

export default function DoctorAvailability() {
  const [availability, setAvailability] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/doctors/profile');
        setAvailability(res.data?.data?.availability || []);
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const addDay = () => setAvailability((prev) => [...prev, { day: 'Monday', slots: [] }]);
  const updateDay = (idx, key, value) => {
    const copy = [...availability];
    copy[idx][key] = value;
    setAvailability(copy);
  };
  const addSlot = (idx) => {
    const copy = [...availability];
    copy[idx].slots.push('09:00');
    setAvailability(copy);
  };
  const updateSlot = (dIdx, sIdx, value) => {
    const copy = [...availability];
    copy[dIdx].slots[sIdx] = value;
    setAvailability(copy);
  };
  const removeSlot = (dIdx, sIdx) => {
    const copy = [...availability];
    copy[dIdx].slots.splice(sIdx, 1);
    setAvailability(copy);
  };
  const removeDay = (idx) => setAvailability((prev) => prev.filter((_, i) => i !== idx));

  const onSave = async () => {
    setSaving(true);
    try {
      await api.put('/doctors/availability', { availability });
      alert('Availability saved');
    } catch {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Availability</h1>
      <div className="space-y-4">
        {availability.map((d, idx) => (
          <div key={idx} className="bg-white p-4 rounded shadow">
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm">Day</label>
              <select value={d.day} onChange={(e) => updateDay(idx, 'day', e.target.value)} className="border rounded px-2 py-1">
                {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
                  <option key={day}>{day}</option>
                ))}
              </select>
              <button onClick={() => removeDay(idx)} className="ml-auto text-red-600 text-sm">Remove day</button>
            </div>
            <div className="space-y-2">
              {d.slots.map((s, sIdx) => (
                <div key={sIdx} className="flex items-center gap-2">
                  <input value={s} onChange={(e) => updateSlot(idx, sIdx, e.target.value)} className="border rounded px-2 py-1" placeholder="HH:MM" />
                  <button onClick={() => removeSlot(idx, sIdx)} className="text-red-600 text-sm">Remove</button>
                </div>
              ))}
              <button onClick={() => addSlot(idx)} className="text-blue-600 text-sm">+ Add slot</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-x-3">
        <button onClick={addDay} className="bg-white border px-4 py-2 rounded">+ Add day</button>
        <button onClick={onSave} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </div>
  );
}
