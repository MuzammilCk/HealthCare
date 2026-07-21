import { X, Calendar, User, Tag } from 'lucide-react';

export default function PrescriptionDetailModal({ open, prescription, onClose }) {
  if (!open || !prescription) return null;

  const stop = (e) => e.stopPropagation();

  const meds = Array.isArray(prescription.medicines) ? prescription.medicines : [];
  const legacyMed = prescription.medication ? [{
    medicineName: prescription.medication,
    dosage: prescription.dosage,
    frequency: '',
    duration: '',
    instructions: prescription.instructions,
  }] : [];

  const allMeds = meds.length > 0 ? meds : legacyMed;

  const statusColors = {
    'New': 'bg-brand-cyan/15 text-brand-cyan-fg border-brand-cyan/20',
    'Pending Fulfillment': 'bg-amber-500/15 text-amber-600 border-amber-500/20',
    'Filled': 'bg-green-500/15 text-success-fg border-green-500/20',
    'Partially Filled': 'bg-brand-indigo/15 text-brand-indigo border-brand-indigo/20',
    'Cancelled': 'bg-red-500/15 text-error-fg border-red-500/20',
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[1200] bg-transparent backdrop-blur-sm backdrop-saturate-150 flex items-center justify-center p-4">
      <div onClick={stop} className="relative z-[1201] w-full max-w-3xl glass-strong rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-foreground">Prescription Details</h3>
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[prescription.status] || 'bg-foreground/5 text-muted-foreground border-border'}`}>
              <Tag className="w-3 h-3" /> {prescription.status || 'New'}
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Info grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-brand-cyan/15 rounded-lg"><User className="w-5 h-5 text-brand-cyan-fg" /></div>
              <div>
                <div className="text-sm text-muted-foreground">Prescribed By</div>
                <div className="font-semibold text-foreground">{prescription.doctorId?.name || 'Doctor'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/15 rounded-lg"><Calendar className="w-5 h-5 text-success-fg" /></div>
              <div>
                <div className="text-sm text-muted-foreground">Date Issued</div>
                <div className="font-semibold text-foreground">{new Date(prescription.dateIssued).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Medicines */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Medicines</h4>
            {allMeds.length === 0 ? (
              <div className="text-sm text-muted-foreground">No medicines listed.</div>
            ) : (
              <div className="space-y-3">
                {allMeds.map((med, idx) => (
                  <div key={idx} className="border border-border rounded-lg p-4 bg-foreground/5">
                    <div className="font-medium text-foreground mb-1">{med.medicineName || 'Medicine'}</div>
                    <div className="grid sm:grid-cols-3 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Dosage:</span> {med.dosage || '-'}</div>
                      <div><span className="text-muted-foreground">Frequency:</span> {med.frequency || '-'}</div>
                      <div><span className="text-muted-foreground">Duration:</span> {med.duration || '-'}</div>
                    </div>
                    {med.instructions && (
                      <div className="mt-2 text-sm"><span className="text-muted-foreground">Instructions:</span> {med.instructions}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
