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

  const btnPrimary = "inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200";
  const btnSecondary = "inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium border-2 border-gray-200 hover:border-gray-300 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200";
  const btnOutline = "inline-flex items-center gap-2 px-4 py-2 bg-transparent hover:bg-blue-50 text-blue-600 font-medium border-2 border-blue-200 hover:border-blue-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200";

  return (
    <div className="space-y-8">
      {/* Enhanced Greeting Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{greet}, {user?.name?.split(' ')[0] || 'there'}.</h1>
        <p className="text-lg font-medium text-slate-600">Here's what's next and your latest activity.</p>
      </div>
      {/* Enhanced Up Next Card */}
      <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border-2 border-blue-200/60 rounded-2xl p-8 shadow-lg shadow-blue-900/5">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Up Next</h3>
            </div>
            {nextAppointment ? (
              <div className="space-y-2">
                <p className="text-slate-800 font-medium">Your next appointment is with <span className="font-bold text-blue-700">{nextAppointment.doctorId?.name || 'Doctor'}</span>.</p>
                <p className="text-slate-600 font-medium">{new Date(nextAppointment.date).toLocaleDateString()} {nextAppointment.timeSlot ? `at ${nextAppointment.timeSlot}` : ''}</p>
              </div>
            ) : (
              <p className="text-slate-600 font-medium">You're all up to date! Have a great day.</p>
            )}
          </div>
          <div>
            {nextAppointment && (
              <Link to="/patient/appointments" className={btnOutline}>
                View Details
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/patient/book-appointment" className={btnPrimary}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Book New Appointment
          </Link>
          <Link to="/patient/prescriptions" className={btnSecondary}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Request a Refill
          </Link>
          <Link to="/patient/medical-history" className={btnSecondary}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Medical History
          </Link>
        </div>
      </div>

      {/* Enhanced Recent Activity */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-900/10 border border-slate-200/60 p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No recent activity yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item, idx) => (
              <div key={idx} className="bg-white/95 backdrop-blur-xl rounded-xl shadow-sm shadow-slate-900/5 border border-slate-200/60 p-6 hover:shadow-md hover:scale-[1.01] transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.type === 'appointment' 
                        ? 'bg-gradient-to-br from-blue-100 to-blue-200' 
                        : 'bg-gradient-to-br from-green-100 to-green-200'
                    }`}>
                      {item.type === 'appointment' ? (
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{item.title}</h4>
                      <p className="text-sm font-medium text-slate-600 mt-1">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {item.date.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}