import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
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
    const loadingToast = toast.loading('Processing payment...');
    
    try {
      // Step 1: Create mock payment order (WITHOUT creating appointment yet)
      const orderRes = await api.post('/mock-payments/create-booking-order', {
        doctorId: selectedDoctor.userId._id,
        date: form.date,
        timeSlot: form.timeSlot,
      });
      
      const order = orderRes.data.order;
      
      // Step 2: Simulate payment processing with user choice
      setTimeout(async () => {
        // Ask user if they want to simulate success or failure
        const wantsToSucceed = window.confirm(
          `Simulate payment?\n\n` +
          `Amount: ₹${(order.amount / 100).toFixed(2)}\n` +
          `Doctor: ${selectedDoctor.userId.name}\n\n` +
          `Click OK for SUCCESS\nClick Cancel for FAILURE`
        );

        if (!wantsToSucceed) {
          // Simulate payment failure
          toast.dismiss(loadingToast);
          toast.error('Payment Failed! Please try again.');
          setBooking(false);
          return;
        }

        try {
          // Step 3: Verify mock payment AND create appointment
          const verifyRes = await api.post('/mock-payments/verify-payment', {
            orderId: order.id,
            paymentId: `pay_${Date.now()}`,
            // Include appointment details for creation after payment
            appointmentDetails: {
              doctorId: selectedDoctor.userId._id,
              date: form.date,
              timeSlot: form.timeSlot,
            }
          });
          
          toast.dismiss(loadingToast);
          toast.success('Payment successful! Appointment confirmed.');
          
          // Redirect to success page
          window.location.href = `/payment-success?order_id=${order.id}`;
        } catch (verifyError) {
          toast.dismiss(loadingToast);
          toast.error('Payment verification failed.');
          setBooking(false);
        }
      }, 1500); // Simulate payment processing delay
      
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage = error.response?.data?.message || 'Booking failed.';
      toast.error(errorMessage);
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
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">Find Your Doctor</h1>
        <p className="text-text-secondary dark:text-text-secondary-dark">Book your next appointment with ease.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="md:col-span-1 bg-white dark:bg-bg-card-dark p-4 rounded-xl shadow-card dark:shadow-card-dark space-y-4 self-start">
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
          <div className="bg-white dark:bg-bg-card-dark p-4 rounded-xl shadow-card dark:shadow-card-dark">
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
              <div key={doc.userId._id} className="bg-white dark:bg-bg-card-dark p-4 rounded-xl shadow-card dark:shadow-card-dark flex items-center justify-between transition-shadow hover:shadow-lg">
                <div className="flex items-center">
                  <img 
                    src={doc.photoUrl ? `http://localhost:5000${doc.photoUrl}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(doc.userId.name) + '&size=150&background=0D8ABC&color=fff'} 
                    alt={doc.userId.name} 
                    className="w-16 h-16 rounded-full mr-4 object-cover border-2 border-gray-200" 
                    onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(doc.userId.name) + '&size=150&background=0D8ABC&color=fff'; }}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-text-primary">{doc.userId.name}</h3>
                    <p className="text-sm text-primary font-medium">{doc.specializationId?.name}</p>
                    {doc.hospitalId && (
                      <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                        <FiMapPin className="w-3 h-3" />
                        {doc.hospitalId.name}, {doc.hospitalId.district}
                      </p>
                    )}
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
            <div className="bg-white dark:bg-bg-card-dark p-6 rounded-xl shadow-card dark:shadow-card-dark text-center text-text-secondary dark:text-text-secondary-dark">
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

      {/* Booking Modal - Viewport Centered (Portal + fixed) */}
      {selectedDoctor && createPortal(
        <>
          {/* Backdrop (covers viewport) */}
          <div
            className="fixed inset-0 z-[1000] bg-white/10 backdrop-blur-sm backdrop-saturate-150 animate-fade-in-fast"
            onClick={() => setSelectedDoctor(null)}
          />

          {/* Modal (centered to viewport, not parent) */}
          <div className="fixed z-[1001] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-bg-card-dark rounded-xl shadow-xl dark:shadow-card-dark p-6">
            <button onClick={() => setSelectedDoctor(null)} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary">
              <FiX size={24} />
            </button>
            <div className="flex items-center mb-6">
              <img 
                src={selectedDoctor.photoUrl ? `http://localhost:5000${selectedDoctor.photoUrl}` : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedDoctor.userId.name) + '&size=200&background=0D8ABC&color=fff'} 
                alt={selectedDoctor.userId.name} 
                className="w-20 h-20 rounded-full mr-4 object-cover border-2 border-gray-200" 
                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedDoctor.userId.name) + '&size=200&background=0D8ABC&color=fff'; }}
              />
              <div>
                <h2 className="text-2xl font-bold text-text-primary">{selectedDoctor.userId.name}</h2>
                <p className="text-primary font-medium">{selectedDoctor.specializationId?.name}</p>
                {selectedDoctor.hospitalId && (
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    <FiMapPin className="w-3 h-3" />
                    {selectedDoctor.hospitalId.name}, {selectedDoctor.hospitalId.district}
                  </p>
                )}
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
              {form.date && form.timeSlot && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Appointment Summary</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p><span className="font-medium">Doctor:</span> {selectedDoctor.userId.name}</p>
                    <p><span className="font-medium">Specialization:</span> {selectedDoctor.specializationId?.name}</p>
                    <p><span className="font-medium">Date:</span> {new Date(form.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><span className="font-medium">Time:</span> {form.timeSlot}</p>
                    <p className="pt-2 border-t border-blue-300 mt-2">
                      <span className="font-medium">Consultation Fee:</span> 
                      <span className="text-lg font-bold ml-2">
                        ₹{((selectedDoctor.consultationFee || 25000) / 100).toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>
              )}
              
              {/* Consultation Fee Display - Prominent */}
              {form.date && form.timeSlot && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-medium">Consultation Fee</p>
                      <p className="text-xs text-green-600">One-time booking charge</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-700">
                        ₹{((selectedDoctor.consultationFee || 25000) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={booking || !form.date || !form.timeSlot} className="w-full bg-primary text-white font-bold h-12 rounded-lg disabled:opacity-50 hover:bg-primary-light transition-all">
                {booking ? 'Processing...' : `Proceed to Payment - ₹${((selectedDoctor.consultationFee || 25000) / 100).toFixed(2)}`}
              </button>
            </form>
          </div>
          <style>{`.animate-fade-in-fast { animation: fade-in 0.2s ease-out forwards; }`}</style>
        </>,
        document.body
      )}
    </div>
  );
}