import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const districtsOfKerala = ["Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"];

export default function BookAppointment() {
  const { user } = useAuth(); // Get authenticated user details
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filterSpecId, setFilterSpecId] = useState('');
  // Set the default district filter to the patient's district
  const [filterDistrict, setFilterDistrict] = useState(user?.district || '');
  const [form, setForm] = useState({ doctorId: '', date: '', timeSlot: '' });
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Pass the selected district to the API call
        const [specRes, docRes] = await Promise.all([
          api.get('/specializations'),
          api.get(`/patients/doctors?district=${filterDistrict}`),
        ]);
        setSpecializations(specRes.data.data || []);
        setDoctors(docRes.data.data || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, [filterDistrict]); // Re-run the effect when the district filter changes

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
        <div className="md:col-span-1 bg-white p-4 rounded-xl shadow-card">
          {/* New District Filter */}
          <div className="mb-3">
            <label className="block text-sm mb-1">Filter by District</label>
            <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-12">
              <option value="">All Districts</option>
              {districtsOfKerala.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm mb-1">Filter by Specialization</label>
            <select value={filterSpecId} onChange={(e) => setFilterSpecId(e.target.value)} className="w-full border rounded-lg px-3 py-2 h-12">
              <option value="">All</option>
              {specializations.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Doctor</label>
            <div className="space-y-2">
              {filteredDoctors.filter(d => d.userId).map((d) => (
                <div key={d.userId._id}
                  onClick={() => setForm({ ...form, doctorId: d.userId._id })}
                  className={`flex items-center p-2 rounded-lg cursor-pointer ${form.doctorId === d.userId._id ? 'bg-primary text-white' : 'hover:bg-bg-page'}`}
                >
                  <img src={d.photoUrl || 'https://i.pravatar.cc/150'} alt={d.userId.name} className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <div className="font-semibold">{d.userId.name}</div>
                    <div className="text-xs text-text-secondary">{d.specializationId?.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-4 rounded-xl shadow-card">
          {selectedDoctor ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Date</label>
                <input type="date" name="date" value={form.date} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12" />
              </div>
              <div>
                <label className="block text-sm mb-1">Time Slot</label>
                <select name="timeSlot" value={form.timeSlot} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12">
                  <option value="">Select time</option>
                  {(selectedDoctor?.availability || []).map((d, idx) => (
                    <optgroup key={idx} label={d.day}>
                      {d.slots.map((s, i) => (
                        <option key={`${idx}-${i}`} value={s}>{s} ({d.day})</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="text-xs text-text-secondary mt-1">Slots shown are from the selected doctor's availability.</p>
              </div>
              <button disabled={booking} className="bg-secondary text-white px-4 py-2 rounded-lg disabled:opacity-50 h-11">{booking ? 'Booking…' : 'Book Appointment'}</button>
            </form>
          ) : (
            <div className="text-center text-text-secondary py-10">
              Please select a doctor to see their availability.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}