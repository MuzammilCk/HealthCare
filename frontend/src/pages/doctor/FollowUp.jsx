import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function FollowUp() {
  const location = useLocation();
  const navigate = useNavigate();
  const apptFromState = location.state?.appointment || {};
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [saving, setSaving] = useState(false);
  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const todayIso = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Load doctor's availability if not provided on state
  useEffect(() => {
    const avail = apptFromState?.doctor?.availability;
    if (Array.isArray(avail) && avail.length) {
      setDoctorAvailability(avail);
      return;
    }
    (async () => {
      try {
        const res = await api.get('/doctors/profile');
        setDoctorAvailability(res.data?.data?.availability || []);
      } catch {}
    })();
  }, [apptFromState]);

  // Compute available slots for selected date based on doctor's weekly availability
  const availableSlotsForDate = useMemo(() => {
    if (!date || !doctorAvailability) return [];
    const dayIndex = new Date(`${date}T00:00:00`).getDay();
    const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const day = names[dayIndex];
    const matched = doctorAvailability.find(av => (av.day||'').toLowerCase() === day.toLowerCase());
    return matched?.slots || [];
  }, [date, doctorAvailability]);

  useEffect(() => {
    if (!apptFromState?._id) {
      navigate('/doctor/appointments');
    }
  }, [apptFromState, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!apptFromState?._id || !date || !timeSlot) {
      toast.error('Please select date and time');
      return;
    }
    
    setSaving(true);
    const loadingToast = toast.loading('Scheduling follow-up...');
    
    try {
      const res = await api.post(`/doctors/appointments/${apptFromState._id}/follow-up`, { notes, date, timeSlot });
      toast.dismiss(loadingToast);
      toast.success('Follow-up scheduled successfully!');
      const newApptId = res.data?.data?.followUp?._id;
      const patientId = res.data?.data?.followUp?.patientId?._id || res.data?.data?.followUp?.patientId;
      navigate('/doctor/prescriptions/new', { state: { appointmentId: newApptId, patientId } });
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error(e.response?.data?.message || 'Failed to schedule follow-up');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Schedule Follow-up</h1>
      <div className="mb-4 p-3 rounded border bg-white">
        <div className="text-sm text-gray-700">Patient</div>
        <div className="font-semibold">{apptFromState?.patientId?.name}</div>
        <div className="text-sm text-gray-500">{apptFromState?.patientId?.email}</div>
        <div className="text-sm mt-2">Original appointment: {apptFromState?.timeSlot} on {apptFromState?.date ? new Date(apptFromState.date).toLocaleDateString() : ''}</div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div>
          <label className="block text-sm mb-1">Follow-up Date</label>
          <input type="date" className="w-full border rounded px-3 py-2" value={date} onChange={(e) => { setDate(e.target.value); setTimeSlot(''); }} min={todayIso} />
        </div>
        <div>
          <label className="block text-sm mb-1">Available Time Slots</label>
          <select className="w-full border rounded px-3 py-2" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} disabled={!date}>
            <option value="">Select time</option>
            {availableSlotsForDate.map((s, i) => (
              <option key={i} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Notes for follow-up</label>
          <textarea className="w-full border rounded px-3 py-2" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add follow-up notes (optional)" />
        </div>
        <div className="space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={saving}>{saving ? 'Saving…' : 'Confirm and Create Prescription'}</button>
          <button type="button" className="border px-4 py-2 rounded" onClick={() => navigate('/doctor/appointments')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}


