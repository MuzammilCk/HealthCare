import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCopy, FiTrash2, FiSave, FiX, FiPlus, FiGrid } from 'react-icons/fi';
import api from '../../services/api';

// --- Helper Components (can be moved to separate files) ---

const TimePicker = ({ value, onChange }) => (
  <input
    type="time"
    value={value}
    onChange={onChange}
    className="bg-primary/10 text-primary font-medium rounded-md p-2 w-full text-center focus:outline-none focus:ring-2 focus:ring-primary"
  />
);

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-bg-card-dark rounded-xl shadow-lg dark:shadow-card-dark p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-text-primary-dark">{title}</h3>
        <p className="text-text-secondary dark:text-text-secondary-dark mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-error text-white">Confirm</button>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, onUndo, onDismiss }) => (
  <div className="fixed bottom-5 right-5 bg-dark-charcoal text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-4 animate-fade-in">
    <p>{message}</p>
    {onUndo && <button onClick={onUndo} className="font-bold hover:underline">Undo</button>}
    <button onClick={onDismiss}><FiX /></button>
  </div>
);

// --- Main Availability Component ---

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const presets = {
  'Full Day (9-5)': [['09:00', '17:00']],
  'Morning Only': [['09:00', '13:00']],
  'Afternoon Only': [['14:00', '18:00']],
};

export default function ManageAvailability() {
  const [availability, setAvailability] = useState(
    weekDays.reduce((acc, day) => ({ ...acc, [day.toLowerCase()]: [] }), {})
  );
  const [lastSaved, setLastSaved] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [modal, setModal] = useState({ isOpen: false });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch initial data
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/doctors/profile');
        const existing = res.data?.data?.availability || [];
        
        const newAvail = weekDays.reduce((acc, day) => {
          const found = existing.find(d => d.day === day);
          // FIX: Ensure backend's "09:00-17:00" string is parsed into an array ["09:00", "17:00"]
          acc[day.toLowerCase()] = found ? (found.slots || []).map(s => s.split('-')) : [];
          return acc;
        }, {});

        setAvailability(newAvail);
        setLastSaved(JSON.parse(JSON.stringify(newAvail))); // Deep copy for undo
      } catch (error) {
        console.error("Failed to fetch availability:", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // --- Slot Management ---
  const handleSlotChange = (day, slotIndex, timeIndex, value) => {
    const daySlots = [...availability[day]];
    daySlots[slotIndex][timeIndex] = value;
    setAvailability({ ...availability, [day]: daySlots });
  };
  
  const addSlot = (day) => {
    const daySlots = [...(availability[day] || []), ['09:00', '10:00']];
    setAvailability({ ...availability, [day]: daySlots });
  };

  const removeSlot = (day, slotIndex) => {
    const daySlots = availability[day].filter((_, i) => i !== slotIndex);
    setAvailability({ ...availability, [day]: daySlots });
  };
  
  // --- Batch Actions & Presets ---
  /**
   * Applies a preset to a given list of days.
   * @param {string} presetName - The name of the preset (e.g., 'Full Day (9-5)').
   * @param {string[]} daysToApply - An array of day names in lowercase (e.g., ['monday', 'tuesday']).
   */
  const applyPresetToDays = (presetName, daysToApply) => {
    const newAvail = { ...availability };
    const presetSlots = presets[presetName];
    daysToApply.forEach(day => {
      newAvail[day] = JSON.parse(JSON.stringify(presetSlots));
    });
    setAvailability(newAvail);
  };
  
  const copyToWeekdays = (sourceDay) => {
    const slotsToCopy = availability[sourceDay];
    const newAvail = { ...availability };
    weekDays.slice(0, 5).forEach(day => {
      newAvail[day.toLowerCase()] = JSON.parse(JSON.stringify(slotsToCopy));
    });
    setAvailability(newAvail);
  };
  
  const clearAll = () => {
    setModal({
      isOpen: true,
      title: "Clear All Slots?",
      message: "Are you sure you want to remove all availability for the entire week?",
      onConfirm: () => {
        setAvailability(weekDays.reduce((acc, day) => ({ ...acc, [day.toLowerCase()]: [] }), {}));
        setModal({ isOpen: false });
      },
    });
  };

  // --- Data Saving & Feedback ---
  const handleSave = async () => {
    setIsSaving(true);
    const payload = {
      availability: weekDays.map(day => ({
        day: day,
        // Re-join the slots array into the "09:00-17:00" string format for the backend
        slots: (availability[day.toLowerCase()] || []).map(slot => slot.join('-'))
      })).filter(d => d.slots.length > 0)
    };
    
    console.log('Saving availability with payload:', payload);
    
    try {
      const response = await api.put('/doctors/availability', payload);
      console.log('Save response:', response);
      setLastSaved(JSON.parse(JSON.stringify(availability)));
      toast.success('Availability updated successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (error) {
      console.error('Save error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(`Failed to update availability: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUndo = () => {
    setAvailability(lastSaved);
    setShowToast(false);
  };

  if (isLoading) return <div className="text-center p-8">Loading your schedule...</div>;

  return (
    <div className="lg:flex gap-6 items-start">
      <ConfirmationModal {...modal} onCancel={() => setModal({ isOpen: false })} />
      {showToast && <Toast message="Availability updated." onUndo={handleUndo} onDismiss={() => setShowToast(false)} />}
      
      {/* Main Weekly Schedule */}
      <div className="flex-1 bg-white dark:bg-bg-card-dark p-4 rounded-xl shadow-card dark:shadow-card-dark space-y-4">
        {weekDays.map(day => {
          const dayKey = day.toLowerCase();
          return (
            <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              <div className="font-bold text-text-primary md:text-right md:mt-2">{day}</div>
              <div className="md:col-span-3">
                <div className="flex flex-wrap gap-3">
                  {(availability[dayKey] || []).map((slot, i) => (
                    <div key={i} className="bg-bg-page rounded-lg p-2 shadow-sm relative flex items-center gap-2">
                      <TimePicker value={slot[0]} onChange={(e) => handleSlotChange(dayKey, i, 0, e.target.value)} />
                      <span>-</span>
                      <TimePicker value={slot[1]} onChange={(e) => handleSlotChange(dayKey, i, 1, e.target.value)} />
                      <button onClick={() => removeSlot(dayKey, i)} className="text-gray-400 hover:text-error">
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                   <button onClick={() => addSlot(dayKey)} className="text-sm flex items-center justify-center gap-1 text-primary hover:bg-primary/10 py-2 px-3 rounded-md">
                    <FiPlus size={14} /> Add Slot
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Actions Sidebar */}
      <div className="w-full lg:w-64 mt-6 lg:mt-0 bg-white dark:bg-bg-card-dark p-4 rounded-xl shadow-card dark:shadow-card-dark space-y-4">
        <h2 className="text-lg font-bold text-text-primary dark:text-text-primary-dark">Quick Actions</h2>
        
        {/* --- IMPROVED PRESETS SECTION --- */}
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><FiGrid /> Apply a Preset</h3>
          {Object.keys(presets).map(p => (
            <div key={p} className="p-2 border-t">
              <span className="text-sm font-medium">{p}</span>
              <div className="flex gap-2 mt-1">
                <button onClick={() => applyPresetToDays(p, weekDays.slice(0, 5).map(d => d.toLowerCase()))} className="w-full text-xs text-center p-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20">Weekdays</button>
                <button onClick={() => applyPresetToDays(p, weekDays.map(d => d.toLowerCase()))} className="w-full text-xs text-center p-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20">All Week</button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Batch Actions</h3>
          <div className="space-y-2">
            <button onClick={() => copyToWeekdays('monday')} className="w-full text-sm flex items-center gap-2 p-2 rounded-md hover:bg-primary/10">
              <FiCopy /> Copy Monday to weekdays
            </button>
            <button onClick={clearAll} className="w-full text-sm flex items-center gap-2 p-2 rounded-md text-error hover:bg-error/10">
              <FiTrash2 /> Clear All Slots
            </button>
          </div>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="w-full bg-primary text-white font-bold h-12 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
          <FiSave /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}