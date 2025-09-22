import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function DoctorDashboard() {
  const [stats, setStats] = useState({ today: 0, scheduled: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/doctors/appointments');
        const list = res.data.data || [];
        const todayStr = new Date().toDateString();
        const today = list.filter(a => new Date(a.date).toDateString() === todayStr).length;
        const scheduled = list.filter(a => a.status === 'Scheduled').length;
        const completed = list.filter(a => a.status === 'Completed').length;
        setStats({ today, scheduled, completed });
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <h1 className="text-h2 font-bold mb-4">Doctor Dashboard</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-card"><div className="text-medium-gray">Today</div><div className="text-3xl font-bold">{stats.today}</div></div>
        <div className="bg-white p-4 rounded-xl shadow-card"><div className="text-medium-gray">Scheduled</div><div className="text-3xl font-bold">{stats.scheduled}</div></div>
        <div className="bg-white p-4 rounded-xl shadow-card"><div className="text-medium-gray">Completed</div><div className="text-3xl font-bold">{stats.completed}</div></div>
      </div>
    </div>
  );
}