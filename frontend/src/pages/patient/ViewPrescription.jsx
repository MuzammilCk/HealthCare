import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiUser, FiFileText, FiDollarSign, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function PatientViewPrescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const res = await api.get(`/patients/prescriptions/${id}`);
        setPrescription(res.data.data);
      } catch (err) {
        toast.error('Failed to load prescription');
        navigate('/patient/prescriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!prescription) {
    return null;
  }

  const billedMedicines = (prescription.medicines || []).filter(m => m.purchaseFromHospital);
  const prescribedOnlyMedicines = (prescription.medicines || []).filter(m => !m.purchaseFromHospital);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/patient/prescriptions')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 w-full">
          <h1 className="text-3xl font-bold text-gray-900">Prescription Details</h1>
          <span className="ml-auto inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border bg-gray-100 text-gray-800 border-gray-200">
            <FiTag className="w-3 h-3" /> {prescription.status || 'New'}
          </span>
        </div>
      </div>

      {/* Prescription Card */}
      <div className="bg-white rounded-xl shadow-card p-6 space-y-6">
        {/* Doctor & Appointment Info */}
        <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiUser className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Prescribed By</div>
              <div className="font-semibold text-gray-900">{prescription.doctorId?.name}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiCalendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Appointment</div>
              <div className="font-semibold text-gray-900">
                {prescription.appointmentId?.date ? new Date(prescription.appointmentId.date).toLocaleDateString() : ''}
              </div>
              <div className="text-sm text-gray-500">{prescription.appointmentId?.timeSlot}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiFileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Date Issued</div>
              <div className="font-semibold text-gray-900">
                {new Date(prescription.dateIssued).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiDollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Doctor Fee</div>
              <div className="font-semibold text-gray-900">
                ₹{(prescription.consultationFee / 100).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Prescribed-Only Medicines */}
        {(prescribedOnlyMedicines.length > 0 || billedMedicines.length > 0) && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Prescribed Medicines{billedMedicines.length === 0 ? ' (Not Billed)' : ''}</h3>
            <div className="space-y-3">
              {(prescribedOnlyMedicines.length > 0 ? prescribedOnlyMedicines : billedMedicines).map((med, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900 mb-2">{med.medicineName}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Dosage:</span> {med.dosage}
                    </div>
                    <div>
                      <span className="text-gray-600">Frequency:</span> {med.frequency}
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span> {med.duration}
                    </div>
                  </div>
                  {med.instructions && (
                    <div className="mt-2 text-sm text-gray-700">
                      <span className="font-medium">Instructions:</span> {med.instructions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/patient/prescriptions')}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
          Back to Prescriptions
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
        >
          Print Prescription
        </button>
      </div>
    </div>
  );
}


