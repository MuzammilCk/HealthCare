import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export default function DoctorDashboard() {
  const [stats, setStats] = useState({ today: 0, scheduled: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // Fetch appointments for stats
        const [apptRes, profileRes] = await Promise.all([
          api.get('/doctors/appointments'),
          api.get('/doctors/profile'),
        ]);
        const list = apptRes.data.data || [];
        const todayStr = new Date().toDateString();
        const today = list.filter(a => new Date(a.date).toDateString() === todayStr).length;
        const scheduled = list.filter(a => a.status === 'Scheduled').length;
        const completed = list.filter(a => a.status === 'Completed').length;
        setStats({ today, scheduled, completed });
        setVerificationStatus(profileRes?.data?.data?.verificationStatus || '');
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-h2 font-bold mb-4">Doctor Dashboard</h1>
      {(verificationStatus === 'Pending' || verificationStatus === 'Rejected') && (
        <div className={`mb-4 p-4 rounded-xl border ${verificationStatus === 'Rejected' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
          <div className="font-semibold mb-1">
            {verificationStatus === 'Rejected' ? 'KYC Rejected' : 'Pending Verification'}
          </div>
          <div className="text-sm mb-2">
            {verificationStatus === 'Rejected' ? 'Your KYC was rejected. Please re-submit your documents.' : 'Your profile is not yet verified. Please submit KYC to get approved.'}
          </div>
          <Link to="/doctor/kyc" className="inline-block px-4 py-2 bg-primary text-white rounded">Go to KYC</Link>
        </div>
      )}
      {verificationStatus === 'Submitted' && (
        <div className="mb-4 p-4 rounded-xl border bg-blue-50 border-blue-200 text-blue-800">
          Your KYC has been submitted and is under review.
        </div>
      )}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-card"><div className="text-medium-gray">Today</div><div className="text-3xl font-bold">{stats.today}</div></div>
        <div className="bg-white p-4 rounded-xl shadow-card"><div className="text-medium-gray">Scheduled</div><div className="text-3xl font-bold">{stats.scheduled}</div></div>
        <div className="bg-white p-4 rounded-xl shadow-card"><div className="text-medium-gray">Completed</div><div className="text-3xl font-bold">{stats.completed}</div></div>
      </div>
    </div>
  );
}