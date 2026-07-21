import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Copy, Trash2, Save, X, Plus, LayoutGrid } from 'lucide-react';
import api from '../../services/api';
import Reveal from '../../components/Reveal';

// --- Helper Components (can be moved to separate files) ---

const TimePicker = ({ value, onChange }) => (
  <input
    type="time"
    value={value}
    onChange={onChange}
    className="w-full rounded-md bg-brand-cyan/10 p-2 text-center font-medium text-brand-cyan-fg focus:outline-none focus:ring-2 focus:ring-brand-cyan"
  />
);

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="glass w-full max-w-sm rounded-xl p-6 shadow-glow">
        <h3 className="mb-2 font-head text-lg font-bold text-foreground">{title}</h3>
        <p className="mb-6 text-muted-foreground">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg border border-border px-4 py-2 text-foreground transition-colors hover:bg-foreground/5">Cancel</button>
          <button onClick={onConfirm} className="rounded-lg bg-error px-4 py-2 text-white transition-colors hover:brightness-110">Confirm</button>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, onUndo, onDismiss }) => (
  <div className="fixed bottom-5 right-5 flex animate-fade-in items-center gap-4 rounded-lg bg-brand-ink px-5 py-3 text-white shadow-glow">
    <p>{message}</p>
    {onUndo && <button onClick={onUndo} className="font-bold hover:underline">Undo</button>}
    <button onClick={onDismiss}><X /></button>
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

  if (isLoading) return <div className="bg-background p-8 text-center text-muted-foreground">Loading your schedule...</div>;

  return (
    <div className="space-y-6 bg-background text-foreground lg:flex items-start gap-6">
      <ConfirmationModal {...modal} onCancel={() => setModal({ isOpen: false })} />
      {showToast && <Toast message="Availability updated." onUndo={handleUndo} onDismiss={() => setShowToast(false)} />}

      {/* Main Weekly Schedule */}
      <Reveal className="glass flex-1 space-y-4 rounded-xl p-4 shadow-card">
        {weekDays.map(day => {
          const dayKey = day.toLowerCase();
          return (
            <div key={day} className="grid grid-cols-1 items-start gap-4 border-b border-border/60 pb-4 md:grid-cols-4 last:border-b-0 last:pb-0">
              <div className="font-bold text-foreground md:mt-2 md:text-right">{day}</div>
              <div className="md:col-span-3">
                <div className="flex flex-wrap gap-3">
                  {(availability[dayKey] || []).map((slot, i) => (
                    <div key={i} className="relative flex items-center gap-2 rounded-lg bg-foreground/5 p-2 shadow-card">
                      <TimePicker value={slot[0]} onChange={(e) => handleSlotChange(dayKey, i, 0, e.target.value)} />
                      <span className="text-muted-foreground">-</span>
                      <TimePicker value={slot[1]} onChange={(e) => handleSlotChange(dayKey, i, 1, e.target.value)} />
                      <button onClick={() => removeSlot(dayKey, i)} className="text-muted-foreground transition-colors hover:text-error-fg">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addSlot(dayKey)} className="flex items-center justify-center gap-1 rounded-md px-3 py-2 text-sm text-brand-cyan-fg transition-colors hover:bg-brand-cyan/10">
                    <Plus size={14} /> Add Slot
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </Reveal>

      {/* Actions Sidebar */}
      <Reveal className="glass mt-6 w-full space-y-4 rounded-xl p-4 shadow-card lg:mt-0 lg:w-64">
        <h2 className="font-head text-lg font-bold text-foreground">Quick Actions</h2>

        {/* --- IMPROVED PRESETS SECTION --- */}
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><LayoutGrid className="h-4 w-4 text-brand-cyan-fg" /> Apply a Preset</h3>
          {Object.keys(presets).map(p => (
            <div key={p} className="border-t border-border/60 p-2">
              <span className="text-sm font-medium text-foreground">{p}</span>
              <div className="mt-1 flex gap-2">
                <button onClick={() => applyPresetToDays(p, weekDays.slice(0, 5).map(d => d.toLowerCase()))} className="w-full rounded-md bg-brand-cyan/10 p-1 text-xs text-center text-brand-cyan-fg transition-colors hover:bg-brand-cyan/20">Weekdays</button>
                <button onClick={() => applyPresetToDays(p, weekDays.map(d => d.toLowerCase()))} className="w-full rounded-md bg-brand-cyan/10 p-1 text-xs text-center text-brand-cyan-fg transition-colors hover:bg-brand-cyan/20">All Week</button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">Batch Actions</h3>
          <div className="space-y-2">
            <button onClick={() => copyToWeekdays('monday')} className="flex w-full items-center gap-2 rounded-md p-2 text-sm transition-colors hover:bg-brand-cyan/10">
              <Copy className="h-4 w-4 text-brand-cyan-fg" /> Copy Monday to weekdays
            </button>
            <button onClick={clearAll} className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-error-fg transition-colors hover:bg-error/10">
              <Trash2 className="h-4 w-4" /> Clear All Slots
            </button>
          </div>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-teal font-bold text-white shadow-glow transition-all hover:brightness-110 disabled:opacity-50">
          <Save className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </Reveal>
    </div>
  );
}
