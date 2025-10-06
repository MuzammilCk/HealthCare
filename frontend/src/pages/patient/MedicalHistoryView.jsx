import { useEffect, useState } from 'react';
import { FiAlertCircle, FiEdit3, FiX, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function MedicalHistoryView() {
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionMessage, setCorrectionMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  const loadMedicalHistory = async () => {
    try {
      const response = await api.get('/medical-history/me');
      setMedicalHistory(response.data.data);
    } catch (error) {
      console.error('Error loading medical history:', error);
      toast.error('Failed to load medical history');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCorrection = async () => {
    if (!correctionMessage.trim()) {
      toast.error('Please enter a correction message');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/medical-history/me/request-correction', {
        message: correctionMessage
      });
      toast.success('Correction request submitted successfully!');
      setShowCorrectionModal(false);
      setCorrectionMessage('');
      loadMedicalHistory(); // Reload to show updated status
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit correction request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading medical history...</p>
        </div>
      </div>
    );
  }

  const InfoSection = ({ title, children, isEmpty }) => (
    <div className="bg-white dark:bg-bg-card-dark rounded-lg border border-gray-200 dark:border-dark-border p-6">
      <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark mb-4">{title}</h3>
      {isEmpty ? (
        <p className="text-text-secondary dark:text-text-secondary-dark italic">No information available</p>
      ) : (
        children
      )}
    </div>
  );

  const InfoItem = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-text-secondary">{label}:</span>
      <span className="font-medium text-text-primary">{value || 'Not specified'}</span>
    </div>
  );

  const ListItem = ({ item, type }) => {
    if (type === 'allergy') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-red-900">{item.name}</p>
              {item.reaction && <p className="text-sm text-red-700">Reaction: {item.reaction}</p>}
            </div>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              item.severity === 'severe' ? 'bg-red-200 text-red-900' :
              item.severity === 'moderate' ? 'bg-yellow-200 text-yellow-900' :
              'bg-green-200 text-green-900'
            }`}>
              {item.severity}
            </span>
          </div>
        </div>
      );
    }

    if (type === 'condition') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-blue-900">{item.name}</p>
              {item.notes && <p className="text-sm text-blue-700">{item.notes}</p>}
            </div>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              item.status === 'active' ? 'bg-red-200 text-red-900' :
              item.status === 'chronic' ? 'bg-orange-200 text-orange-900' :
              'bg-green-200 text-green-900'
            }`}>
              {item.status}
            </span>
          </div>
        </div>
      );
    }

    if (type === 'medication') {
      return (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-2">
          <p className="font-semibold text-purple-900">{item.name}</p>
          <div className="text-sm text-purple-700 mt-1">
            {item.dosage && <span>Dosage: {item.dosage}</span>}
            {item.frequency && <span className="ml-3">Frequency: {item.frequency}</span>}
          </div>
        </div>
      );
    }

    if (type === 'surgery') {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
          <p className="font-semibold text-gray-900">{item.name}</p>
          <div className="text-sm text-gray-700 mt-1">
            {item.date && <span>Date: {new Date(item.date).toLocaleDateString()}</span>}
            {item.hospital && <span className="ml-3">Hospital: {item.hospital}</span>}
          </div>
        </div>
      );
    }

    if (type === 'family') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
          <div className="flex justify-between">
            <p className="font-semibold text-green-900">{item.condition}</p>
            <span className="text-sm text-green-700">{item.relationship}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Medical History</h1>
          <p className="text-text-secondary">Your complete medical records (Read-only)</p>
        </div>
        <button
          onClick={() => setShowCorrectionModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
        >
          <FiEdit3 className="w-4 h-4" />
          Request a Correction
        </button>
      </div>

      {/* Approval Status Banner */}
      {medicalHistory?.approvalStatus === 'approved' && medicalHistory?.approvedBy && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FiCheck className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Medical History Approved</p>
              <p className="text-sm text-green-700 mt-1">
                Approved by <span className="font-semibold">Dr. {medicalHistory.approvedBy.name}</span> on {new Date(medicalHistory.approvedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {medicalHistory?.correctionRequested && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">Correction Request Pending</p>
              <p className="text-sm text-yellow-700 mt-1">
                Your correction request is being reviewed by medical staff.
              </p>
              {medicalHistory.correctionRequestMessage && (
                <p className="text-sm text-yellow-800 mt-2 italic">
                  "{medicalHistory.correctionRequestMessage}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <InfoSection title="Basic Information">
          <InfoItem label="Blood Type" value={medicalHistory?.bloodType} />
          <InfoItem label="Height" value={medicalHistory?.height ? `${medicalHistory.height} cm` : null} />
          <InfoItem label="Weight" value={medicalHistory?.weight ? `${medicalHistory.weight} kg` : null} />
        </InfoSection>

        {/* Lifestyle */}
        <InfoSection title="Lifestyle Information">
          <InfoItem label="Smoking Status" value={medicalHistory?.smokingStatus} />
          <InfoItem label="Alcohol Consumption" value={medicalHistory?.alcoholConsumption} />
          <InfoItem label="Exercise Frequency" value={medicalHistory?.exerciseFrequency} />
        </InfoSection>
      </div>

      {/* Allergies */}
      <InfoSection 
        title="Allergies" 
        isEmpty={!medicalHistory?.allergies || medicalHistory.allergies.length === 0}
      >
        {medicalHistory?.allergies?.map((allergy, index) => (
          <ListItem key={index} item={allergy} type="allergy" />
        ))}
      </InfoSection>

      {/* Past Conditions */}
      <InfoSection 
        title="Past Medical Conditions" 
        isEmpty={!medicalHistory?.pastConditions || medicalHistory.pastConditions.length === 0}
      >
        {medicalHistory?.pastConditions?.map((condition, index) => (
          <ListItem key={index} item={condition} type="condition" />
        ))}
      </InfoSection>

      {/* Current Medications */}
      <InfoSection 
        title="Current Medications" 
        isEmpty={!medicalHistory?.currentMedications || medicalHistory.currentMedications.length === 0}
      >
        {medicalHistory?.currentMedications?.map((medication, index) => (
          <ListItem key={index} item={medication} type="medication" />
        ))}
      </InfoSection>

      {/* Surgeries */}
      <InfoSection 
        title="Surgical History" 
        isEmpty={!medicalHistory?.surgeries || medicalHistory.surgeries.length === 0}
      >
        {medicalHistory?.surgeries?.map((surgery, index) => (
          <ListItem key={index} item={surgery} type="surgery" />
        ))}
      </InfoSection>

      {/* Family History */}
      <InfoSection 
        title="Family Medical History" 
        isEmpty={!medicalHistory?.familyHistory || medicalHistory.familyHistory.length === 0}
      >
        {medicalHistory?.familyHistory?.map((item, index) => (
          <ListItem key={index} item={item} type="family" />
        ))}
      </InfoSection>

      {/* Additional Notes */}
      {medicalHistory?.additionalNotes && (
        <InfoSection title="Additional Notes">
          <p className="text-text-primary whitespace-pre-wrap">{medicalHistory.additionalNotes}</p>
        </InfoSection>
      )}

      {/* Audit Information */}
      {(medicalHistory?.createdBy || medicalHistory?.lastUpdatedBy) && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          {medicalHistory.createdBy && (
            <p>Created by: {medicalHistory.createdBy.name} ({medicalHistory.createdBy.role})</p>
          )}
          {medicalHistory.lastUpdatedBy && (
            <p>Last updated by: {medicalHistory.lastUpdatedBy.name} ({medicalHistory.lastUpdatedBy.role})</p>
          )}
          {medicalHistory.updatedAt && (
            <p>Last updated: {new Date(medicalHistory.updatedAt).toLocaleString()}</p>
          )}
        </div>
      )}

      {/* Correction Request Modal */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-bg-card-dark rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">Request a Correction</h2>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <p className="text-text-secondary mb-4">
              Please describe what needs to be corrected in your medical history. 
              A medical professional will review your request.
            </p>

            <textarea
              value={correctionMessage}
              onChange={(e) => setCorrectionMessage(e.target.value)}
              placeholder="Describe the correction needed..."
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowCorrectionModal(false);
                  setCorrectionMessage('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-text-primary rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestCorrection}
                disabled={submitting || !correctionMessage.trim()}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
