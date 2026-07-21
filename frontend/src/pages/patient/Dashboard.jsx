import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { DashboardStatsSkeleton, AppointmentSkeleton } from '../../components/ui/SkeletonLoader';
import { StatCard } from '../../components/ui/StatCard';
import { Button, buttonVariants } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import { HealthOrb } from '../../three';
import { SafeScene } from '../../three';
import {
  CalendarDays,
  Pill,
  Stethoscope,
  Activity,
  Plus,
  RefreshCw,
  FileText,
} from 'lucide-react';

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
    const toDateTime = (appt) => {
      try {
        const base = new Date(appt.date);
        const startStr =
          appt.timeSlot && appt.timeSlot.includes('-')
            ? appt.timeSlot.split('-')[0].trim()
            : appt.timeSlot || '23:59';
        const [h, m] = startStr.includes(':') ? startStr.split(':').map(Number) : [23, 59];
        const dt = new Date(base);
        dt.setHours(h || 0, m || 0, 0, 0);
        return dt;
      } catch {
        return new Date(appt.date);
      }
    };
    const now = new Date();
    return [...appointments]
      .filter((a) => a.status === 'Scheduled' && toDateTime(a) >= now)
      .sort((a, b) => toDateTime(a) - toDateTime(b))[0];
  }, [appointments]);

  const upcomingCount = useMemo(
    () => appointments.filter((a) => a.status === 'Scheduled').length,
    [appointments]
  );
  const activeRx = useMemo(
    () => (Array.isArray(prescriptions) ? prescriptions.length : 0),
    [prescriptions]
  );

  const recentActivity = useMemo(() => {
    const items = [];
    for (const a of appointments) {
      const d = new Date(a.date);
      items.push({
        type: 'appointment',
        date: d,
        title: `Appointment with ${a.doctorId?.name || 'Doctor'}`,
        subtitle: `${d.toLocaleDateString()}${a.timeSlot ? ' • ' + a.timeSlot : ''} • ${a.status}`,
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

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="mb-2 font-head text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground">Here's what's happening with your health</p>
        </div>
        <DashboardStatsSkeleton />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 font-head text-xl font-semibold text-foreground">Upcoming Appointments</h2>
            <AppointmentSkeleton count={3} />
          </div>
          <div>
            <h2 className="mb-4 font-head text-xl font-semibold text-foreground">Recent Activity</h2>
            <AppointmentSkeleton count={3} />
          </div>
        </div>
      </div>
    );
  }

  const greet = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const nextLabel = nextAppointment
    ? new Date(nextAppointment.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '—';

  return (
    <div className="space-y-8">
      {/* Header + 3D accent */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-head text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {greet}, <span className="text-aurora">{user?.name?.split(' ')[0] || 'there'}</span>.
          </h1>
          <p className="text-lg font-medium text-muted-foreground">
            Here's what's next and your latest activity.
          </p>
        </div>
        <HeaderOrb />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Appointments"
          value={upcomingCount}
          delta={6}
          spark={[2, 3, 3, 5, 4, upcomingCount]}
          accent="#22d3ee"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatCard
          title="Active Rx"
          value={activeRx}
          delta={3}
          spark={[1, 2, 2, 3, 4, activeRx]}
          accent="#2dd4bf"
          icon={<Pill className="h-5 w-5" />}
        />
        <StatCard
          title="Next visit"
          value={nextLabel}
          accent="#6366f1"
          icon={<Stethoscope className="h-5 w-5" />}
        />
        <StatCard
          title="Wellness"
          value="92"
          unit="/100"
          delta={4}
          spark={[80, 84, 86, 88, 90, 92]}
          accent="#8b5cf6"
          icon={<Activity className="h-5 w-5" />}
        />
      </div>

      {/* Up Next */}
      <div className="ring-grad relative overflow-hidden rounded-2xl glass p-8 shadow-card dark:shadow-card-dark">
        <div className="aura-bg pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="relative z-10 flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-teal text-white shadow-glow">
                <CalendarDays className="h-5 w-5" />
              </div>
              <h3 className="font-head text-xl font-bold text-foreground">Up Next</h3>
            </div>
            {nextAppointment ? (
              <div className="space-y-2">
                <p className="font-medium text-foreground">
                  Your next appointment is with{' '}
                  <span className="font-bold text-brand-cyan-fg">
                    {nextAppointment.doctorId?.name || 'Doctor'}
                  </span>
                  .
                </p>
                <p className="font-medium text-muted-foreground">
                  {new Date(nextAppointment.date).toLocaleDateString()}{' '}
                  {nextAppointment.timeSlot ? `at ${nextAppointment.timeSlot}` : ''}
                </p>
              </div>
            ) : (
              <p className="font-medium text-muted-foreground">
                You're all up to date! Have a great day.
              </p>
            )}
          </div>
          <div>
            {nextAppointment && (
              <Link to="/patient/appointments" className={cn(buttonVariants({ variant: 'outline', size: 'default' }))}>
                View Details
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="font-head text-2xl font-bold tracking-tight text-foreground">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/patient/book-appointment" className={cn(buttonVariants({ size: 'lg' }))}>
            <Plus className="h-5 w-5" />
            Book New Appointment
          </Link>
          <Link to="/patient/refill-prescription" className={cn(buttonVariants({ variant: 'glass', size: 'lg' }))}>
            <RefreshCw className="h-5 w-5" />
            Request a Refill
          </Link>
          <Link to="/patient/medical-history" className={cn(buttonVariants({ variant: 'glass', size: 'lg' }))}>
            <FileText className="h-5 w-5" />
            View Medical History
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <h2 className="font-head text-2xl font-bold tracking-tight text-foreground">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <div className="rounded-2xl glass p-8 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-foreground/5">
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-muted-foreground">No recent activity yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-4 rounded-xl glass p-6 shadow-card transition-all duration-200 hover:shadow-glow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl',
                      item.type === 'appointment'
                        ? 'bg-brand-cyan/15 text-brand-cyan-fg'
                        : 'bg-brand-teal/15 text-brand-teal'
                    )}
                  >
                    {item.type === 'appointment' ? (
                      <CalendarDays className="h-5 w-5" />
                    ) : (
                      <Pill className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{item.title}</h4>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
                <div className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-muted-foreground">
                  {item.date.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Small 3D accent for the dashboard header */
function HeaderOrb() {
  return (
    <div className="h-28 w-28 shrink-0 animate-float">
      <SafeScene className="h-full w-full">
        <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 4.6], fov: 45 }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[3, 2, 3]} intensity={16} color="#22d3ee" />
          <pointLight position={[-3, -1, 2]} intensity={12} color="#8b5cf6" />
          <HealthOrb scale={0.82} distort={0.3} speed={1.4} />
        </Canvas>
      </SafeScene>
    </div>
  );
}
