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

  return (
    <div>
      {/* Greeting */}
      <h1 className="text-2xl font-bold mb-1">{greet}, {user?.name?.split(' ')[0] || 'there'}.</h1>
      <p className="text-gray-600 mb-6">Here’s what’s next and your latest activity.</p>

      {/* Up Next */}
      <div className="bg-white rounded shadow p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-semibold text-gray-900 mb-1">Up Next</div>
            {nextAppointment ? (
              <>
                <div className="text-gray-800">Your next appointment is with <span className="font-semibold">{nextAppointment.doctorId?.name || 'Doctor'}</span>.</div>
                <div className="text-gray-600 text-sm">{new Date(nextAppointment.date).toLocaleDateString()} {nextAppointment.timeSlot ? `at ${nextAppointment.timeSlot}` : ''}</div>
              </>
            ) : (
              <div className="text-gray-700">You’re all up to date! Have a great day.</div>
            )}
          </div>
          <div>
            {nextAppointment && (
              <Link to="/patient/appointments" className="inline-block bg-blue-600 text-white px-4 py-2 rounded">View Details</Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/patient/book-appointment" className="bg-blue-600 text-white px-4 py-2 rounded">+ Book New Appointment</Link>
        <Link to="/patient/prescriptions" className="bg-white border px-4 py-2 rounded">↻ Request a Refill</Link>
        <Link to="/patient/medical-history" className="bg-white border px-4 py-2 rounded">📄 View Medical History</Link>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <div className="text-gray-600">No recent activity yet.</div>
        ) : (
          <ul className="space-y-2">
            {recentActivity.map((item, idx) => (
              <li key={idx} className="bg-white rounded border p-3 flex items-start justify-between">
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-600">{item.subtitle}</div>
                </div>
                <div className="text-xs text-gray-500">{item.date.toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
