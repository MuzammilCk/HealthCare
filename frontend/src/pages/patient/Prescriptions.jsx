import { useEffect, useState } from 'react';
import { FiCalendar, FiUser, FiFileText, FiActivity, FiTag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  ModernTableContainer,
  ModernTableHeader,
  ModernTableRow,
  ModernTableCell,
  DateTimeDisplay,
  Avatar,
  ExpandableText,
  EmptyState,
  LoadingState,
  MobileCard
} from '../../components/ui';
import { PrescriptionSkeleton } from '../../components/ui/SkeletonLoader';
import PrescriptionDetailModal from '../../components/ui/PrescriptionDetailModal';

export default function Prescriptions() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/patients/prescriptions');
        setList(res.data.data);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusColors = {
    'New': 'bg-blue-100 text-blue-800 border-blue-200',
    'Pending Fulfillment': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Filled': 'bg-green-100 text-green-800 border-green-200',
    'Partially Filled': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200',
  };

  const columns = [
    { label: 'Date Issued', icon: <FiCalendar className="w-4 h-4 text-blue-500" /> },
    { label: 'Prescribed By', icon: <FiUser className="w-4 h-4 text-teal-500" /> },
    { label: 'Status', icon: <FiTag className="w-4 h-4 text-gray-500" /> },
    { label: 'Actions' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary-dark mb-2">My Prescriptions</h1>
          <p className="text-gray-600 dark:text-text-secondary-dark">View and manage your prescribed medications</p>
        </div>
        <div className="hidden md:block">
          <ModernTableContainer>
            <PrescriptionSkeleton count={5} />
          </ModernTableContainer>
        </div>
        <div className="md:hidden space-y-4">
          <PrescriptionSkeleton count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary-dark mb-2">My Prescriptions</h1>
        <p className="text-gray-600 dark:text-text-secondary-dark">View and manage your prescribed medications</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <ModernTableContainer
          title="Prescription History"
          subtitle={`${list.length} prescription${list.length !== 1 ? 's' : ''} found`}
        >
          {list.length === 0 ? (
            <EmptyState
              icon={<FiActivity className="w-8 h-8 text-gray-400" />}
              title="No Prescriptions Found"
              description="You don't have any prescriptions yet. They will appear here after your doctor visits."
            />
          ) : (
            <table className="min-w-full">
              <ModernTableHeader columns={columns} />
              <tbody>
                {list.map((prescription, index) => (
                  <ModernTableRow key={prescription._id} isEven={index % 2 === 0}>
                    <ModernTableCell>
                      <DateTimeDisplay 
                        date={prescription.dateIssued} 
                        format="date-only"
                      />
                    </ModernTableCell>
                    
                    <ModernTableCell>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          name={prescription.doctorId?.name || 'Unknown Doctor'} 
                          size="sm"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-text-primary-dark">
                            {prescription.doctorId?.name || 'Unknown Doctor'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-text-secondary-dark">Doctor</div>
                        </div>
                      </div>
                    </ModernTableCell>
                    <ModernTableCell>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[prescription.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        {prescription.status || 'New'}
                      </span>
                    </ModernTableCell>
                    <ModernTableCell>
                      <button
                        onClick={() => { setSelectedPrescription(prescription); setIsModalOpen(true); }}
                        className="text-sm text-primary hover:underline"
                      >
                        View Details →
                      </button>
                    </ModernTableCell>
                  </ModernTableRow>
                ))}
              </tbody>
            </table>
          )}
        </ModernTableContainer>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {list.length === 0 ? (
          <MobileCard>
            <EmptyState
              icon={<FiActivity className="w-8 h-8 text-gray-400" />}
              title="No Prescriptions Found"
              description="You don't have any prescriptions yet."
            />
          </MobileCard>
        ) : (
          list.map((prescription) => (
            <MobileCard key={prescription._id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                      <FiActivity className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-text-primary-dark">{prescription.medication}</h3>
                      <DateTimeDisplay 
                        date={prescription.dateIssued} 
                        format="date-only"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-text-secondary-dark uppercase tracking-wide">Prescribed By</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Avatar 
                        name={prescription.doctorId?.name || 'Unknown Doctor'} 
                        size="sm"
                      />
                      <span className="font-medium text-gray-900 dark:text-text-primary-dark">
                        {prescription.doctorId?.name || 'Unknown Doctor'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-text-secondary-dark uppercase tracking-wide">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[prescription.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        {prescription.status || 'New'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => { setSelectedPrescription(prescription); setIsModalOpen(true); }}
                      className="text-sm text-primary hover:underline"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </MobileCard>
          ))
        )}
      </div>

      {/* Inline modal for details */}
      <PrescriptionDetailModal
        open={isModalOpen}
        prescription={selectedPrescription}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
