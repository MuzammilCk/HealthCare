import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardStatsSkeleton, AppointmentSkeleton } from '../../components/ui/SkeletonLoader';

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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary-dark mb-2">Doctor Dashboard</h1>
          <p className="text-gray-600 dark:text-text-secondary-dark">Manage your practice and patient care</p>
        </div>
        <DashboardStatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-text-primary-dark mb-4">Today's Appointments</h2>
            <AppointmentSkeleton count={3} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-text-primary-dark mb-4">Recent Activity</h2>
            <AppointmentSkeleton count={3} />
          </div>
        </div>
      </div>
    );
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <h1 className="text-h2 font-bold mb-4 text-gray-900 dark:text-text-primary-dark">Doctor Dashboard</h1>
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
      
      {/* Stats Cards - Clickable */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <button
          onClick={handleTodayClick}
          className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left group"
        >
          <div className="text-blue-100 text-sm font-medium mb-1">Today's Appointments</div>
          <div className="text-4xl font-bold text-white mb-2">{stats.today}</div>
          <div className="text-blue-100 text-xs flex items-center gap-1">
            <span>Click to view</span>
          </div>
        </button>
        
        <button
          onClick={handleScheduledClick}
          disabled={stats.scheduled === 0}
          className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <div className="text-orange-100 text-sm font-medium mb-1">Scheduled</div>
          <div className="text-4xl font-bold text-white mb-2">{stats.scheduled}</div>
          <div className="text-orange-100 text-xs flex items-center gap-1">
            <span>{stats.scheduled > 0 ? 'Click to view' : 'No appointments'}</span>
            {stats.scheduled > 0 && <span className="group-hover:translate-x-1 transition-transform">→</span>}
          </div>
        </button>
        
        <button
          onClick={handleCompletedClick}
          disabled={stats.completed === 0}
          className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 text-left group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <div className="text-green-100 text-sm font-medium mb-1">Completed</div>
          <div className="text-4xl font-bold text-white mb-2">{stats.completed}</div>
          <div className="text-green-100 text-xs flex items-center gap-1">
            <span>{stats.completed > 0 ? 'Click to view' : 'No appointments'}</span>
            {stats.completed > 0 && <span className="group-hover:translate-x-1 transition-transform">→</span>}
          </div>
        </button>
      </div>

      {/* Calendar and Appointments */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-white dark:bg-bg-card-dark p-6 rounded-xl shadow-card dark:shadow-card-dark">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-text-primary-dark">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="px-3 py-1 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-surface-hover text-gray-700 dark:text-text-primary-dark rounded">←</button>
              <button onClick={handleNextMonth} className="px-3 py-1 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-surface-hover text-gray-700 dark:text-text-primary-dark rounded">→</button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">{day}</div>
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
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors relative
                    ${isSelected(day) ? 'bg-primary text-white' : 
                      isToday(day) ? 'bg-blue-100 text-blue-900' : 
                      'hover:bg-gray-100'}
                    ${hasAppointments(day) ? 'font-bold' : ''}
                  `}
                >
                  {day}
                  {hasAppointments(day) && !isSelected(day) && (
                    <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Appointments for Selected Date */}
        <div className="bg-white dark:bg-bg-card-dark p-6 rounded-xl shadow-card dark:shadow-card-dark">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-text-primary-dark">
            Appointments for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h2>
          
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-text-secondary-dark">
              No appointments scheduled for this date
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map(apt => (
                <div key={apt._id} className="p-4 border border-gray-200 dark:border-dark-border rounded-lg hover:border-primary dark:hover:border-primary-light transition-colors bg-white dark:bg-dark-surface">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-text-primary-dark">{apt.patientId?.name || 'Unknown Patient'}</div>
                      <div className="text-sm text-gray-600 dark:text-text-secondary-dark">{apt.timeSlot}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      apt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      apt.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/doctor/appointments')}
                    className="text-sm text-primary hover:underline"
                  >
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}