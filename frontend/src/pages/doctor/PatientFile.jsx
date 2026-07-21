import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { cn } from '../../utils/cn';
import { Button, buttonVariants } from '../../components/ui/Button';
import Reveal from '../../components/Reveal';
import {
  Search,
  User,
  FileText,
  Calendar,
  IndianRupee,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Heart
} from 'lucide-react';

export default function PatientFile() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientFile, setPatientFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const inputCls =
    'w-full rounded-xl bg-background/60 border border-border px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors';

  // Search patients
  const searchPatients = async () => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      toast.error('Please enter at least 2 characters');
      return;
    }

    setSearching(true);
    try {
      const res = await api.get(`/patients/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data.data || []);
      if (res.data.data.length === 0) {
        toast.info('No patients found');
      }
    } catch (e) {
      toast.error('Failed to search patients');
    } finally {
      setSearching(false);
    }
  };

  // Load patient file
  const loadPatientFile = async (patientId) => {
    setLoading(true);
    setSelectedPatient(searchResults.find(p => p._id === patientId));
    try {
      const res = await api.get(`/patients/${patientId}/file`);
      setPatientFile(res.data.data);
      setSearchResults([]);
      setSearchQuery('');
    } catch (e) {
      toast.error('Failed to load patient file');
      setSelectedPatient(null);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (paise) => {
    return `₹${(paise / 100).toFixed(2)}`;
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'bg-brand-cyan/15 text-brand-cyan-fg',
      'Completed': 'bg-success/15 text-success-fg',
      'Cancelled': 'bg-error/15 text-error-fg',
      'cancelled_refunded': 'bg-amber-400/15 text-amber-500',
      'cancelled_no_refund': 'bg-error/15 text-error-fg',
      'Missed': 'bg-amber-400/15 text-amber-500',
      'Rejected': 'bg-error/15 text-error-fg',
      'paid': 'bg-success/15 text-success-fg',
      'unpaid': 'bg-amber-400/15 text-amber-500'
    };
    return colors[status] || 'bg-foreground/5 text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl p-6">
        <Reveal>
          <h1 className="mb-6 flex items-center font-head text-3xl font-bold tracking-tight text-foreground">
            <FileText className="mr-3 h-7 w-7 text-brand-cyan-fg" />
            Patient File Viewer
          </h1>
        </Reveal>

        {/* Search Section */}
        <Reveal>
          <div className="glass mb-6 rounded-2xl p-6 shadow-card">
            <h2 className="mb-4 font-head text-lg font-semibold text-foreground">Search Patient</h2>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
                  placeholder="Search by patient name or email..."
                  className="h-12 w-full rounded-xl border border-border bg-background/60 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Button
                onClick={searchPatients}
                disabled={searching}
              >
                {searching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 divide-y divide-border rounded-lg border border-border">
                {searchResults.map((patient) => (
                  <button
                    key={patient._id}
                    onClick={() => loadPatientFile(patient._id)}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-foreground/5"
                  >
                    <div className="flex items-center">
                      <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-cyan/10">
                        <User className="text-brand-cyan-fg" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{patient.name}</div>
                        <div className="text-sm text-muted-foreground">{patient.email}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{patient.district}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-brand-cyan/30 border-t-brand-cyan" />
            <p className="text-muted-foreground">Loading patient file...</p>
          </div>
        )}

        {/* Patient File */}
        {!loading && patientFile && (
          <Reveal>
            <div className="space-y-6">
              {/* Patient Header */}
              <div className="rounded-2xl border border-brand-cyan/20 bg-gradient-to-br from-brand-cyan/10 to-brand-teal/5 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-cyan/20">
                      <User className="text-2xl text-brand-cyan-fg" />
                    </div>
                    <div>
                      <h2 className="font-head text-2xl font-bold text-foreground">{patientFile.patient.name}</h2>
                      <p className="text-muted-foreground">{patientFile.patient.email}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        District: {patientFile.patient.district || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPatientFile(null);
                      setSelectedPatient(null);
                    }}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="glass rounded-xl p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Appointments</p>
                      <p className="text-2xl font-bold text-foreground">{patientFile.appointments.total}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-brand-cyan-fg" />
                  </div>
                </div>
                <div className="glass rounded-xl p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-success-fg">{patientFile.appointments.completed}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-success-fg" />
                  </div>
                </div>
                <div className="glass rounded-xl p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Prescriptions</p>
                      <p className="text-2xl font-bold text-foreground">{patientFile.prescriptions.total}</p>
                    </div>
                    <FileText className="h-8 w-8 text-brand-violet" />
                  </div>
                </div>
                <div className="glass rounded-xl p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Unpaid Bills</p>
                      <p className="text-2xl font-bold text-amber-500">{patientFile.bills.unpaid}</p>
                    </div>
                    <IndianRupee className="h-8 w-8 text-amber-500" />
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="glass rounded-2xl shadow-card">
                <div className="border-b border-border">
                  <div className="flex">
                    {[
                      { id: 'overview', label: 'Overview', icon: Activity },
                      { id: 'appointments', label: 'Appointments', icon: Calendar },
                      { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
                      { id: 'bills', label: 'Bills', icon: IndianRupee },
                      { id: 'medicalHistory', label: 'Medical History', icon: Heart }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center border-b-2 px-6 py-4 font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'border-brand-cyan text-brand-cyan-fg'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <tab.icon className="mr-2 h-4 w-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Medical History */}
                      <div>
                        <h3 className="mb-3 font-head text-lg font-semibold text-foreground">Medical History</h3>

                        {/* Correction Request Warning */}
                        {patientFile.medicalHistory?.correctionRequested && (
                          <div className="mb-4 rounded-lg border-l-4 border-amber-400 bg-amber-400/10 p-4">
                            <div className="flex items-start">
                              <AlertTriangle className="mt-0.5 mr-3 flex-shrink-0 text-amber-600" />
                              <div>
                                <p className="font-semibold text-amber-700">⚠️ Correction Requested</p>
                                <p className="mt-1 text-sm text-amber-600">
                                  Patient requested correction on {new Date(patientFile.medicalHistory.correctionRequestDate).toLocaleDateString()}
                                </p>
                                {patientFile.medicalHistory.correctionRequestMessage && (
                                  <p className="mt-2 rounded border border-amber-400/30 bg-amber-400/10 p-2 text-sm italic text-amber-600">
                                    "{patientFile.medicalHistory.correctionRequestMessage}"
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {patientFile.medicalHistory ? (
                          <div className="space-y-2 rounded-lg bg-foreground/5 p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="font-medium text-muted-foreground">Blood Type:</span>{' '}
                                <span className="text-foreground">{patientFile.medicalHistory.bloodType}</span>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Height:</span>{' '}
                                <span className="text-foreground">
                                  {patientFile.medicalHistory.height ? `${patientFile.medicalHistory.height} cm` : 'Not specified'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Weight:</span>{' '}
                                <span className="text-foreground">
                                  {patientFile.medicalHistory.weight ? `${patientFile.medicalHistory.weight} kg` : 'Not specified'}
                                </span>
                              </div>
                            </div>
                            {patientFile.medicalHistory.allergies && patientFile.medicalHistory.allergies.length > 0 && (
                              <div className="mt-3">
                                <span className="font-medium text-muted-foreground">Allergies:</span>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  {patientFile.medicalHistory.allergies.map((allergy, idx) => (
                                    <span key={idx} className="rounded bg-error/15 px-2 py-1 text-sm text-error-fg">
                                      {allergy.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No medical history available</p>
                        )}
                      </div>

                      {/* Quick Stats */}
                      <div>
                        <h3 className="mb-3 font-head text-lg font-semibold text-foreground">Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg bg-brand-cyan/10 p-4">
                            <p className="text-sm font-medium text-brand-cyan-fg">Upcoming Appointments</p>
                            <p className="text-2xl font-bold text-brand-cyan-fg">{patientFile.appointments.upcoming}</p>
                          </div>
                          <div className="rounded-lg bg-amber-400/10 p-4">
                            <p className="text-sm font-medium text-amber-500">Total Unpaid Amount</p>
                            <p className="text-2xl font-bold text-amber-600">
                              {formatCurrency(patientFile.bills.totalUnpaidAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Appointments Tab */}
                  {activeTab === 'appointments' && (
                    <div className="space-y-3">
                      {patientFile.appointments.data.length > 0 ? (
                        patientFile.appointments.data.map((appt) => (
                          <div key={appt._id} className="rounded-lg border border-border p-4 transition-shadow hover:shadow-card">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="mb-2 flex items-center gap-2">
                                  <Calendar className="text-brand-cyan-fg" />
                                  <span className="font-medium">{formatDate(appt.date)}</span>
                                  <span className="text-muted-foreground">•</span>
                                  <span className="text-muted-foreground">{appt.timeSlot}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Doctor: {appt.doctorId?.name || 'Unknown'}
                                </div>
                                {appt.notes && (
                                  <div className="mt-1 text-sm text-muted-foreground">
                                    Notes: {appt.notes}
                                  </div>
                                )}
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(appt.status)}`}>
                                {appt.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="py-8 text-center text-muted-foreground">No appointments found</p>
                      )}
                    </div>
                  )}

                  {/* Prescriptions Tab */}
                  {activeTab === 'prescriptions' && (
                    <div className="space-y-3">
                      {patientFile.prescriptions.data.length > 0 ? (
                        patientFile.prescriptions.data.map((pres) => (
                          <div key={pres._id} className="rounded-lg border border-border p-4">
                            <div className="mb-3 flex items-start justify-between">
                              <div>
                                <div className="font-medium text-foreground">
                                  {formatDate(pres.dateIssued)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Dr. {pres.doctorId?.name || 'Unknown'}
                                </div>
                              </div>
                              {pres.consultationFee > 0 && (
                                <div className="text-sm font-medium text-brand-cyan-fg">
                                  Fee: {formatCurrency(pres.consultationFee)}
                                </div>
                              )}
                            </div>
                            {pres.diagnosis && (
                              <div className="mb-2">
                                <span className="font-medium text-muted-foreground">Diagnosis:</span>{' '}
                                <span className="text-foreground">{pres.diagnosis}</span>
                              </div>
                            )}
                            {pres.medicines && pres.medicines.length > 0 && (
                              <div>
                                <span className="font-medium text-muted-foreground">Medicines:</span>
                                <div className="mt-2 space-y-2">
                                  {pres.medicines.map((med, idx) => (
                                    <div key={idx} className="rounded bg-foreground/5 p-3 text-sm">
                                      <div className="font-medium text-foreground">{med.medicineName}</div>
                                      <div className="text-muted-foreground">
                                        {med.dosage} • {med.frequency} • {med.duration}
                                      </div>
                                      {med.instructions && (
                                        <div className="mt-1 text-xs text-muted-foreground">
                                          {med.instructions}
                                        </div>
                                      )}
                                      {med.purchaseFromHospital && (
                                        <span className="mt-1 inline-block rounded bg-success/15 px-2 py-0.5 text-xs text-success-fg">
                                          Billed
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="py-8 text-center text-muted-foreground">No prescriptions found</p>
                      )}
                    </div>
                  )}

                  {/* Bills Tab */}
                  {activeTab === 'bills' && (
                    <div className="space-y-3">
                      {patientFile.bills.data.length > 0 ? (
                        patientFile.bills.data.map((bill) => (
                          <div key={bill._id} className="rounded-lg border border-border p-4">
                            <div className="mb-3 flex items-start justify-between">
                              <div>
                                <div className="font-medium text-foreground">
                                  Bill #{bill._id.slice(-6)}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(bill.createdAt)}
                                </div>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(bill.status)}`}>
                                {bill.status}
                              </span>
                            </div>
                            <div className="mb-3 space-y-1">
                              {bill.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {item.description} × {item.quantity}
                                  </span>
                                  <span className="font-medium text-foreground">
                                    {formatCurrency(item.amount * item.quantity)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between border-t border-border pt-2 font-bold">
                              <span className="text-foreground">Total</span>
                              <span className="text-brand-cyan-fg">{formatCurrency(bill.totalAmount)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="py-8 text-center text-muted-foreground">No bills found</p>
                      )}
                    </div>
                  )}

                  {/* Medical History Tab */}
                  {activeTab === 'medicalHistory' && (
                    <div className="space-y-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-head text-lg font-semibold text-foreground">Complete Medical History</h3>
                        <Button
                          size="sm"
                          onClick={() => navigate('/doctor/edit-medical-history', {
                            state: { patientId: selectedPatient._id, patientName: selectedPatient.name }
                          })}
                        >
                          Edit Medical History
                        </Button>
                      </div>

                      {patientFile.medicalHistory ? (
                        <div className="space-y-4">
                          {/* Basic Info */}
                          <div className="rounded-lg bg-foreground/5 p-4">
                            <h4 className="mb-3 font-semibold text-foreground">Basic Information</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <span className="text-sm text-muted-foreground">Blood Type:</span>
                                <p className="font-medium text-foreground">{patientFile.medicalHistory.bloodType}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Height:</span>
                                <p className="font-medium text-foreground">
                                  {patientFile.medicalHistory.height ? `${patientFile.medicalHistory.height} cm` : 'Not specified'}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Weight:</span>
                                <p className="font-medium text-foreground">
                                  {patientFile.medicalHistory.weight ? `${patientFile.medicalHistory.weight} kg` : 'Not specified'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Allergies */}
                          {patientFile.medicalHistory.allergies && patientFile.medicalHistory.allergies.length > 0 && (
                            <div className="rounded-lg border border-error/20 bg-error/10 p-4">
                              <h4 className="mb-3 font-semibold text-error-fg">Allergies</h4>
                              <div className="space-y-2">
                                {patientFile.medicalHistory.allergies.map((allergy, idx) => (
                                  <div key={idx} className="rounded border border-border bg-foreground/5 p-3">
                                    <div className="flex justify-between">
                                      <span className="font-medium text-error-fg">{allergy.name}</span>
                                      <span className={`rounded px-2 py-1 text-xs ${
                                        allergy.severity === 'severe' ? 'bg-error/20 text-error-fg' :
                                        allergy.severity === 'moderate' ? 'bg-amber-400/20 text-amber-600' :
                                        'bg-success/20 text-success-fg'
                                      }`}>
                                        {allergy.severity}
                                      </span>
                                    </div>
                                    {allergy.reaction && (
                                      <p className="mt-1 text-sm text-error/80">Reaction: {allergy.reaction}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Conditions */}
                          {patientFile.medicalHistory.pastConditions && patientFile.medicalHistory.pastConditions.length > 0 && (
                            <div className="rounded-lg border border-brand-cyan/20 bg-brand-cyan/10 p-4">
                              <h4 className="mb-3 font-semibold text-brand-cyan-fg">Past Medical Conditions</h4>
                              <div className="space-y-2">
                                {patientFile.medicalHistory.pastConditions.map((condition, idx) => (
                                  <div key={idx} className="rounded border border-border bg-foreground/5 p-3">
                                    <div className="flex justify-between">
                                      <span className="font-medium text-brand-cyan-fg">{condition.name}</span>
                                      <span className={`rounded px-2 py-1 text-xs ${
                                        condition.status === 'active' ? 'bg-error/20 text-error-fg' :
                                        condition.status === 'chronic' ? 'bg-amber-400/20 text-amber-600' :
                                        'bg-success/20 text-success-fg'
                                      }`}>
                                        {condition.status}
                                      </span>
                                    </div>
                                    {condition.notes && (
                                      <p className="mt-1 text-sm text-brand-cyan/80">{condition.notes}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Current Medications */}
                          {patientFile.medicalHistory.currentMedications && patientFile.medicalHistory.currentMedications.length > 0 && (
                            <div className="rounded-lg border border-brand-violet/20 bg-brand-violet/10 p-4">
                              <h4 className="mb-3 font-semibold text-brand-violet">Current Medications</h4>
                              <div className="space-y-2">
                                {patientFile.medicalHistory.currentMedications.map((med, idx) => (
                                  <div key={idx} className="rounded border border-border bg-foreground/5 p-3">
                                    <p className="font-medium text-brand-violet">{med.name}</p>
                                    <div className="mt-1 text-sm text-brand-violet/80">
                                      {med.dosage && <span>Dosage: {med.dosage}</span>}
                                      {med.frequency && <span className="ml-3">Frequency: {med.frequency}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Lifestyle */}
                          <div className="rounded-lg bg-foreground/5 p-4">
                            <h4 className="mb-3 font-semibold text-foreground">Lifestyle Information</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <span className="text-sm text-muted-foreground">Smoking:</span>
                                <p className="font-medium capitalize text-foreground">{patientFile.medicalHistory.smokingStatus}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Alcohol:</span>
                                <p className="font-medium capitalize text-foreground">{patientFile.medicalHistory.alcoholConsumption}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Exercise:</span>
                                <p className="font-medium capitalize text-foreground">{patientFile.medicalHistory.exerciseFrequency}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center">
                          <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
                          <p className="mb-4 text-muted-foreground">No medical history available</p>
                          <Button
                            size="sm"
                            onClick={() => navigate('/doctor/edit-medical-history', {
                              state: { patientId: selectedPatient._id, patientName: selectedPatient.name }
                            })}
                          >
                            Create Medical History
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Empty State */}
        {!loading && !patientFile && searchResults.length === 0 && (
          <Reveal>
            <div className="py-12 text-center">
              <Search className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
              <p className="text-muted-foreground">Search for a patient to view their complete medical file</p>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
