import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardStatsSkeleton, AppointmentSkeleton } from '../../components/ui/SkeletonLoader';
import Reveal from '../../components/Reveal';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Calendar as CalendarIcon,
  ArrowRight,
} from 'lucide-react';

export default function DoctorDashboard() {
  const [stats, setStats] = useState({ today: 0, scheduled: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [scheduledIndex, setScheduledIndex] = useState(0);
  const [completedIndex, setCompletedIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // Fetch appointments for stats
        const [apptRes, profileRes] = await Promise.all([
          api.get('/doctors/appointments'),
          api.get('/doctors/profile'),
        ]);
        const list = apptRes.data.data || [];
        setAppointments(list);
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

  // Filter appointments by selected date
  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.toDateString() === selectedDate.toDateString();
  });

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Handle stat card clicks - Cycle through appointments
  const handleTodayClick = () => {
    navigate('/doctor/appointments');
  };

  const handleScheduledClick = () => {
    navigate('/doctor/appointments');
  };

  const handleCompletedClick = () => {
    navigate('/doctor/appointments');
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
           currentMonth.getMonth() === today.getMonth() &&
           currentMonth.getFullYear() === today.getFullYear();
  };

  const isSelected = (day) => {
    return day === selectedDate.getDate() &&
           currentMonth.getMonth() === selectedDate.getMonth() &&
           currentMonth.getFullYear() === selectedDate.getFullYear();
  };

  const hasAppointments = (day) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return appointments.some(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === checkDate.toDateString();
    });
  };

  if (loading) {
    return (
      <div className="space-y-8 bg-background text-foreground">
        <div>
          <h1 className="mb-2 font-head text-3xl font-bold tracking-tight text-foreground">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Manage your practice and patient care</p>
        </div>
        <DashboardStatsSkeleton />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 font-head text-xl font-semibold text-foreground">Today's Appointments</h2>
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

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-8 bg-background text-foreground">
      <div>
        <h1 className="font-head text-3xl font-bold tracking-tight text-foreground">Doctor Dashboard</h1>
        <p className="text-muted-foreground">Manage your practice and patient care</p>
      </div>

      {(verificationStatus === 'Pending' || verificationStatus === 'Rejected') && (
        <div className={cn(
          'mb-4 rounded-xl border p-4',
          verificationStatus === 'Rejected'
            ? 'border-error/40 bg-error/15 text-foreground'
            : 'border-amber-400/40 bg-amber-400/15 text-foreground'
        )}>
          <div className="mb-1 font-semibold">
            {verificationStatus === 'Rejected' ? 'KYC Rejected' : 'Pending Verification'}
          </div>
          <div className="text-sm mb-2">
            {verificationStatus === 'Rejected' ? 'Your KYC was rejected. Please re-submit your documents.' : 'Your profile is not yet verified. Please submit KYC to get approved.'}
          </div>
          <Link to="/doctor/kyc" className="inline-block rounded-lg bg-gradient-to-br from-brand-cyan to-brand-teal px-4 py-2 text-sm font-semibold text-white shadow-glow hover:brightness-110">
            Go to KYC
          </Link>
        </div>
      )}
      {verificationStatus === 'Submitted' && (
        <div className="mb-4 rounded-xl border border-brand-sky/40 bg-brand-sky/15 p-4 text-foreground">
          Your KYC has been submitted and is under review.
        </div>
      )}

      {/* Stats Cards - Clickable */}
      <Reveal className="grid gap-4 sm:grid-cols-3">
        <button
          onClick={handleTodayClick}
          className="group relative overflow-hidden rounded-2xl glass p-6 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.25),transparent_70%)] blur-2xl opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-teal text-white shadow-glow">
              <CalendarDays className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
            <p className="mt-1 font-head text-4xl font-bold text-foreground">{stats.today}</p>
            <p className="mt-2 text-xs text-muted-foreground">Click to view</p>
          </div>
        </button>

        <button
          onClick={handleScheduledClick}
          disabled={stats.scheduled === 0}
          className="group relative overflow-hidden rounded-2xl glass p-6 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.25),transparent_70%)] blur-2xl opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-violet to-brand-indigo text-white shadow-glow">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
            <p className="mt-1 font-head text-4xl font-bold text-foreground">{stats.scheduled}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <span>{stats.scheduled > 0 ? 'Click to view' : 'No appointments'}</span>
              {stats.scheduled > 0 && <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />}
            </p>
          </div>
        </button>

        <button
          onClick={handleCompletedClick}
          disabled={stats.completed === 0}
          className="group relative overflow-hidden rounded-2xl glass p-6 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.25),transparent_70%)] blur-2xl opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-teal to-brand-cyan text-white shadow-glow">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            <p className="mt-1 font-head text-4xl font-bold text-foreground">{stats.completed}</p>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <span>{stats.completed > 0 ? 'Click to view' : 'No appointments'}</span>
              {stats.completed > 0 && <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />}
            </p>
          </div>
        </button>
      </Reveal>

      {/* Calendar and Appointments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendar */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-head text-xl font-bold text-foreground">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} aria-label="Previous month" className="rounded-lg bg-foreground/5 px-3 py-1 text-foreground transition-colors hover:bg-foreground/10">←</button>
              <button onClick={handleNextMonth} aria-label="Next month" className="rounded-lg bg-foreground/5 px-3 py-1 text-foreground transition-colors hover:bg-foreground/10">→</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {dayNames.map(day => (
              <div key={day} className="py-2 text-center text-sm font-semibold text-muted-foreground">{day}</div>
            ))}

            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  aria-label={`${monthNames[currentMonth.getMonth()]} ${day}${hasAppointments(day) ? ', has appointments' : ''}`}
                  aria-pressed={isSelected(day)}
                  className={cn(
                    'relative flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition-colors',
                    isSelected(day)
                      ? 'bg-gradient-to-br from-brand-cyan to-brand-teal text-white shadow-glow'
                      : isToday(day)
                        ? 'bg-brand-cyan/15 text-brand-cyan-fg'
                        : 'text-foreground hover:bg-foreground/5',
                    hasAppointments(day) ? 'font-bold' : ''
                  )}
                >
                  {day}
                  {hasAppointments(day) && !isSelected(day) && (
                    <span aria-hidden="true" className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-cyan"></span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Appointments for Selected Date */}
        <Card className="p-6">
          <h2 className="mb-4 font-head text-xl font-bold text-foreground">
            Appointments for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h2>

          {filteredAppointments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No appointments scheduled for this date
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map(apt => (
                <div key={apt._id} className="rounded-lg border border-border bg-foreground/5 p-4 transition-colors hover:border-brand-cyan">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{apt.patientId?.name || 'Unknown Patient'}</div>
                      <div className="text-sm text-muted-foreground">{apt.timeSlot}</div>
                    </div>
                    <Badge variant={
                      apt.status === 'Completed' ? 'success' :
                      apt.status === 'Scheduled' ? 'default' : 'outline'
                    }>
                      {apt.status}
                    </Badge>
                  </div>
                  <button
                    onClick={() => navigate('/doctor/appointments')}
                    className="text-sm text-brand-cyan-fg hover:underline"
                  >
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
