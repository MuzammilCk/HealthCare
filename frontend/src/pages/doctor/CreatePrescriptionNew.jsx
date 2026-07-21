import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, User, Plus, Trash2, Calendar, Search, ShoppingCart, Pencil, Package, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { AppSelect } from '../../components/ui';
import Reveal from '../../components/Reveal';

export default function CreatePrescriptionNew() {
  const location = useLocation();
  const navigate = useNavigate();

  // State
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Prescription data
  const [billedMedicines, setBilledMedicines] = useState([]);
  const [prescribedOnlyMedicines, setPrescribedOnlyMedicines] = useState([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  // Doctor fee is prepaid at appointment booking; no manual entry here

  // Inventory search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [location.state]);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/doctors/appointments');
      const eligibleAppts = (res.data.data || []).filter(
        a => a.status === 'Completed' && !a.prescriptionGenerated
      );
      setAppointments(eligibleAppts);

      // Pre-select if navigated from another page
      const apptIdFromState = location.state?.appointmentId;
      if (apptIdFromState) {
        const preselect = eligibleAppts.find(a => a._id === apptIdFromState);
        if (preselect) setSelectedAppointment(preselect);
      }
    } catch (e) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Search inventory
  const searchInventory = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearching(true);
    try {
      const res = await api.get(`/inventory/search?query=${encodeURIComponent(query)}`);
      setSearchResults(res.data.medicines || []);
      setShowSearchResults(true);
    } catch (e) {
      console.error('Search error:', e);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInventory(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Add medicine from inventory to billed items
  const addBilledMedicine = (inventoryItem) => {
    const newMedicine = {
      medicineName: inventoryItem.medicineName,
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1,
      price: inventoryItem.price,
      stockQuantity: inventoryItem.stockQuantity,
      unit: inventoryItem.unit
    };
    setBilledMedicines([...billedMedicines, newMedicine]);
    setSearchQuery('');
    setShowSearchResults(false);
    toast.success(`${inventoryItem.medicineName} added to billed items`);
  };

  // Update billed medicine
  const updateBilledMedicine = (index, field, value) => {
    const updated = [...billedMedicines];
    updated[index][field] = value;
    setBilledMedicines(updated);
  };

  // Remove billed medicine
  const removeBilledMedicine = (index) => {
    setBilledMedicines(billedMedicines.filter((_, i) => i !== index));
  };

  // Add prescribed-only medicine
  const addPrescribedOnly = () => {
    setPrescribedOnlyMedicines([
      ...prescribedOnlyMedicines,
      {
        medicineName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: 1
      }
    ]);
  };

  // Update prescribed-only medicine
  const updatePrescribedOnly = (index, field, value) => {
    const updated = [...prescribedOnlyMedicines];
    updated[index][field] = value;
    setPrescribedOnlyMedicines(updated);
  };

  // Remove prescribed-only medicine
  const removePrescribedOnly = (index) => {
    setPrescribedOnlyMedicines(prescribedOnlyMedicines.filter((_, i) => i !== index));
  };

  // Calculate total
  const calculateTotal = () => {
    // Total is only medicines; consultation fee is prepaid at booking
    return billedMedicines.reduce((sum, med) => {
      return sum + (med.price * med.quantity);
    }, 0);
  };

  // Submit prescription
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAppointment) {
      toast.error('Please select an appointment');
      return;
    }

    // Validate billed medicines
    const validBilledMeds = billedMedicines.filter(m =>
      m.medicineName && m.dosage && m.frequency && m.duration && m.quantity > 0
    );

    // Validate prescribed-only medicines
    const validPrescribedOnly = prescribedOnlyMedicines.filter(m =>
      m.medicineName && m.dosage && m.frequency && m.duration
    );

    if (validBilledMeds.length === 0 && validPrescribedOnly.length === 0) {
      toast.error('Please add at least one medicine');
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading('Creating prescription and generating bill...');

    try {
      const payload = {
        appointmentId: selectedAppointment._id,
        billedMedicines: validBilledMeds,
        prescribedOnlyMedicines: validPrescribedOnly,
        diagnosis,
        notes,
        generateBill: validBilledMeds.length > 0
      };

      const res = await api.post('/doctors/prescriptions', payload);

      toast.dismiss(loadingToast);

      console.log('Prescription response:', res.data);

      if (res.data.data.billGenerated && res.data.data.bill) {
        toast.success('Prescription created and bill generated successfully!');
        console.log('Redirecting to bill:', res.data.data.bill._id);
        // Redirect to bill view
        navigate(`/doctor/bills/${res.data.data.bill._id}`);
      } else {
        toast.success('Prescription created successfully! No bill generated.');
        console.log('No bill generated, redirecting to appointments');
        navigate('/doctor/appointments');
      }
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error(e.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="bg-background p-6 text-center text-muted-foreground">Loading appointments...</div>;
  }

  const inputCls = 'w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan';

  return (
    <div className="mx-auto max-w-6xl space-y-6 bg-background text-foreground">
      <Reveal>
        <h1 className="flex items-center font-head text-3xl font-bold tracking-tight text-foreground">
          <FileText className="mr-3 text-brand-cyan-fg" />
          Create Smart Prescription
        </h1>
      </Reveal>

      {/* Appointment Selection */}
      <Reveal className="glass rounded-xl p-6 shadow-card">
        <AppSelect
          label="Select Completed Appointment"
          placeholder="-- Select an appointment --"
          value={selectedAppointment?._id || ''}
          onChange={(value) => setSelectedAppointment(appointments.find(a => a._id === value))}
          options={appointments.map(a => ({
            value: a._id,
            label: `${new Date(a.date).toLocaleDateString()} - ${a.timeSlot} - ${a.patientId?.name}`
          }))}
          icon={Calendar}
          searchable
          searchPlaceholder="Search appointments..."
        />

        {appointments.length === 0 && (
          <div className="mt-4 flex items-start rounded-lg border border-amber-400/30 bg-amber-400/10 p-4">
            <AlertCircle className="mr-3 mt-1 flex-shrink-0 text-amber-500" />
            <div className="text-sm text-amber-600">
              No eligible appointments found. Only completed appointments without prescriptions can be selected.
            </div>
          </div>
        )}
      </Reveal>

      {selectedAppointment && (
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Patient Details */}
          <Reveal className="glass rounded-xl p-6 shadow-card">
            <h3 className="mb-4 flex items-center font-semibold text-lg text-foreground">
              <User className="mr-2 text-brand-cyan-fg" /> Patient Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Name:</span>{' '}
                <span className="text-foreground">{selectedAppointment.patientId?.name}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Email:</span>{' '}
                <span className="text-foreground">{selectedAppointment.patientId?.email}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Date:</span>{' '}
                <span className="text-foreground">
                  {new Date(selectedAppointment.date).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Time:</span>{' '}
                <span className="text-foreground">{selectedAppointment.timeSlot}</span>
              </div>
            </div>
          </Reveal>

          {/* Diagnosis & Notes */}
          <Reveal className="glass rounded-xl p-6 shadow-card">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Diagnosis
                </label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes or instructions"
                  rows={3}
                  className={`${inputCls} p-4`}
                />
              </div>
            </div>
          </Reveal>

          {/* Billed Items Section */}
          <Reveal className="glass rounded-xl p-6 shadow-card">
            <h3 className="mb-4 flex items-center font-semibold text-lg text-foreground">
              <ShoppingCart className="mr-2 text-brand-cyan-fg" />
              Billed Items (From Hospital Inventory)
            </h3>

            {/* Inventory Search */}
            <div className="relative mb-6">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Search Hospital Inventory
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  placeholder="Type medicine name to search..."
                  className="h-12 w-full rounded-lg border border-border bg-background/60 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan"
                />
                {searching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-cyan border-t-transparent" />
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="glass absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-border shadow-glow">
                  {searchResults.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => addBilledMedicine(item)}
                      className="w-full border-b border-border p-4 text-left transition-colors last:border-b-0 hover:bg-foreground/5"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-foreground">{item.medicineName}</div>
                          {item.genericName && (
                            <div className="text-sm text-muted-foreground">{item.genericName}</div>
                          )}
                          <div className="mt-1 text-sm text-muted-foreground">
                            ₹{(item.price / 100).toFixed(2)} per {item.unit}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            item.stockQuantity > 10 ? 'text-success-fg' : 'text-amber-500'
                          }`}>
                            {item.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.stockQuantity} available
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {showSearchResults && searchQuery && searchResults.length === 0 && !searching && (
                <div className="glass absolute z-10 mt-2 w-full rounded-lg border border-border p-4 text-center text-muted-foreground shadow-glow">
                  No medicines found
                </div>
              )}
            </div>

            {/* Billed Medicines List */}
            {billedMedicines.length > 0 ? (
              <div className="space-y-4">
                {billedMedicines.map((med, index) => (
                  <div key={index} className="relative rounded-lg border border-border p-4">
                    <button
                      type="button"
                      onClick={() => removeBilledMedicine(index)}
                      className="absolute right-2 top-2 p-1 text-error-fg transition-colors hover:text-error-fg hover:bg-error/10"
                    >
                      <Trash2 />
                    </button>

                    <div className="mb-3">
                      <div className="flex items-center font-medium text-foreground">
                        <Package className="mr-2 text-brand-cyan-fg" />
                        {med.medicineName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ₹{(med.price / 100).toFixed(2)} per {med.unit} • Stock: {med.stockQuantity}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) => updateBilledMedicine(index, 'dosage', e.target.value)}
                        className={`${inputCls} h-10`}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Frequency"
                        value={med.frequency}
                        onChange={(e) => updateBilledMedicine(index, 'frequency', e.target.value)}
                        className={`${inputCls} h-10`}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) => updateBilledMedicine(index, 'duration', e.target.value)}
                        className={`${inputCls} h-10`}
                        required
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={med.quantity}
                        onChange={(e) => updateBilledMedicine(index, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        max={med.stockQuantity}
                        className={`${inputCls} h-10`}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Instructions"
                        value={med.instructions}
                        onChange={(e) => updateBilledMedicine(index, 'instructions', e.target.value)}
                        className={`${inputCls} h-10`}
                      />
                    </div>

                    <div className="mt-2 text-right text-sm font-medium text-brand-cyan-fg">
                      Subtotal: ₹{((med.price * med.quantity) / 100).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Package className="mx-auto mb-2 text-4xl opacity-50" />
                <p>No billed items added yet. Search inventory to add medicines.</p>
              </div>
            )}
          </Reveal>

          {/* Prescribed-Only Items Section */}
          <Reveal className="glass rounded-xl p-6 shadow-card">
            <h3 className="mb-4 flex items-center font-semibold text-lg text-foreground">
              <Pencil className="mr-2 text-brand-cyan-fg" />
              Prescribed-Only Items (Not Billed)
            </h3>

            {prescribedOnlyMedicines.length > 0 ? (
              <div className="mb-4 space-y-4">
                {prescribedOnlyMedicines.map((med, index) => (
                  <div key={index} className="relative rounded-lg border border-border bg-foreground/5 p-4">
                    <button
                      type="button"
                      onClick={() => removePrescribedOnly(index)}
                      className="absolute right-2 top-2 p-1 text-error-fg transition-colors hover:text-error-fg hover:bg-error/10"
                    >
                      <Trash2 />
                    </button>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                      <input
                        type="text"
                        placeholder="Medicine Name"
                        value={med.medicineName}
                        onChange={(e) => updatePrescribedOnly(index, 'medicineName', e.target.value)}
                        className={`${inputCls} h-10`}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={med.dosage}
                        onChange={(e) => updatePrescribedOnly(index, 'dosage', e.target.value)}
                        className={`${inputCls} h-10`}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Frequency"
                        value={med.frequency}
                        onChange={(e) => updatePrescribedOnly(index, 'frequency', e.target.value)}
                        className={`${inputCls} h-10`}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) => updatePrescribedOnly(index, 'duration', e.target.value)}
                        className={`${inputCls} h-10`}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Instructions"
                        value={med.instructions}
                        onChange={(e) => updatePrescribedOnly(index, 'instructions', e.target.value)}
                        className={`${inputCls} h-10`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-muted-foreground">
                No prescribed-only medicines added
              </div>
            )}
            <button
              type="button"
              onClick={addPrescribedOnly}
              className="flex items-center text-sm font-semibold text-brand-cyan-fg transition-colors hover:text-brand-cyan-fg"
            >
              <Plus className="mr-1" /> Add Prescribed-Only Medicine
            </button>
          </Reveal>

          {/* Doctor Fee removed: prepaid at booking */}

          {/* Bill Summary */}
          {billedMedicines.length > 0 && (
            <Reveal className="rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 p-6">
              <h3 className="mb-4 font-semibold text-lg text-foreground">Bill Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medicines Total:</span>
                  <span className="font-medium text-foreground">
                    ₹{(billedMedicines.reduce((sum, m) => sum + (m.price * m.quantity), 0) / 100).toFixed(2)}
                  </span>
                </div>
                {/* Doctor fee removed from summary */}
                <div className="mt-2 flex justify-between border-t border-brand-cyan/20 pt-2 text-lg font-bold text-brand-cyan-fg">
                  <span>Total Amount:</span>
                  <span>₹{(calculateTotal() / 100).toFixed(2)}</span>
                </div>
              </div>
            </Reveal>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/doctor/appointments')}
              className="flex-1 rounded-lg bg-foreground/10 font-bold h-12 text-foreground transition-all hover:bg-foreground/15"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-teal font-bold h-12 text-white shadow-glow transition-all hover:brightness-110 disabled:opacity-50"
            >
              {saving ? 'Creating...' : billedMedicines.length > 0 ? 'Create Prescription & Generate Bill' : 'Create Prescription'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
