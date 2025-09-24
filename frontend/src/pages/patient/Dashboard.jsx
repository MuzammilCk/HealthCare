import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [aRes, pRes] = await Promise.all([
          api.get('/patients/appointments'),
          api.get('/patients/prescriptions'),
        ]);
        setAppointments(aRes.data?.data || []);
        setPrescriptions(pRes.data?.data || pRes.data || []);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const nextAppointment = useMemo(() => {
    const now = new Date();
    return [...appointments]
      .filter((a) => new Date(a.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  }, [appointments]);

  const recentActivity = useMemo(() => {
    const items = [];
    for (const a of appointments) {
      const d = new Date(a.date);
      items.push({
        type: 'appointment',
        date: d,
        title: `Appointment with ${a.doctorId?.name || 'Doctor'}`,
        subtitle: `${d.toLocaleDateString()}${a.timeSlot ? ' • ' + a.timeSlot : ''}`,
      });
    }
    for (const p of (Array.isArray(prescriptions) ? prescriptions : [])) {
      const d = p.dateIssued ? new Date(p.dateIssued) : new Date();
      items.push({
        type: 'prescription',
        date: d,
        title: `Prescription: ${p.medication || 'Medication'}`,
        subtitle: `${d.toLocaleDateString()}${p.dosage ? ' • ' + p.dosage : ''}`,
      });
    }
    return items.sort((a, b) => b.date - a.date).slice(0, 6);
  }, [appointments, prescriptions]);

  if (loading) return <div>Loading…</div>;

  const greet = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const btnBase = "px-4 py-2 rounded-lg font-semibold transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-px";
  const btnPrimary = `${btnBase} bg-primary text-white hover:bg-primary-light`;
  const btnSecondary = `${btnBase} bg-white/80 border border-slate-300/70 hover:bg-white`;

  return (
    <div className="leading-body">
      {/* Greeting */}
      <h1 className="text-3xl font-bold mb-1 text-text-primary">{greet}, {user?.name?.split(' ')[0] || 'there'}.</h1>
      <p className="text-text-secondary mb-6">Here’s what’s next and your latest activity.</p>

      {/* Up Next */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-semibold text-text-primary mb-1">Up Next</div>
            {nextAppointment ? (
              <>
                <div className="text-text-primary">Your next appointment is with <span className="font-semibold">{nextAppointment.doctorId?.name || 'Doctor'}</span>.</div>
                <div className="text-text-secondary text-sm">{new Date(nextAppointment.date).toLocaleDateString()} {nextAppointment.timeSlot ? `at ${nextAppointment.timeSlot}` : ''}</div>
              </>
            ) : (
              <div className="text-text-secondary">You’re all up to date! Have a great day.</div>
            )}
          </div>
          <div>
            {nextAppointment && (
              <Link to="/patient/appointments" className={`${btnBase} bg-primary text-white hover:bg-primary-light text-sm`}>View Details</Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/patient/book-appointment" className={btnPrimary}>+ Book New Appointment</Link>
        <Link to="/patient/prescriptions" className={btnSecondary}>↻ Request a Refill</Link>
        <Link to="/patient/medical-history" className={btnSecondary}>📄 View Medical History</Link>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-semibold mb-3 text-text-primary">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <div className="text-text-secondary">No recent activity yet.</div>
        ) : (
          <ul className="space-y-2">
            {recentActivity.map((item, idx) => (
              <li key={idx} className="bg-white/60 rounded-lg border border-slate-300/50 p-3 flex items-start justify-between">
                <div>
                  <div className="font-medium text-text-primary">{item.title}</div>
                  <div className="text-sm text-text-secondary">{item.subtitle}</div>
                </div>
                <div className="text-xs text-text-secondary">{item.date.toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}