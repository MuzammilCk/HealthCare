import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText, DollarSign, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Button } from '../../components/ui';

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
        <div className="w-8 h-8 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!prescription) {
    return null;
  }

  const billedMedicines = (prescription.medicines || []).filter(m => m.purchaseFromHospital);
  const prescribedOnlyMedicines = (prescription.medicines || []).filter(m => !m.purchaseFromHospital);

  return (
    <div className="max-w-4xl mx-auto space-y-6 bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/patient/prescriptions')}
          className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2 w-full">
          <h1 className="text-3xl font-bold text-foreground">Prescription Details</h1>
          <span className="ml-auto inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border border-border bg-foreground/5 text-foreground">
            <Tag className="w-3 h-3" /> {prescription.status || 'New'}
          </span>
        </div>
      </div>

      {/* Prescription Card */}
      <div className="glass rounded-xl shadow-card p-6 space-y-6">
        {/* Doctor & Appointment Info */}
        <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-border">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-brand-cyan/15 rounded-lg">
              <User className="w-5 h-5 text-brand-cyan-fg" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Prescribed By</div>
              <div className="font-semibold text-foreground">{prescription.doctorId?.name}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-brand-teal/15 rounded-lg">
              <Calendar className="w-5 h-5 text-brand-teal" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Appointment</div>
              <div className="font-semibold text-foreground">
                {prescription.appointmentId?.date ? new Date(prescription.appointmentId.date).toLocaleDateString() : ''}
              </div>
              <div className="text-sm text-muted-foreground">{prescription.appointmentId?.timeSlot}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-brand-violet/15 rounded-lg">
              <FileText className="w-5 h-5 text-brand-violet" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Date Issued</div>
              <div className="font-semibold text-foreground">
                {new Date(prescription.dateIssued).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-400/15 rounded-lg">
              <DollarSign className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Doctor Fee</div>
              <div className="font-semibold text-foreground">
                ₹{(prescription.consultationFee / 100).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Prescribed-Only Medicines */}
        {(prescribedOnlyMedicines.length > 0 || billedMedicines.length > 0) && (
          <div>
            <h3 className="font-semibold text-foreground mb-3">Prescribed Medicines{billedMedicines.length === 0 ? ' (Not Billed)' : ''}</h3>
            <div className="space-y-3">
              {(prescribedOnlyMedicines.length > 0 ? prescribedOnlyMedicines : billedMedicines).map((med, index) => (
                <div key={index} className="bg-foreground/5 border border-border rounded-lg p-4">
                  <div className="font-semibold text-foreground mb-2">{med.medicineName}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Dosage:</span> {med.dosage}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequency:</span> {med.frequency}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span> {med.duration}
                    </div>
                  </div>
                  {med.instructions && (
                    <div className="mt-2 text-sm text-foreground">
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
        <Button
          variant="ghost"
          onClick={() => navigate('/patient/prescriptions')}
        >
          Back to Prescriptions
        </Button>
        <Button
          variant="default"
          onClick={() => window.print()}
        >
          Print Prescription
        </Button>
      </div>
    </div>
  );
}
