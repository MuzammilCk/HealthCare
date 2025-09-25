import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { GoChevronLeft } from 'react-icons/go';

// List of districts in Kerala for the filter dropdown
const districtsOfKerala = ["Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"];

// Main component for booking appointments
export default function BookAppointment() {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // To manage the multi-step process
  const [specializations, setSpecializations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filterDistrict, setFilterDistrict] = useState(user?.district || '');
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({ date: '', timeSlot: '' });
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // Fetch initial data for specializations and doctors
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [specRes, docRes] = await Promise.all([
          api.get('/specializations'),
          api.get(`/patients/doctors?district=${filterDistrict}`),
        ]);
        setSpecializations(specRes.data.data || []);
        setDoctors(docRes.data.data || []);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [filterDistrict]);

  // Handle changes in the form
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Handle booking submission
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !form.date || !form.timeSlot) {
      alert('Please complete all fields to book your appointment.');
      return;
    }
    setBooking(true);
    try {
      await api.post('/patients/appointments', {
        doctorId: selectedDoctor.userId._id,
        date: new Date(form.date),
        timeSlot: form.timeSlot,
      });
      alert('Your appointment has been successfully booked!');
      // Reset to the initial state after booking
      setStep(1);
      setSelectedSpec(null);
      setSelectedDoctor(null);
      setForm({ date: '', timeSlot: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  // Filter doctors based on the selected specialization
  const filteredDoctors = useMemo(() => {
    if (!selectedSpec) return doctors;
    return doctors.filter(doc => doc.specializationId?._id === selectedSpec._id);
  }, [doctors, selectedSpec]);

  // UI components for each step
  const renderContent = () => {
    if (step === 2) {
      return <TimeSlotStep />;
    }
    return <DoctorSelectionStep />;
  };

  // Step 1: Choose a specialization and doctor
  const DoctorSelectionStep = () => (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Specializations List */}
      <div className="w-full md:w-1/4">
        <h2 className="text-lg font-semibold mb-3">Specialities</h2>
        <div className="space-y-2">
          {[{ _id: null, name: 'All' }, ...specializations].map(spec => (
            <button key={spec._id || 'all'}
              onClick={() => setSelectedSpec(spec._id ? spec : null)}
              className={`w-full text-left p-2 rounded-lg transition-colors ${selectedSpec?._id === spec._id ? 'bg-primary text-white' : 'hover:bg-blue-100'}`}>
              {spec.name}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors List */}
      <div className="w-full md:w-3/4">
        <h2 className="text-lg font-semibold mb-3">
          {filteredDoctors.length} doctors available {selectedSpec ? `in ${selectedSpec.name}` : ''}
        </h2>
        <div className="space-y-3">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map(doc => (
              <div key={doc.userId._id} className="flex items-center justify-between p-3 bg-light-gray rounded-lg">
                <div className="flex items-center">
                  <img src={doc.photoUrl || 'https://i.pravatar.cc/150'} alt={doc.userId.name} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <p className="font-bold text-text-primary">{doc.userId.name}</p>
                    <p className="text-sm text-text-secondary">{doc.specializationId?.name}</p>
                    <p className="text-xs text-medium-gray">{doc.qualifications}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedDoctor(doc); setStep(2); }}
                  className="bg-secondary text-white font-bold px-4 py-2 rounded-lg text-sm">
                  Book Now
                </button>
              </div>
            ))
          ) : (
            <p className="text-text-secondary">No doctors available for this selection.</p>
          )}
        </div>
      </div>
    </div>
  );

  // Step 2: Book a time slot
  const TimeSlotStep = () => (
    <div>
      <button onClick={() => setStep(1)} className="flex items-center text-sm text-primary mb-4 font-semibold">
        <GoChevronLeft className="mr-1" />
        Back to Doctor Selection
      </button>
      <div className="flex items-center mb-6">
        <img src={selectedDoctor?.photoUrl || 'https://i.pravatar.cc/150'} alt={selectedDoctor?.userId.name} className="w-16 h-16 rounded-full mr-4" />
        <div>
          <h2 className="text-xl font-bold text-text-primary">{selectedDoctor?.userId.name}</h2>
          <p className="text-text-secondary">{selectedDoctor?.specializationId?.name}</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 md:w-1/2">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Date</label>
          <input type="date" name="date" value={form.date} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Available Time Slots</label>
          <select name="timeSlot" value={form.timeSlot} onChange={onChange} className="w-full border rounded-lg px-3 py-2 h-12">
            <option value="">Select a time</option>
            {(selectedDoctor?.availability || []).map((avail, idx) => (
              <optgroup key={idx} label={avail.day}>
                {avail.slots.map((slot, i) => (
                  <option key={`${idx}-${i}`} value={slot}>{slot}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <button disabled={booking} className="w-full bg-secondary text-white font-bold px-4 py-3 rounded-lg disabled:opacity-50 h-12">
          {booking ? 'Booking...' : 'Confirm Appointment'}
        </button>
      </form>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Book an Appointment</h1>
        <div>
          <label htmlFor="district-filter" className="sr-only">Filter by District</label>
          <select id="district-filter" value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}
            className="border rounded-lg px-3 py-2 h-12 bg-white">
            <option value="">All Districts</option>
            {districtsOfKerala.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-card">
        {loading ? <div>Loading doctors...</div> : renderContent()}
      </div>
    </div>
  );
}