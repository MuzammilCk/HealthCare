import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

export default function BookAppointment() {
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filterSpecId, setFilterSpecId] = useState('');
  const [form, setForm] = useState({ doctorId: '', date: '', timeSlot: '' });
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [specRes, docRes] = await Promise.all([
          api.get('/specializations'),
          api.get('/patients/doctors'),
        ]);
        setSpecializations(specRes.data.data || []);
        setDoctors(docRes.data.data || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredDoctors = useMemo(() => {
    if (!filterSpecId) return doctors;
    return doctors.filter((d) => d.specializationId?._id === filterSpecId);
  }, [doctors, filterSpecId]);

  const selectedDoctor = useMemo(() => doctors.find((d) => d.userId?._id === form.doctorId), [doctors, form.doctorId]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.doctorId || !form.date || !form.timeSlot) return alert('Please complete all fields');
    setBooking(true);
    try {
      await api.post('/patients/appointments', {
        doctorId: form.doctorId,
        date: new Date(form.date),
        timeSlot: form.timeSlot,
      });
      alert('Appointment booked');
      setForm({ doctorId: '', date: '', timeSlot: '' });
    } catch (e) {
      alert(e.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Book Appointment</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 bg-white p-4 rounded shadow">
          <div className="mb-3">
            <label className="block text-sm mb-1">Filter by Specialization</label>
            <select value={filterSpecId} onChange={(e) => setFilterSpecId(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">All</option>
              {specializations.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Doctor</label>
            <select name="doctorId" value={form.doctorId} onChange={onChange} className="w-full border rounded px-3 py-2">
              <option value="">Select a doctor</option>
              {filteredDoctors.map((d) => (
                <option key={d.userId._id} value={d.userId._id}>
                  {d.userId.name} ({d.specializationId?.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-4 rounded shadow">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Date</label>
              <input type="date" name="date" value={form.date} onChange={onChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">Time Slot</label>
              <select name="timeSlot" value={form.timeSlot} onChange={onChange} className="w-full border rounded px-3 py-2">
                <option value="">Select time</option>
                {(selectedDoctor?.availability || []).map((d, idx) => (
                  <optgroup key={idx} label={d.day}>
                    {d.slots.map((s, i) => (
                      <option key={`${idx}-${i}`} value={s}>{s} ({d.day})</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Slots shown are from the selected doctor's availability.</p>
            </div>
            <button disabled={booking} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{booking ? 'Booking…' : 'Book Appointment'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
