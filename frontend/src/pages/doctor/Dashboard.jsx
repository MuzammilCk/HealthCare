import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const [stats, setStats] = useState({ today: 0, scheduled: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

  if (loading) return <div>Loading…</div>;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
      
      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-card"><div className="text-medium-gray">Today</div><div className="text-3xl font-bold">{stats.today}</div></div>
        <div className="bg-white p-4 rounded-xl shadow-card"><div className="text-medium-gray">Scheduled</div><div className="text-3xl font-bold">{stats.scheduled}</div></div>
        <div className="bg-white p-4 rounded-xl shadow-card"><div className="text-medium-gray">Completed</div><div className="text-3xl font-bold">{stats.completed}</div></div>
      </div>

      {/* Calendar and Appointments */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded">←</button>
              <button onClick={handleNextMonth} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded">→</button>
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
        <div className="bg-white p-6 rounded-xl shadow-card">
          <h2 className="text-xl font-bold mb-4">
            Appointments for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h2>
          
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No appointments scheduled for this date
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map(apt => (
                <div key={apt._id} className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">{apt.patientId?.name || 'Unknown Patient'}</div>
                      <div className="text-sm text-gray-600">{apt.timeSlot}</div>
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