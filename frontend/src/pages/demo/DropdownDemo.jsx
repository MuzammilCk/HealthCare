import { useState } from 'react';
import {
  User,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  Search,
  Filter,
} from 'lucide-react';
import { AppSelect, Button } from '../../components/ui';
import { KERALA_DISTRICTS } from '../../constants';

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
    <div className="mx-auto max-w-4xl space-y-8 bg-background p-6 text-foreground">
      <div className="text-center">
        <h1 className="font-head text-3xl font-bold tracking-tight text-foreground">AppSelect Component Demo</h1>
        <p className="text-muted-foreground">Modern, accessible dropdown design system for healthcare SaaS</p>
      </div>

      {/* Basic Examples */}
      <div className="rounded-xl glass p-6 shadow-card">
        <h2 className="mb-4 font-head text-xl font-semibold text-foreground">Basic Examples</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AppSelect
            label="District"
            placeholder="Select your district"
            value={selectedDistrict}
            onChange={setSelectedDistrict}
            options={KERALA_DISTRICTS.map(d => ({ value: d, label: d }))}
            icon={MapPin}
            required
          />

          <AppSelect
            label="Specialization"
            placeholder="Choose specialization"
            value={selectedSpecialization}
            onChange={setSelectedSpecialization}
            options={specializations}
            icon={Briefcase}
          />
        </div>
      </div>

      {/* Searchable Examples */}
      <div className="rounded-xl glass p-6 shadow-card">
        <h2 className="mb-4 font-head text-xl font-semibold text-foreground">Searchable Dropdowns</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AppSelect
            label="Search Districts"
            placeholder="Search and select district"
            value={selectedDistrict}
            onChange={setSelectedDistrict}
            options={KERALA_DISTRICTS.map(d => ({ value: d, label: d }))}
            icon={Search}
            searchable
            searchPlaceholder="Type to search districts..."
          />

          <AppSelect
            label="Time Slots"
            placeholder="Select appointment time"
            value={selectedTimeSlot}
            onChange={setSelectedTimeSlot}
            options={timeSlots.map(slot => ({ value: slot, label: slot }))}
            icon={Clock}
            searchable
            searchPlaceholder="Search time slots..."
          />
        </div>
      </div>

      {/* Grouped Options */}
      <div className="rounded-xl glass p-6 shadow-card">
        <h2 className="mb-4 font-head text-xl font-semibold text-foreground">Grouped Options</h2>
        <AppSelect
          label="Cities by State"
          placeholder="Select a city"
          value={selectedGrouped}
          onChange={setSelectedGrouped}
          options={groupedOptions}
          icon={MapPin}
          grouped
          groupKey="group"
          searchable
          searchPlaceholder="Search cities..."
        />
      </div>

      {/* Size Variants */}
      <div className="rounded-xl glass p-6 shadow-card">
        <h2 className="mb-4 font-head text-xl font-semibold text-foreground">Size Variants</h2>
        <div className="space-y-4">
          <AppSelect
            label="Small Size"
            placeholder="Small dropdown"
            options={specializations}
            size="sm"
            icon={User}
          />

          <AppSelect
            label="Medium Size (Default)"
            placeholder="Medium dropdown"
            options={specializations}
            size="md"
            icon={User}
          />

          <AppSelect
            label="Large Size"
            placeholder="Large dropdown"
            options={specializations}
            size="lg"
            icon={User}
          />
        </div>
      </div>

      {/* Style Variants */}
      <div className="rounded-xl glass p-6 shadow-card">
        <h2 className="mb-4 font-head text-xl font-semibold text-foreground">Style Variants</h2>
        <div className="space-y-4">
          <AppSelect
            label="Default Style"
            placeholder="Default variant"
            options={specializations}
            variant="default"
            icon={Filter}
          />

          <AppSelect
            label="Outline Style"
            placeholder="Outline variant"
            options={specializations}
            variant="outline"
            icon={Filter}
          />

          <AppSelect
            label="Ghost Style"
            placeholder="Ghost variant"
            options={specializations}
            variant="ghost"
            icon={Filter}
          />
        </div>
      </div>

      {/* Loading States */}
      <div className="rounded-xl glass p-6 shadow-card">
        <h2 className="mb-4 font-head text-xl font-semibold text-foreground">Loading States</h2>
        <div className="space-y-4">
          <AppSelect
            label="Loading Dropdown"
            placeholder="Loading options..."
            options={[]}
            loading={loading}
            icon={Calendar}
          />

          <Button onClick={handleAsyncLoad}>
            {loading ? 'Loading...' : 'Simulate Async Load'}
          </Button>
        </div>
      </div>

      {/* Disabled State */}
      <div className="rounded-xl glass p-6 shadow-card">
        <h2 className="mb-4 font-head text-xl font-semibold text-foreground">Disabled State</h2>
        <AppSelect
          label="Disabled Dropdown"
          placeholder="This dropdown is disabled"
          options={specializations}
          disabled
          icon={User}
        />
      </div>

      {/* Error State */}
      <div className="rounded-xl glass p-6 shadow-card">
        <h2 className="mb-4 font-head text-xl font-semibold text-foreground">Error State</h2>
        <AppSelect
          label="Dropdown with Error"
          placeholder="Select an option"
          options={specializations}
          error="This field is required"
          icon={User}
        />
      </div>

      {/* Current Selections */}
      <div className="rounded-xl bg-foreground/5 p-6">
        <h2 className="mb-4 font-head text-xl font-semibold text-foreground">Current Selections</h2>
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
