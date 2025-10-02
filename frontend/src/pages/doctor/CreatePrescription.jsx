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
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Prescription</h1>
        <p className="text-gray-600">Write and manage prescriptions for your patients</p>
      </div>

      {/* Appointment Selection - Compact */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl shadow-sm mb-4 border border-blue-100">
        <AppSelect
          label="Select Appointment"
          placeholder="Choose a completed appointment"
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
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Patient Info - Compact Card */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <FiUser className="text-white text-lg" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedAppointment.patientId?.name}</h3>
                <p className="text-sm text-gray-500">{selectedAppointment.patientId?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Medications - Compact & Attractive */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                <FiFileText className="text-blue-600" /> 
                Medications
              </h3>
              <button 
                type="button" 
                onClick={addMedication} 
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="text-sm" /> Add
              </button>
            </div>
            
            <div className="space-y-3">
              {medications.map((med, index) => (
                <div key={index} className="relative bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full">
                      {index + 1}
                    </span>
                    <span className="text-xs font-medium text-gray-600">Medication Details</span>
                    {medications.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeMedication(index)} 
                        className="ml-auto text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input 
                      type="text" 
                      placeholder="Medicine name" 
                      value={med.name} 
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)} 
                      className="w-full bg-white border border-gray-300 rounded-lg h-9 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Dosage (e.g., 500mg)" 
                      value={med.dosage} 
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)} 
                      className="w-full bg-white border border-gray-300 rounded-lg h-9 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Instructions" 
                      value={med.instructions} 
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)} 
                      className="w-full bg-white border border-gray-300 rounded-lg h-9 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button - Attractive */}
          <button 
            type="submit"
            disabled={saving} 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold h-12 rounded-xl disabled:opacity-50 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
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