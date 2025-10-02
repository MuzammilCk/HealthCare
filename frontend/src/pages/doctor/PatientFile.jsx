import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import {
  FiSearch,
  FiUser,
  FiFileText,
  FiCalendar,
  FiDollarSign,
  FiActivity,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi';

export default function PatientFile() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientFile, setPatientFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'cancelled_refunded': 'bg-orange-100 text-orange-800',
      'cancelled_no_refund': 'bg-red-100 text-red-800',
      'Missed': 'bg-orange-100 text-orange-800',
      'Rejected': 'bg-red-100 text-red-800',
      'paid': 'bg-green-100 text-green-800',
      'unpaid': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary mb-6 flex items-center">
        <FiFileText className="mr-3 text-primary" />
        Patient File Viewer
      </h1>

      {/* Search Section */}
      <div className="bg-white p-6 rounded-xl shadow-card mb-6">
        <h2 className="text-lg font-semibold mb-4">Search Patient</h2>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
              placeholder="Search by patient name or email..."
              className="w-full bg-bg-page border border-slate-300/70 rounded-lg h-12 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            onClick={searchPatients}
            disabled={searching}
            className="px-6 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light transition-all disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 border border-slate-200 rounded-lg divide-y">
            {searchResults.map((patient) => (
              <button
                key={patient._id}
                onClick={() => loadPatientFile(patient._id)}
                className="w-full p-4 hover:bg-slate-50 text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                    <FiUser className="text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-text-primary">{patient.name}</div>
                    <div className="text-sm text-text-secondary">{patient.email}</div>
                  </div>
                </div>
                <div className="text-sm text-text-secondary">{patient.district}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-secondary">Loading patient file...</p>
        </div>
      )}

      {/* Patient File */}
      {!loading && patientFile && (
        <div className="space-y-6">
          {/* Patient Header */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-xl border border-primary/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                  <FiUser className="text-primary text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">{patientFile.patient.name}</h2>
                  <p className="text-text-secondary">{patientFile.patient.email}</p>
                  <p className="text-sm text-text-secondary mt-1">
                    District: {patientFile.patient.district || 'Not specified'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPatientFile(null);
                  setSelectedPatient(null);
                }}
                className="text-sm text-text-secondary hover:text-text-primary"
              >
                Close
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Total Appointments</p>
                  <p className="text-2xl font-bold text-text-primary">{patientFile.appointments.total}</p>
                </div>
                <FiCalendar className="text-3xl text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{patientFile.appointments.completed}</p>
                </div>
                <FiCheckCircle className="text-3xl text-green-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Prescriptions</p>
                  <p className="text-2xl font-bold text-text-primary">{patientFile.prescriptions.total}</p>
                </div>
                <FiFileText className="text-3xl text-purple-500" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Unpaid Bills</p>
                  <p className="text-2xl font-bold text-orange-600">{patientFile.bills.unpaid}</p>
                </div>
                <FiDollarSign className="text-3xl text-orange-500" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-card">
            <div className="border-b border-slate-200">
              <div className="flex">
                {[
                  { id: 'overview', label: 'Overview', icon: FiActivity },
                  { id: 'appointments', label: 'Appointments', icon: FiCalendar },
                  { id: 'prescriptions', label: 'Prescriptions', icon: FiFileText },
                  { id: 'bills', label: 'Bills', icon: FiDollarSign }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-6 py-4 font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <tab.icon className="mr-2" />
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
                    <h3 className="text-lg font-semibold mb-3">Medical History</h3>
                    {patientFile.medicalHistory ? (
                      <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium text-text-secondary">Blood Type:</span>{' '}
                            <span className="text-text-primary">{patientFile.medicalHistory.bloodType}</span>
                          </div>
                          <div>
                            <span className="font-medium text-text-secondary">Height:</span>{' '}
                            <span className="text-text-primary">
                              {patientFile.medicalHistory.height ? `${patientFile.medicalHistory.height} cm` : 'Not specified'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-text-secondary">Weight:</span>{' '}
                            <span className="text-text-primary">
                              {patientFile.medicalHistory.weight ? `${patientFile.medicalHistory.weight} kg` : 'Not specified'}
                            </span>
                          </div>
                        </div>
                        {patientFile.medicalHistory.allergies && patientFile.medicalHistory.allergies.length > 0 && (
                          <div className="mt-3">
                            <span className="font-medium text-text-secondary">Allergies:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {patientFile.medicalHistory.allergies.map((allergy, idx) => (
                                <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded">
                                  {allergy.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-text-secondary">No medical history available</p>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Upcoming Appointments</p>
                        <p className="text-2xl font-bold text-blue-700">{patientFile.appointments.upcoming}</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-orange-600 font-medium">Total Unpaid Amount</p>
                        <p className="text-2xl font-bold text-orange-700">
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
                      <div key={appt._id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <FiCalendar className="text-primary" />
                              <span className="font-medium">{formatDate(appt.date)}</span>
                              <span className="text-text-secondary">•</span>
                              <span className="text-text-secondary">{appt.timeSlot}</span>
                            </div>
                            <div className="text-sm text-text-secondary">
                              Doctor: {appt.doctorId?.name || 'Unknown'}
                            </div>
                            {appt.notes && (
                              <div className="text-sm text-text-secondary mt-1">
                                Notes: {appt.notes}
                              </div>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appt.status)}`}>
                            {appt.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-text-secondary py-8">No appointments found</p>
                  )}
                </div>
              )}

              {/* Prescriptions Tab */}
              {activeTab === 'prescriptions' && (
                <div className="space-y-3">
                  {patientFile.prescriptions.data.length > 0 ? (
                    patientFile.prescriptions.data.map((pres) => (
                      <div key={pres._id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium text-text-primary">
                              {formatDate(pres.dateIssued)}
                            </div>
                            <div className="text-sm text-text-secondary">
                              Dr. {pres.doctorId?.name || 'Unknown'}
                            </div>
                          </div>
                          {pres.consultationFee > 0 && (
                            <div className="text-sm font-medium text-primary">
                              Fee: {formatCurrency(pres.consultationFee)}
                            </div>
                          )}
                        </div>
                        {pres.diagnosis && (
                          <div className="mb-2">
                            <span className="font-medium text-text-secondary">Diagnosis:</span>{' '}
                            <span className="text-text-primary">{pres.diagnosis}</span>
                          </div>
                        )}
                        {pres.medicines && pres.medicines.length > 0 && (
                          <div>
                            <span className="font-medium text-text-secondary">Medicines:</span>
                            <div className="mt-2 space-y-2">
                              {pres.medicines.map((med, idx) => (
                                <div key={idx} className="bg-slate-50 p-3 rounded text-sm">
                                  <div className="font-medium">{med.medicineName}</div>
                                  <div className="text-text-secondary">
                                    {med.dosage} • {med.frequency} • {med.duration}
                                  </div>
                                  {med.instructions && (
                                    <div className="text-text-secondary text-xs mt-1">
                                      {med.instructions}
                                    </div>
                                  )}
                                  {med.purchaseFromHospital && (
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
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
                    <p className="text-center text-text-secondary py-8">No prescriptions found</p>
                  )}
                </div>
              )}

              {/* Bills Tab */}
              {activeTab === 'bills' && (
                <div className="space-y-3">
                  {patientFile.bills.data.length > 0 ? (
                    patientFile.bills.data.map((bill) => (
                      <div key={bill._id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium text-text-primary">
                              Bill #{bill._id.slice(-6)}
                            </div>
                            <div className="text-sm text-text-secondary">
                              {formatDate(bill.createdAt)}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                            {bill.status}
                          </span>
                        </div>
                        <div className="space-y-1 mb-3">
                          {bill.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-text-secondary">
                                {item.description} × {item.quantity}
                              </span>
                              <span className="text-text-primary font-medium">
                                {formatCurrency(item.amount * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Total</span>
                          <span className="text-primary">{formatCurrency(bill.totalAmount)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-text-secondary py-8">No bills found</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !patientFile && searchResults.length === 0 && (
        <div className="text-center py-12">
          <FiSearch className="mx-auto text-6xl text-text-secondary/30 mb-4" />
          <p className="text-text-secondary">Search for a patient to view their complete medical file</p>
        </div>
      )}
    </div>
  );
}
