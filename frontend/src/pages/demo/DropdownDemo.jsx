import { useState } from 'react';
import { FiUser, FiMapPin, FiBriefcase, FiCalendar, FiClock, FiSearch, FiFilter } from 'react-icons/fi';
import { AppSelect } from '../../components/ui';

const districtsOfKerala = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", 
  "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", 
  "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"
];

const specializations = [
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'surgery', label: 'Surgery' }
];

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
  '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
];

const groupedOptions = [
  { value: 'kerala-tvm', label: 'Thiruvananthapuram', group: 'Kerala' },
  { value: 'kerala-klm', label: 'Kollam', group: 'Kerala' },
  { value: 'kerala-pta', label: 'Pathanamthitta', group: 'Kerala' },
  { value: 'tamil-chennai', label: 'Chennai', group: 'Tamil Nadu' },
  { value: 'tamil-coimbatore', label: 'Coimbatore', group: 'Tamil Nadu' },
  { value: 'karnataka-bangalore', label: 'Bangalore', group: 'Karnataka' },
  { value: 'karnataka-mysore', label: 'Mysore', group: 'Karnataka' }
];

export default function DropdownDemo() {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedGrouped, setSelectedGrouped] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsyncLoad = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AppSelect Component Demo</h1>
        <p className="text-gray-600">Modern, accessible dropdown design system for healthcare SaaS</p>
      </div>

      {/* Basic Examples */}
      <div className="bg-white p-6 rounded-xl shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AppSelect
            label="District"
            placeholder="Select your district"
            value={selectedDistrict}
            onChange={setSelectedDistrict}
            options={districtsOfKerala.map(d => ({ value: d, label: d }))}
            icon={FiMapPin}
            required
          />
          
          <AppSelect
            label="Specialization"
            placeholder="Choose specialization"
            value={selectedSpecialization}
            onChange={setSelectedSpecialization}
            options={specializations}
            icon={FiBriefcase}
          />
        </div>
      </div>

      {/* Searchable Examples */}
      <div className="bg-white p-6 rounded-xl shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Searchable Dropdowns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AppSelect
            label="Search Districts"
            placeholder="Search and select district"
            value={selectedDistrict}
            onChange={setSelectedDistrict}
            options={districtsOfKerala.map(d => ({ value: d, label: d }))}
            icon={FiSearch}
            searchable
            searchPlaceholder="Type to search districts..."
          />
          
          <AppSelect
            label="Time Slots"
            placeholder="Select appointment time"
            value={selectedTimeSlot}
            onChange={setSelectedTimeSlot}
            options={timeSlots.map(slot => ({ value: slot, label: slot }))}
            icon={FiClock}
            searchable
            searchPlaceholder="Search time slots..."
          />
        </div>
      </div>

      {/* Grouped Options */}
      <div className="bg-white p-6 rounded-xl shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Grouped Options</h2>
        <AppSelect
          label="Cities by State"
          placeholder="Select a city"
          value={selectedGrouped}
          onChange={setSelectedGrouped}
          options={groupedOptions}
          icon={FiMapPin}
          grouped
          groupKey="group"
          searchable
          searchPlaceholder="Search cities..."
        />
      </div>

      {/* Size Variants */}
      <div className="bg-white p-6 rounded-xl shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Size Variants</h2>
        <div className="space-y-4">
          <AppSelect
            label="Small Size"
            placeholder="Small dropdown"
            options={specializations}
            size="sm"
            icon={FiUser}
          />
          
          <AppSelect
            label="Medium Size (Default)"
            placeholder="Medium dropdown"
            options={specializations}
            size="md"
            icon={FiUser}
          />
          
          <AppSelect
            label="Large Size"
            placeholder="Large dropdown"
            options={specializations}
            size="lg"
            icon={FiUser}
          />
        </div>
      </div>

      {/* Style Variants */}
      <div className="bg-white p-6 rounded-xl shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Style Variants</h2>
        <div className="space-y-4">
          <AppSelect
            label="Default Style"
            placeholder="Default variant"
            options={specializations}
            variant="default"
            icon={FiFilter}
          />
          
          <AppSelect
            label="Outline Style"
            placeholder="Outline variant"
            options={specializations}
            variant="outline"
            icon={FiFilter}
          />
          
          <AppSelect
            label="Ghost Style"
            placeholder="Ghost variant"
            options={specializations}
            variant="ghost"
            icon={FiFilter}
          />
        </div>
      </div>

      {/* Loading States */}
      <div className="bg-white p-6 rounded-xl shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Loading States</h2>
        <div className="space-y-4">
          <AppSelect
            label="Loading Dropdown"
            placeholder="Loading options..."
            options={[]}
            loading={loading}
            icon={FiCalendar}
          />
          
          <button
            onClick={handleAsyncLoad}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {loading ? 'Loading...' : 'Simulate Async Load'}
          </button>
        </div>
      </div>

      {/* Disabled State */}
      <div className="bg-white p-6 rounded-xl shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Disabled State</h2>
        <AppSelect
          label="Disabled Dropdown"
          placeholder="This dropdown is disabled"
          options={specializations}
          disabled
          icon={FiUser}
        />
      </div>

      {/* Error State */}
      <div className="bg-white p-6 rounded-xl shadow-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Error State</h2>
        <AppSelect
          label="Dropdown with Error"
          placeholder="Select an option"
          options={specializations}
          error="This field is required"
          icon={FiUser}
        />
      </div>

      {/* Current Selections */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Selections</h2>
        <div className="space-y-2 text-sm">
          <p><strong>District:</strong> {selectedDistrict || 'None selected'}</p>
          <p><strong>Specialization:</strong> {selectedSpecialization || 'None selected'}</p>
          <p><strong>Time Slot:</strong> {selectedTimeSlot || 'None selected'}</p>
          <p><strong>Grouped Selection:</strong> {selectedGrouped || 'None selected'}</p>
        </div>
      </div>
    </div>
  );
}
