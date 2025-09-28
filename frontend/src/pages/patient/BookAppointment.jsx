import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FiSearch, FiCalendar, FiClock, FiX, FiMapPin } from 'react-icons/fi';
import { AppSelect, Calendar } from '../../components/ui';
import { KERALA_DISTRICTS } from '../../constants';

export default function BookAppointment() {
  const { user } = useAuth();
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filterDistrict, setFilterDistrict] = useState(user?.district || '');
  const [selectedSpecId, setSelectedSpecId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({ date: '', timeSlot: '' });
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  // Smart availability state
  const [availableDates, setAvailableDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loadingDates, setLoadingDates] = useState(false);

  const todayIsoDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Fetch doctors with search and filters
  const fetchDoctors = async (search = '', district = filterDistrict, specializationId = selectedSpecId) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (district) params.append('district', district);
      if (search.trim()) params.append('search', search.trim());
      if (specializationId) params.append('specializationId', specializationId);
      
      const response = await api.get(`/patients/doctors?${params.toString()}`);
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available dates for a doctor in a specific month
  const fetchAvailableDates = async (doctorId, date = currentMonth) => {
    if (!doctorId) {
      setAvailableDates([]);
      return;
    }

    try {
      setLoadingDates(true);
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      const year = date.getFullYear();
      
      const response = await api.get(`/doctors/${doctorId}/available-dates?month=${month}&year=${year}`);
      setAvailableDates(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch available dates:", error);
      toast.error('Failed to load available dates');
      setAvailableDates([]);
    } finally {
      setLoadingDates(false);
    }
  };

  // Handle date selection from calendar
  const handleDateSelect = (dateStr) => {
    console.log('Date selected:', dateStr);
    setForm({ ...form, date: dateStr, timeSlot: '' });
  };

  // Handle month change from calendar
  const handleCalendarMonthChange = (newMonth) => {
    setCurrentMonth(newMonth);
  };

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const specRes = await api.get('/specializations');
        setSpecializations(specRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch specializations:", error);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch doctors when filters change
  useEffect(() => {
    fetchDoctors(searchQuery, filterDistrict, selectedSpecId);
  }, [filterDistrict, selectedSpecId]);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      fetchDoctors(searchQuery, filterDistrict, selectedSpecId);
    }, 500); // 500ms delay
    
    setSearchTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'date') {
      // Check if the selected date is available
      if (selectedDoctor && value && !availableDates.includes(value)) {
        toast.error('This date is not available for the selected doctor. Please choose another date.');
        return;
      }
      setForm({ ...form, date: value, timeSlot: '' });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Handle month navigation for the date picker
  const handleMonthChange = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with:', { date: form.date, timeSlot: form.timeSlot });
    
    if (!selectedDoctor || !form.date || !form.timeSlot) {
      toast.error('Please complete all fields.');
      return;
    }
    
    setBooking(true);
    const loadingToast = toast.loading('Booking appointment...');
    
    try {
      await api.post('/patients/appointments', {
        doctorId: selectedDoctor.userId._id,
        date: new Date(form.date),
        timeSlot: form.timeSlot,
      });
      toast.dismiss(loadingToast);
      toast.success('Appointment booked successfully!');
      setSelectedDoctor(null);
      setForm({ date: '', timeSlot: '' });
      setAvailableSlots([]);
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage = error.response?.data?.message || 'Booking failed.';
      if (errorMessage.includes('not available')) {
        toast.error('This time slot is no longer available.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setBooking(false);
    }
  };

  // Clear search when district changes
  useEffect(() => {
    setSearchQuery('');
  }, [filterDistrict]);

  // Fetch available dates when doctor is selected or month changes
  useEffect(() => {
    if (selectedDoctor) {
      fetchAvailableDates(selectedDoctor.userId._id, currentMonth);
    } else {
      setAvailableDates([]);
      // Clear selected date if no doctor is selected
      if (form.date) {
        setForm({ ...form, date: '', timeSlot: '' });
      }
    }
  }, [selectedDoctor, currentMonth]);

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDoctor || !form.date) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const response = await api.get(`/doctors/${selectedDoctor.userId._id}/available-slots?date=${form.date}`);
        setAvailableSlots(response.data.data || []);
      } catch (error) {
        console.error('Error fetching available slots:', error);
        setAvailableSlots([]);
        toast.error('Failed to load available time slots');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDoctor, form.date]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Find Your Doctor</h1>
        <p className="text-text-secondary">Book your next appointment with ease.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="md:col-span-1 bg-white p-4 rounded-xl shadow-card space-y-4 self-start">
          <h2 className="font-semibold text-text-primary border-b pb-2">Filters</h2>
          <AppSelect
            label="District"
            placeholder="All Districts"
            value={filterDistrict}
            onChange={setFilterDistrict}
            options={[{ value: '', label: 'All Districts' }, ...KERALA_DISTRICTS.map(d => ({ value: d, label: d }))]}
            icon={FiMapPin}
            searchable
            searchPlaceholder="Search districts..."
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Specialization</label>
            <div className="space-y-1">
              {[{ _id: null, name: 'All' }, ...specializations].map(spec => (
                <button key={spec._id || 'all'}
                  onClick={() => setSelectedSpecId(spec._id)}
                  className={`w-full text-left p-2 text-sm rounded-md transition-colors ${selectedSpecId === spec._id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-primary/5'}`}>
                  {spec.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Doctor List */}
        <div className="md:col-span-3 space-y-4">
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-xl shadow-card">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search doctors by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-page border border-slate-300/70 rounded-lg h-12 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="text-center p-6">Loading doctors...</div>
          ) : doctors.length > 0 ? (
            doctors.map(doc => (
              <div key={doc.userId._id} className="bg-white p-4 rounded-xl shadow-card flex items-center justify-between transition-shadow hover:shadow-lg">
                <div className="flex items-center">
                  <img src={doc.photoUrl || 'https://i.pravatar.cc/150'} alt={doc.userId.name} className="w-16 h-16 rounded-full mr-4 object-cover" />
                  <div>
                    <h3 className="font-bold text-lg text-text-primary">{doc.userId.name}</h3>
                    <p className="text-sm text-primary font-medium">{doc.specializationId?.name}</p>
                    <p className="text-xs text-text-secondary mt-1">{doc.qualifications}</p>
                    <p className="text-sm font-semibold mt-1 text-yellow-500">{typeof doc.averageRating === 'number' ? `${doc.averageRating} ★` : 'No rating'}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedDoctor(doc)} className="bg-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-primary-light transition-transform hover:scale-105">
                  View Availability
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-card text-center text-text-secondary">
              <FiSearch className="mx-auto text-4xl mb-2" />
              <p>
                {searchQuery.trim() 
                  ? `No doctors found matching "${searchQuery}".` 
                  : "No doctors found for your selected filters."
                }
              </p>
              {searchQuery.trim() && (
                <p className="text-sm mt-2">Try a different search term or clear your search.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in-fast">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setSelectedDoctor(null)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
              <FiX size={24} />
            </button>
            <div className="flex items-center mb-6">
              <img src={selectedDoctor.photoUrl || 'https://i.pravatar.cc/150'} alt={selectedDoctor.userId.name} className="w-20 h-20 rounded-full mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-text-primary">{selectedDoctor.userId.name}</h2>
                <p className="text-primary font-medium">{selectedDoctor.specializationId?.name}</p>
              </div>
            </div>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-secondary">Select Date</label>
                <Calendar
                  selectedDate={form.date}
                  onDateSelect={handleDateSelect}
                  availableDates={availableDates}
                  minDate={todayIsoDate}
                  loading={loadingDates}
                  onMonthChange={handleCalendarMonthChange}
                  className="w-full"
                />
              </div>
              <AppSelect
                label="Time Slot"
                placeholder={loadingSlots ? "Loading slots..." : availableSlots.length === 0 && form.date ? "No slots available" : "Select a time"}
                value={form.timeSlot}
                onChange={(value) => setForm({ ...form, timeSlot: value })}
                options={availableSlots.map(slot => ({ value: slot, label: slot }))}
                icon={FiClock}
                required
                disabled={!form.date || loadingSlots}
                searchPlaceholder="Search time slots..."
              />
              
              {/* Appointment Summary */}
              {form.date && form.timeSlot && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Appointment Summary</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p><span className="font-medium">Doctor:</span> {selectedDoctor.userId.name}</p>
                    <p><span className="font-medium">Specialization:</span> {selectedDoctor.specializationId?.name}</p>
                    <p><span className="font-medium">Date:</span> {new Date(form.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p><span className="font-medium">Time:</span> {form.timeSlot}</p>
                  </div>
                </div>
              )}
              
              <button 
                type="submit"
                disabled={booking || !form.date || !form.timeSlot} 
                className="w-full bg-primary text-white font-bold h-12 rounded-lg disabled:opacity-50 hover:bg-primary-light transition-all"
              >
                {booking ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>
          <style>{`.animate-fade-in-fast { animation: fade-in 0.2s ease-out forwards; }`}</style>
        </div>
      )}
    </div>
  );
}