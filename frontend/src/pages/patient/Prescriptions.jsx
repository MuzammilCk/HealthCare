import { useEffect, useState } from 'react';
import { Calendar, User, FileText, Activity, Tag } from 'lucide-react';
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
    'New': 'bg-brand-sky/15 text-brand-sky-fg border-brand-sky/20',
    'Pending Fulfillment': 'bg-amber-400/15 text-amber-500 border-amber-500/20',
    'Filled': 'bg-success/15 text-success-fg border-success/20',
    'Partially Filled': 'bg-brand-violet/15 text-brand-violet border-brand-violet/20',
    'Cancelled': 'bg-error/15 text-error-fg border-error/20',
  };

  const columns = [
    { label: 'Date Issued', icon: <Calendar className="w-4 h-4 text-brand-cyan-fg" /> },
    { label: 'Prescribed By', icon: <User className="w-4 h-4 text-brand-teal" /> },
    { label: 'Status', icon: <Tag className="w-4 h-4 text-muted-foreground" /> },
    { label: 'Actions' }
  ];

  if (loading) {
    return (
      <div className="space-y-6 bg-background text-foreground">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Prescriptions</h1>
          <p className="text-muted-foreground">View and manage your prescribed medications</p>
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
    <div className="space-y-6 bg-background text-foreground">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Prescriptions</h1>
        <p className="text-muted-foreground">View and manage your prescribed medications</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <ModernTableContainer
          title="Prescription History"
          subtitle={`${list.length} prescription${list.length !== 1 ? 's' : ''} found`}
        >
          {list.length === 0 ? (
            <EmptyState
              icon={<Activity className="w-8 h-8 text-muted-foreground" />}
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
                          <div className="font-medium text-foreground">
                            {prescription.doctorId?.name || 'Unknown Doctor'}
                          </div>
                          <div className="text-sm text-muted-foreground">Doctor</div>
                        </div>
                      </div>
                    </ModernTableCell>
                    <ModernTableCell>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[prescription.status] || 'bg-foreground/5 text-muted-foreground border-border'}`}>
                        {prescription.status || 'New'}
                      </span>
                    </ModernTableCell>
                    <ModernTableCell>
                      <button
                        onClick={() => { setSelectedPrescription(prescription); setIsModalOpen(true); }}
                        className="text-sm text-brand-cyan-fg hover:underline"
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
              icon={<Activity className="w-8 h-8 text-muted-foreground" />}
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
                    <div className="w-12 h-12 bg-brand-teal/15 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-brand-teal" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{prescription.medication}</h3>
                      <DateTimeDisplay
                        date={prescription.dateIssued}
                        format="date-only"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Prescribed By</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Avatar
                        name={prescription.doctorId?.name || 'Unknown Doctor'}
                        size="sm"
                      />
                      <span className="font-medium text-foreground">
                        {prescription.doctorId?.name || 'Unknown Doctor'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[prescription.status] || 'bg-foreground/5 text-muted-foreground border-border'}`}>
                        {prescription.status || 'New'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => { setSelectedPrescription(prescription); setIsModalOpen(true); }}
                      className="text-sm text-brand-cyan-fg hover:underline"
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
