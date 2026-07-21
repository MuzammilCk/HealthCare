import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FileText, User, Plus, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { AppSelect } from '../../components/ui';
import Reveal from '../../components/Reveal';

export default function CreatePrescription() {
  const location = useLocation();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [medications, setMedications] = useState([{ name: '', dosage: '', instructions: '' }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/doctors/appointments');
        const eligibleAppts = (res.data.data || []).filter(a => a.status === 'Completed');
        setAppointments(eligibleAppts);

        // Pre-select if navigated from another page
        const apptIdFromState = location.state?.appointmentId;
        if (apptIdFromState) {
          const preselect = eligibleAppts.find(a => a._id === apptIdFromState);
          if (preselect) setSelectedAppointment(preselect);
        }
      } catch (e) {} finally {
        setLoading(false);
      }
    })();
  }, [location.state]);

  const handleMedicationChange = (index, field, value) => {
    const newMeds = [...medications];
    newMeds[index][field] = value;
    setMedications(newMeds);
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', instructions: '' }]);
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) {
      toast.error('Please select an appointment.');
      return;
    }

    // Filter out empty medication entries before submitting
    const filledMedications = medications.filter(m => m.name && m.dosage && m.instructions);
    if (filledMedications.length === 0) {
      toast.error('Please add at least one complete medication entry.');
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading('Creating prescription...');

    try {
      // Create a prescription for each medication entry
      await Promise.all(filledMedications.map(med =>
        api.post('/doctors/prescriptions', {
          appointmentId: selectedAppointment._id,
          medication: med.name,
          dosage: med.dosage,
          instructions: med.instructions
        })
      ));
      toast.dismiss(loadingToast);
      toast.success('Prescription created successfully!');
      navigate('/doctor/appointments');
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error(e.response?.data?.message || 'Failed to create prescription.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="bg-background p-6 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 bg-background text-foreground">
      <div className="mb-6">
        <h1 className="mb-2 font-head text-3xl font-bold tracking-tight text-foreground">Create Prescription</h1>
        <p className="text-muted-foreground">Write and manage prescriptions for your patients</p>
      </div>

      {/* Appointment Selection - Compact */}
      <Reveal className="glass mb-4 rounded-xl p-4 shadow-card ring-grad">
        <AppSelect
          label="Select Appointment"
          placeholder="Choose a completed appointment"
          value={selectedAppointment?._id || ''}
          onChange={(value) => setSelectedAppointment(appointments.find(a => a._id === value))}
          options={appointments.map(a => ({
            value: a._id,
            label: `${new Date(a.date).toLocaleDateString()} - ${a.patientId?.name}`
          }))}
          icon={Calendar}
          searchable
          searchPlaceholder="Search appointments..."
          loading={loading}
        />
      </Reveal>

      {selectedAppointment && (
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Patient Info - Compact Card */}
          <Reveal className="glass rounded-xl border border-border p-4 shadow-card">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-cyan to-brand-teal text-white">
                <User className="text-lg text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{selectedAppointment.patientId?.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedAppointment.patientId?.email}</p>
              </div>
            </div>
          </Reveal>

          {/* Medications - Compact & Attractive */}
          <Reveal className="glass rounded-xl border border-border p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold text-lg text-foreground">
                <FileText className="text-brand-cyan-fg" />
                Medications
              </h3>
              <button
                type="button"
                onClick={addMedication}
                className="flex items-center gap-1 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-teal px-3 py-1.5 text-sm font-medium text-white transition-all hover:brightness-110"
              >
                <Plus className="text-sm" /> Add
              </button>
            </div>

            <div className="space-y-3">
              {medications.map((med, index) => (
                <div key={index} className="relative rounded-lg border border-border bg-foreground/5 p-3 transition-colors hover:border-brand-cyan">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-cyan to-brand-teal text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">Medication Details</span>
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="ml-auto rounded p-1 text-error-fg transition-colors hover:bg-error/10 hover:text-error-fg"
                      >
                        <Trash2 className="text-sm" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <input
                      type="text"
                      placeholder="Medicine name"
                      value={med.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      className="h-9 w-full rounded-lg border border-border bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g., 500mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      className="h-9 w-full rounded-lg border border-border bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Instructions"
                      value={med.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                      className="h-9 w-full rounded-lg border border-border bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Submit Button - Attractive */}
          <button
            type="submit"
            disabled={saving}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-teal font-semibold text-white shadow-glow transition-all hover:brightness-110 disabled:opacity-50 active:scale-[0.98]"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving Prescription...
              </span>
            ) : (
              'Save Prescription'
            )}
          </button>
        </form>
      )}
    </div>
  );
}
