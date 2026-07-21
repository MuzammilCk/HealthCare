import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Reveal from '../../components/Reveal';

// Move these components outside to prevent re-creation on every render
const FormSection = ({ title, children }) => (
  <Reveal className="glass rounded-xl border border-border p-6 shadow-card">
    <h3 className="mb-4 font-head text-lg font-semibold text-foreground">{title}</h3>
    {children}
  </Reveal>
);

const fieldCls = 'w-full rounded-lg border border-border bg-background/60 px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan';

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-muted-foreground">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={fieldCls}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export default function EditMedicalHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientId, patientName } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [formData, setFormData] = useState({
    bloodType: 'Unknown',
    height: '',
    weight: '',
    smokingStatus: 'unknown',
    alcoholConsumption: 'unknown',
    exerciseFrequency: 'unknown',
    allergies: [],
    pastConditions: [],
    currentMedications: [],
    surgeries: [],
    familyHistory: [],
    additionalNotes: ''
  });

  useEffect(() => {
    if (!patientId) {
      toast.error('Patient ID is required');
      navigate('/doctor/appointments');
      return;
    }
    loadMedicalHistory();
  }, [patientId]);

  const loadMedicalHistory = async () => {
    try {
      const response = await api.get(`/medical-history/patient/${patientId}`);
      const data = response.data.data;
      setMedicalHistory(data);

      setFormData({
        bloodType: data.bloodType || 'Unknown',
        height: data.height || '',
        weight: data.weight || '',
        smokingStatus: data.smokingStatus || 'unknown',
        alcoholConsumption: data.alcoholConsumption || 'unknown',
        exerciseFrequency: data.exerciseFrequency || 'unknown',
        allergies: data.allergies || [],
        pastConditions: data.pastConditions || [],
        currentMedications: data.currentMedications || [],
        surgeries: data.surgeries || [],
        familyHistory: data.familyHistory || [],
        additionalNotes: data.additionalNotes || ''
      });
    } catch (error) {
      console.error('Error loading medical history:', error);
      toast.error('Failed to load medical history');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Remove temporary _id fields used for React keys before sending to backend
      const cleanArray = (arr) => arr.map(item => {
        const { _id, ...rest } = item;
        return rest;
      });

      // Prepare data with proper types and clean arrays
      const dataToSend = {
        ...formData,
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        allergies: cleanArray(formData.allergies),
        pastConditions: cleanArray(formData.pastConditions),
        currentMedications: cleanArray(formData.currentMedications),
        surgeries: cleanArray(formData.surgeries),
        familyHistory: cleanArray(formData.familyHistory)
      };

      await api.put(`/medical-history/patient/${patientId}`, dataToSend);
      toast.success('Medical history updated successfully!');
      loadMedicalHistory(); // Reload to show updated status
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error?.response?.data?.message || 'Failed to update medical history');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      await api.post(`/medical-history/patient/${patientId}/approve`);
      toast.success('Medical history approved successfully!');
      loadMedicalHistory(); // Reload to show approval stamp
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to approve medical history');
    } finally {
      setApproving(false);
    }
  };

  // Array field handlers
  const addAllergy = () => {
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, { _id: Date.now(), name: '', severity: 'moderate', reaction: '', diagnosedDate: '' }]
    }));
  };

  const removeAllergy = (index) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const updateAllergy = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      pastConditions: [...prev.pastConditions, { _id: Date.now(), name: '', diagnosedDate: '', status: 'active', notes: '' }]
    }));
  };

  const removeCondition = (index) => {
    setFormData(prev => ({
      ...prev,
      pastConditions: prev.pastConditions.filter((_, i) => i !== index)
    }));
  };

  const updateCondition = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      pastConditions: prev.pastConditions.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      currentMedications: [...prev.currentMedications, { _id: Date.now(), name: '', dosage: '', frequency: '', startDate: '', endDate: '', prescribedBy: '' }]
    }));
  };

  const removeMedication = (index) => {
    setFormData(prev => ({
      ...prev,
      currentMedications: prev.currentMedications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      currentMedications: prev.currentMedications.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addSurgery = () => {
    setFormData(prev => ({
      ...prev,
      surgeries: [...prev.surgeries, { _id: Date.now(), name: '', date: '', hospital: '', notes: '' }]
    }));
  };

  const removeSurgery = (index) => {
    setFormData(prev => ({
      ...prev,
      surgeries: prev.surgeries.filter((_, i) => i !== index)
    }));
  };

  const updateSurgery = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      surgeries: prev.surgeries.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addFamilyHistory = () => {
    setFormData(prev => ({
      ...prev,
      familyHistory: [...prev.familyHistory, { _id: Date.now(), condition: '', relationship: '', notes: '' }]
    }));
  };

  const removeFamilyHistory = (index) => {
    setFormData(prev => ({
      ...prev,
      familyHistory: prev.familyHistory.filter((_, i) => i !== index)
    }));
  };

  const updateFamilyHistory = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      familyHistory: prev.familyHistory.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-brand-cyan"></div>
          <p className="text-muted-foreground">Loading medical history...</p>
        </div>
      </div>
    );
  }

  const rowInputCls = 'rounded-lg border border-border bg-background/60 px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan';
  const addBtnCls = 'flex items-center gap-2 rounded-lg border border-brand-cyan px-4 py-2 text-brand-cyan-fg transition-colors hover:bg-brand-cyan/10';
  const removeBtnCls = 'rounded-lg p-2 text-error-fg transition-colors hover:bg-error/10';

  return (
    <div className="mx-auto max-w-6xl space-y-6 bg-background text-foreground">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/doctor/appointments')}
            className="rounded-lg p-2 transition-colors hover:bg-foreground/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-head text-3xl font-bold tracking-tight text-foreground">Edit Medical History</h1>
            <p className="text-muted-foreground">Patient: {patientName || 'Unknown'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || approving}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-brand-cyan to-brand-teal px-6 py-3 text-white shadow-glow transition-all hover:brightness-110 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
          <button
            onClick={handleApprove}
            disabled={saving || approving || medicalHistory?.approvalStatus === 'approved'}
            className="flex items-center gap-2 rounded-lg bg-success px-6 py-3 text-white transition-all hover:brightness-110 disabled:opacity-50"
            title={medicalHistory?.approvalStatus === 'approved' ? 'Already approved' : 'Approve medical history'}
          >
            {approving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Approving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Approve
              </>
            )}
          </button>
        </div>
      </div>

      {/* Approval Status Banner */}
      {medicalHistory?.approvalStatus === 'approved' && medicalHistory?.approvedBy && (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4">
          <div className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 text-success-fg" />
            <div>
              <p className="font-semibold text-success-fg">Medical History Approved</p>
              <p className="mt-1 text-sm text-success/80">
                Approved by <span className="font-semibold">Dr. {medicalHistory.approvedBy.name}</span> on {new Date(medicalHistory.approvedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Correction Request Banner */}
      {medicalHistory?.correctionRequested && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-500" />
            <div>
              <p className="font-semibold text-amber-500">Patient Requested Correction</p>
              <p className="mt-1 text-sm text-amber-500/80">
                Requested on {new Date(medicalHistory.correctionRequestDate).toLocaleDateString()}
              </p>
              {medicalHistory.correctionRequestMessage && (
                <div className="mt-2 rounded border border-amber-400/30 bg-foreground/5 p-3">
                  <p className="text-sm font-medium text-muted-foreground">Patient's Message:</p>
                  <p className="mt-1 text-sm italic text-foreground">
                    "{medicalHistory.correctionRequestMessage}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <FormSection title="Basic Information">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SelectField
            label="Blood Type"
            value={formData.bloodType}
            onChange={(value) => setFormData(prev => ({ ...prev, bloodType: value }))}
            options={[
              { value: 'Unknown', label: 'Unknown' },
              { value: 'A+', label: 'A+' },
              { value: 'A-', label: 'A-' },
              { value: 'B+', label: 'B+' },
              { value: 'B-', label: 'B-' },
              { value: 'AB+', label: 'AB+' },
              { value: 'AB-', label: 'AB-' },
              { value: 'O+', label: 'O+' },
              { value: 'O-', label: 'O-' }
            ]}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Height (cm)</label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
              className={fieldCls}
              placeholder="170"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Weight (kg)</label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
              className={fieldCls}
              placeholder="70"
            />
          </div>
        </div>
      </FormSection>

      {/* Lifestyle */}
      <FormSection title="Lifestyle Information">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SelectField
            label="Smoking Status"
            value={formData.smokingStatus}
            onChange={(value) => setFormData(prev => ({ ...prev, smokingStatus: value }))}
            options={[
              { value: 'unknown', label: 'Unknown' },
              { value: 'never', label: 'Never' },
              { value: 'former', label: 'Former' },
              { value: 'current', label: 'Current' }
            ]}
          />
          <SelectField
            label="Alcohol Consumption"
            value={formData.alcoholConsumption}
            onChange={(value) => setFormData(prev => ({ ...prev, alcoholConsumption: value }))}
            options={[
              { value: 'unknown', label: 'Unknown' },
              { value: 'none', label: 'None' },
              { value: 'occasional', label: 'Occasional' },
              { value: 'moderate', label: 'Moderate' },
              { value: 'heavy', label: 'Heavy' }
            ]}
          />
          <SelectField
            label="Exercise Frequency"
            value={formData.exerciseFrequency}
            onChange={(value) => setFormData(prev => ({ ...prev, exerciseFrequency: value }))}
            options={[
              { value: 'unknown', label: 'Unknown' },
              { value: 'none', label: 'None' },
              { value: 'rarely', label: 'Rarely' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'daily', label: 'Daily' }
            ]}
          />
        </div>
      </FormSection>

      {/* Allergies */}
      <FormSection title="Allergies">
        <div className="space-y-3">
          {formData.allergies.map((allergy, index) => (
            <div key={allergy._id || `allergy-${index}`} className="flex items-start gap-3 rounded-lg bg-error/5 p-4">
              <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-4">
                <input
                  type="text"
                  placeholder="Allergy name"
                  value={allergy.name}
                  onChange={(e) => updateAllergy(index, 'name', e.target.value)}
                  className={rowInputCls}
                />
                <select
                  value={allergy.severity}
                  onChange={(e) => updateAllergy(index, 'severity', e.target.value)}
                  className={rowInputCls}
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
                <input
                  type="text"
                  placeholder="Reaction"
                  value={allergy.reaction}
                  onChange={(e) => updateAllergy(index, 'reaction', e.target.value)}
                  className={rowInputCls}
                />
                <input
                  type="date"
                  value={allergy.diagnosedDate ? new Date(allergy.diagnosedDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => updateAllergy(index, 'diagnosedDate', e.target.value)}
                  className={rowInputCls}
                />
              </div>
              <button
                onClick={() => removeAllergy(index)}
                className={removeBtnCls}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            onClick={addAllergy}
            className={addBtnCls}
          >
            <Plus className="h-4 w-4" />
            Add Allergy
          </button>
        </div>
      </FormSection>

      {/* Past Conditions */}
      <FormSection title="Past Medical Conditions">
        <div className="space-y-3">
          {formData.pastConditions.map((condition, index) => (
            <div key={condition._id || `condition-${index}`} className="flex items-start gap-3 rounded-lg bg-brand-sky/5 p-4">
              <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-4">
                <input
                  type="text"
                  placeholder="Condition name"
                  value={condition.name}
                  onChange={(e) => updateCondition(index, 'name', e.target.value)}
                  className={rowInputCls}
                />
                <input
                  type="date"
                  value={condition.diagnosedDate ? new Date(condition.diagnosedDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => updateCondition(index, 'diagnosedDate', e.target.value)}
                  className={rowInputCls}
                />
                <select
                  value={condition.status}
                  onChange={(e) => updateCondition(index, 'status', e.target.value)}
                  className={rowInputCls}
                >
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="chronic">Chronic</option>
                </select>
                <input
                  type="text"
                  placeholder="Notes"
                  value={condition.notes}
                  onChange={(e) => updateCondition(index, 'notes', e.target.value)}
                  className={rowInputCls}
                />
              </div>
              <button
                onClick={() => removeCondition(index)}
                className={removeBtnCls}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            onClick={addCondition}
            className={addBtnCls}
          >
            <Plus className="h-4 w-4" />
            Add Condition
          </button>
        </div>
      </FormSection>

      {/* Current Medications */}
      <FormSection title="Current Medications">
        <div className="space-y-3">
          {formData.currentMedications.map((medication, index) => (
            <div key={medication._id || `medication-${index}`} className="flex items-start gap-3 rounded-lg bg-brand-violet/5 p-4">
              <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  type="text"
                  placeholder="Medication name"
                  value={medication.name}
                  onChange={(e) => updateMedication(index, 'name', e.target.value)}
                  className={rowInputCls}
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  value={medication.dosage}
                  onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                  className={rowInputCls}
                />
                <input
                  type="text"
                  placeholder="Frequency"
                  value={medication.frequency}
                  onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                  className={rowInputCls}
                />
              </div>
              <button
                onClick={() => removeMedication(index)}
                className={removeBtnCls}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            onClick={addMedication}
            className={addBtnCls}
          >
            <Plus className="h-4 w-4" />
            Add Medication
          </button>
        </div>
      </FormSection>

      {/* Surgeries */}
      <FormSection title="Surgical History">
        <div className="space-y-3">
          {formData.surgeries.map((surgery, index) => (
            <div key={surgery._id || `surgery-${index}`} className="flex items-start gap-3 rounded-lg border border-border bg-foreground/5 p-4">
              <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  type="text"
                  placeholder="Surgery name"
                  value={surgery.name}
                  onChange={(e) => updateSurgery(index, 'name', e.target.value)}
                  className={rowInputCls}
                />
                <input
                  type="date"
                  value={surgery.date ? new Date(surgery.date).toISOString().split('T')[0] : ''}
                  onChange={(e) => updateSurgery(index, 'date', e.target.value)}
                  className={rowInputCls}
                />
                <input
                  type="text"
                  placeholder="Hospital"
                  value={surgery.hospital}
                  onChange={(e) => updateSurgery(index, 'hospital', e.target.value)}
                  className={rowInputCls}
                />
              </div>
              <button
                onClick={() => removeSurgery(index)}
                className={removeBtnCls}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            onClick={addSurgery}
            className={addBtnCls}
          >
            <Plus className="h-4 w-4" />
            Add Surgery
          </button>
        </div>
      </FormSection>

      {/* Family History */}
      <FormSection title="Family Medical History">
        <div className="space-y-3">
          {formData.familyHistory.map((item, index) => (
            <div key={item._id || `family-${index}`} className="flex items-start gap-3 rounded-lg bg-success/5 p-4">
              <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-3">
                <input
                  type="text"
                  placeholder="Condition"
                  value={item.condition}
                  onChange={(e) => updateFamilyHistory(index, 'condition', e.target.value)}
                  className={rowInputCls}
                />
                <input
                  type="text"
                  placeholder="Relationship"
                  value={item.relationship}
                  onChange={(e) => updateFamilyHistory(index, 'relationship', e.target.value)}
                  className={rowInputCls}
                />
                <input
                  type="text"
                  placeholder="Notes"
                  value={item.notes}
                  onChange={(e) => updateFamilyHistory(index, 'notes', e.target.value)}
                  className={rowInputCls}
                />
              </div>
              <button
                onClick={() => removeFamilyHistory(index)}
                className={removeBtnCls}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          <button
            onClick={addFamilyHistory}
            className={addBtnCls}
          >
            <Plus className="h-4 w-4" />
            Add Family History
          </button>
        </div>
      </FormSection>

      {/* Additional Notes */}
      <FormSection title="Additional Notes">
        <textarea
          value={formData.additionalNotes}
          onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
          placeholder="Any additional medical information..."
          rows={5}
          className={fieldCls}
        />
      </FormSection>
    </div>
  );
}
