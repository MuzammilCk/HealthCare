import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { FiFileText, FiUser, FiPlus, FiTrash2, FiCalendar } from 'react-icons/fi';
import { AppSelect } from '../../components/ui';

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
        const eligibleAppts = (res.data.data || []).filter(a => ['Completed', 'Follow-up'].includes(a.status));
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

  if (loading) return <div className="text-center p-6">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Create Prescription</h1>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-card mb-6">
          <AppSelect
            label="Select Completed Appointment"
            placeholder="-- Select --"
            value={selectedAppointment?._id || ''}
            onChange={(value) => setSelectedAppointment(appointments.find(a => a._id === value))}
            options={appointments.map(a => ({
              value: a._id,
              label: `${new Date(a.date).toLocaleDateString()} - ${a.patientId?.name}`
            }))}
            icon={FiCalendar}
            searchable
            searchPlaceholder="Search appointments..."
            loading={loading}
          />
        </div>

        {selectedAppointment && (
          <form onSubmit={onSubmit}>
            <div className="bg-white p-6 rounded-xl shadow-card mb-6 space-y-6">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg flex items-center"><FiUser className="mr-2 text-primary" /> Patient Details</h3>
                <p><strong>Name:</strong> {selectedAppointment.patientId?.name}</p>
                <p><strong>Email:</strong> {selectedAppointment.patientId?.email}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-4 flex items-center"><FiFileText className="mr-2 text-primary" /> Medication List</h3>
                <div className="space-y-4">
                  {medications.map((med, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-lg relative">
                      <div className="md:col-span-3">
                        <label className="text-sm font-medium text-text-secondary">Medication #{index + 1}</label>
                      </div>
                      <input type="text" placeholder="Medication Name" value={med.name} onChange={(e) => handleMedicationChange(index, 'name', e.target.value)} className="w-full bg-bg-page border border-slate-300/70 rounded-lg h-12 px-3 focus:outline-none" />
                      <input type="text" placeholder="Dosage (e.g., 500mg)" value={med.dosage} onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)} className="w-full bg-bg-page border border-slate-300/70 rounded-lg h-12 px-3 focus:outline-none" />
                      <input type="text" placeholder="Instructions (e.g., Twice a day)" value={med.instructions} onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)} className="w-full bg-bg-page border border-slate-300/70 rounded-lg h-12 px-3 focus:outline-none" />
                      {medications.length > 1 && (
                        <button type="button" onClick={() => removeMedication(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addMedication} className="mt-4 flex items-center text-sm font-semibold text-primary hover:text-primary-light">
                  <FiPlus className="mr-1" /> Add Another Medication
                </button>
              </div>
            </div>

            <button disabled={saving} className="w-full bg-primary text-white font-bold h-12 rounded-lg disabled:opacity-50 hover:bg-primary-light transition-all">
              {saving ? 'Saving Prescription...' : 'Save Prescription'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}