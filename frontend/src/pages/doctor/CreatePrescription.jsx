import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';

export default function CreatePrescription() {
  const location = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ appointmentId: '', medication: '', dosage: '', instructions: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/doctors/appointments');
        setAppointments((res.data.data || []).filter((a) => a.status === 'Completed' || a.status === 'Follow-up'));
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Preselect appointment if navigated with state
  useEffect(() => {
    const apptIdFromState = location.state?.appointmentId;
    if (apptIdFromState) {
      setForm((f) => ({ ...f, appointmentId: apptIdFromState }));
    }
  }, [location.state]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.appointmentId || !form.medication || !form.dosage || !form.instructions) return alert('Complete all fields');
    setSaving(true);
    try {
      await api.post('/doctors/prescriptions', form);
      alert('Prescription created');
      setForm({ appointmentId: '', medication: '', dosage: '', instructions: '' });
    } catch (e) {
      alert(e.response?.data?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create Prescription</h1>
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm mb-1">Completed Appointment</label>
          <select name="appointmentId" value={form.appointmentId} onChange={onChange} className="w-full border rounded px-3 py-2">
            <option value="">Select appointment</option>
            {appointments.map((a) => (
              <option key={a._id} value={a._id}>
                {new Date(a.date).toLocaleDateString()} {a.timeSlot} — {a.patientId?.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Medication</label>
          <input name="medication" value={form.medication} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Dosage</label>
          <input name="dosage" value={form.dosage} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Instructions</label>
          <textarea name="instructions" rows={3} value={form.instructions} onChange={onChange} className="w-full border rounded px-3 py-2" />
        </div>
        <button disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{saving ? 'Creating…' : 'Create Prescription'}</button>
      </form>
    </div>
  );
}
