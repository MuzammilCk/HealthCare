import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText, IndianRupee, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { cn } from '../../utils/cn';
import { Button, buttonVariants } from '../../components/ui/Button';
import Reveal from '../../components/Reveal';

export default function ViewPrescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const res = await api.get(`/doctors/prescriptions/${id}`);
        setPrescription(res.data.data);
      } catch (err) {
        toast.error('Failed to load prescription');
        navigate('/doctor/appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-cyan/30 border-t-brand-cyan"></div>
      </div>
    );
  }

  if (!prescription) {
    return null;
  }

  const billedMedicines = prescription.medicines.filter(m => m.purchaseFromHospital);
  const prescribedOnlyMedicines = prescription.medicines.filter(m => !m.purchaseFromHospital);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        <Reveal>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/doctor/appointments')}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-foreground/5"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div>
                <h1 className="font-head text-3xl font-bold tracking-tight text-foreground">Prescription Details</h1>
                <p className="text-muted-foreground">Read-only view</p>
              </div>
              <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-border bg-foreground/5 px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Tag className="h-3 w-3" /> {prescription.status || 'New'}
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="glass space-y-6 rounded-2xl p-6 shadow-card">
            {/* Patient & Appointment Info */}
            <div className="grid gap-6 border-b border-border pb-6 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-cyan/15 p-2 text-brand-cyan-fg">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Patient</div>
                  <div className="font-semibold text-foreground">{prescription.patientId?.name}</div>
                  <div className="text-sm text-muted-foreground">{prescription.patientId?.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-success/15 p-2 text-success-fg">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Appointment</div>
                  <div className="font-semibold text-foreground">
                    {new Date(prescription.appointmentId?.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">{prescription.appointmentId?.timeSlot}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-violet/15 p-2 text-brand-violet">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Date Issued</div>
                  <div className="font-semibold text-foreground">
                    {new Date(prescription.dateIssued).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-400/15 p-2 text-amber-500">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Doctor Fee</div>
                  <div className="font-semibold text-foreground">
                    ₹{(prescription.consultationFee / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            {prescription.diagnosis && (
              <div>
                <h3 className="mb-2 font-head font-semibold text-foreground">Diagnosis</h3>
                <p className="rounded-lg bg-foreground/5 p-4 text-foreground">{prescription.diagnosis}</p>
              </div>
            )}

            {/* Billed Medicines */}
            {billedMedicines.length > 0 && (
              <div>
                <h3 className="mb-3 font-head font-semibold text-foreground">Billed Medicines (From Hospital Inventory)</h3>
                <div className="space-y-3">
                  {billedMedicines.map((med, index) => (
                    <div key={index} className="rounded-lg border border-brand-cyan/20 bg-brand-cyan/10 p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="font-semibold text-foreground">{med.medicineName}</div>
                        <span className="rounded-full bg-brand-cyan px-2 py-1 text-xs text-white">
                          Qty: {med.quantity}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
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
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Instructions:</span> {med.instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prescribed-Only Medicines */}
            {prescribedOnlyMedicines.length > 0 && (
              <div>
                <h3 className="mb-3 font-head font-semibold text-foreground">Prescribed Medicines (Not Billed)</h3>
                <div className="space-y-3">
                  {prescribedOnlyMedicines.map((med, index) => (
                    <div key={index} className="rounded-lg border border-border bg-foreground/5 p-4">
                      <div className="mb-2 font-semibold text-foreground">{med.medicineName}</div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
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
                        <div className="mt-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Instructions:</span> {med.instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {prescription.notes && (
              <div>
                <h3 className="mb-2 font-head font-semibold text-foreground">Additional Notes</h3>
                <p className="rounded-lg bg-foreground/5 p-4 text-muted-foreground">{prescription.notes}</p>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/doctor/appointments')}
            >
              Back to Appointments
            </Button>
            <Button onClick={() => window.print()}>
              Print Prescription
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
