import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Reveal from '../../components/Reveal';

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
      const res = await api.post(`/doctors/appointments/${apptFromState._id}/follow-up`, {
        notes,
        date, // Send as ISO date string (YYYY-MM-DD)
        timeSlot
      });
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

  const fieldCls = 'w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan';

  return (
    <div className="mx-auto max-w-xl space-y-6 bg-background text-foreground">
      <Reveal>
        <h1 className="font-head text-2xl font-bold tracking-tight text-foreground">Schedule Follow-up</h1>
      </Reveal>

      <Reveal className="glass rounded-xl border border-border p-4 shadow-card">
        <div className="text-sm text-muted-foreground">Patient</div>
        <div className="font-semibold text-foreground">{apptFromState?.patientId?.name}</div>
        <div className="text-sm text-muted-foreground">{apptFromState?.patientId?.email}</div>
        <div className="mt-2 text-sm text-muted-foreground">Original appointment: {apptFromState?.timeSlot} on {apptFromState?.date ? new Date(apptFromState.date).toLocaleDateString() : ''}</div>
      </Reveal>

      <Reveal>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Follow-up Date</label>
            <input type="date" className={fieldCls} value={date} onChange={(e) => { setDate(e.target.value); setTimeSlot(''); }} min={todayIso} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Available Time Slots</label>
            <select className={fieldCls} value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} disabled={!date}>
              <option value="">Select time</option>
              {availableSlotsForDate.map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Notes for follow-up</label>
            <textarea className={`${fieldCls} resize-none`} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add follow-up notes (optional)" />
          </div>
          <div className="flex gap-3">
            <button className="rounded-lg bg-gradient-to-br from-brand-cyan to-brand-teal px-4 py-2 font-semibold text-white shadow-glow transition-all hover:brightness-110 disabled:opacity-50" disabled={saving}>{saving ? 'Saving…' : 'Confirm and Create Prescription'}</button>
            <button type="button" className="rounded-lg border border-border px-4 py-2 text-foreground transition-colors hover:bg-foreground/5" onClick={() => navigate('/doctor/appointments')}>Cancel</button>
          </div>
        </form>
      </Reveal>
    </div>
  );
}
