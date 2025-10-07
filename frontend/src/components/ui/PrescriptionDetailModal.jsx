import { FiX, FiCalendar, FiUser, FiFileText, FiTag } from 'react-icons/fi';

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
    'New': 'bg-blue-100 text-blue-800 border-blue-200',
    'Pending Fulfillment': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Filled': 'bg-green-100 text-green-800 border-green-200',
    'Partially Filled': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[1200] bg-transparent backdrop-blur-sm backdrop-saturate-150 flex items-center justify-center p-4">
      <div onClick={stop} className="relative z-[1201] w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-gray-900">Prescription Details</h3>
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[prescription.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
              <FiTag className="w-3 h-3" /> {prescription.status || 'New'}
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Info grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><FiUser className="w-5 h-5 text-blue-600" /></div>
              <div>
                <div className="text-sm text-gray-600">Prescribed By</div>
                <div className="font-semibold text-gray-900">{prescription.doctorId?.name || 'Doctor'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><FiCalendar className="w-5 h-5 text-green-600" /></div>
              <div>
                <div className="text-sm text-gray-600">Date Issued</div>
                <div className="font-semibold text-gray-900">{new Date(prescription.dateIssued).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Medicines */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Medicines</h4>
            {allMeds.length === 0 ? (
              <div className="text-sm text-gray-500">No medicines listed.</div>
            ) : (
              <div className="space-y-3">
                {allMeds.map((med, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="font-medium text-gray-900 mb-1">{med.medicineName || 'Medicine'}</div>
                    <div className="grid sm:grid-cols-3 gap-2 text-sm">
                      <div><span className="text-gray-600">Dosage:</span> {med.dosage || '-'}</div>
                      <div><span className="text-gray-600">Frequency:</span> {med.frequency || '-'}</div>
                      <div><span className="text-gray-600">Duration:</span> {med.duration || '-'}</div>
                    </div>
                    {med.instructions && (
                      <div className="mt-2 text-sm"><span className="text-gray-600">Instructions:</span> {med.instructions}</div>
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


