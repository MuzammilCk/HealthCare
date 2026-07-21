import { useEffect, useState } from 'react';
import { User, Calendar, Briefcase, FileText, Check, X, Clock, Filter, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import {
  ModernTableContainer,
  ModernTableHeader,
  ModernTableRow,
  ModernTableCell,
  StatusBadge,
  Avatar,
  ActionButton,
  DateTimeDisplay,
  EmptyState,
  LoadingState,
  MobileCard,
  AppSelect
} from '../../components/ui';
import { cn } from '../../utils/cn';
import Reveal from '../../components/Reveal';

export default function KycRequests() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [updatingId, setUpdatingId] = useState('');
  const [filter, setFilter] = useState('all'); // all, submitted, approved, rejected

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/kyc-requests');
      setItems(res?.data?.data || []);
    } catch (e) {
      console.error('Error fetching KYC requests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (doctorId, status) => {
    const reason = status === 'Rejected' ? prompt('Provide a rejection reason (optional):', '') : undefined;
    setUpdatingId(doctorId);

    try {
      await api.put(`/admin/kyc-requests/${doctorId}`, { status, reason });
      await fetchData();

      if (status === 'Approved') {
        toast.success("Doctor's KYC has been approved.");
      } else if (status === 'Rejected') {
        toast.success("Doctor's KYC has been rejected.");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'The action could not be completed.');
    } finally {
      setUpdatingId('');
    }
  };

  const columns = [
    { label: 'Doctor', icon: <User className="w-4 h-4 text-brand-cyan-fg" /> },
    { label: 'Specialization', icon: <Briefcase className="w-4 h-4 text-brand-violet" /> },
    { label: 'Submitted', icon: <Calendar className="w-4 h-4 text-brand-teal" /> },
    { label: 'Status', icon: <Clock className="w-4 h-4 text-brand-sky-fg" /> },
    { label: 'Documents', icon: <FileText className="w-4 h-4 text-brand-indigo" /> },
    { label: 'Actions', icon: <Check className="w-4 h-4 text-brand-cyan-fg" /> }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Requests' },
    { value: 'submitted', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    return item.verificationStatus?.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="space-y-6 bg-background text-foreground">
        <div>
          <h1 className="mb-2 font-head text-3xl font-bold tracking-tight text-foreground">KYC Verification Requests</h1>
          <p className="text-muted-foreground">Review and manage doctor verification requests</p>
        </div>
        <ModernTableContainer>
          <LoadingState rows={5} />
        </ModernTableContainer>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background text-foreground">
      {/* Header */}
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 font-head text-3xl font-bold tracking-tight text-foreground">KYC Verification Requests</h1>
          <p className="text-muted-foreground">Review and manage doctor verification requests</p>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <AppSelect
            value={filter}
            onChange={setFilter}
            options={filterOptions}
            placeholder="Filter requests"
            className="min-w-[200px]"
          />
        </div>
      </Reveal>

      {/* Stats Dashboard */}
      <Reveal className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center justify-between gap-4 rounded-2xl glass p-6 shadow-card">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
            <p className="font-head text-2xl font-bold text-foreground">
              {items.filter(item => item.verificationStatus === 'Submitted').length}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-cyan/15 text-brand-cyan-fg">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl glass p-6 shadow-card">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Approved</p>
            <p className="font-head text-2xl font-bold text-foreground">
              {items.filter(item => item.verificationStatus === 'Approved').length}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/15 text-success-fg">
            <Check className="w-6 h-6" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl glass p-6 shadow-card">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Rejected</p>
            <p className="font-head text-2xl font-bold text-foreground">
              {items.filter(item => item.verificationStatus === 'Rejected').length}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error/15 text-error-fg">
            <X className="w-6 h-6" />
          </div>
        </div>
      </Reveal>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Reveal>
          <ModernTableContainer
            title="KYC Verification Requests"
            subtitle={`${filteredItems.length} request${filteredItems.length !== 1 ? 's' : ''} found`}
          >
            {filteredItems.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-8 h-8 text-muted-foreground" />}
                title="No KYC Requests Found"
                description={filter === 'all' ? 'No KYC submissions found.' : `No ${filter} requests found.`}
              />
            ) : (
              <table className="min-w-full">
                <ModernTableHeader columns={columns} />
                <tbody>
                  {filteredItems.map((request, index) => (
                    <ModernTableRow key={request._id} isEven={index % 2 === 0}>
                      <ModernTableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={request?.userId?.name || 'Unknown Doctor'}
                            size="sm"
                          />
                          <div>
                            <div className="font-medium text-foreground">
                              {request?.userId?.name || 'Unknown Doctor'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {request?.userId?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </ModernTableCell>

                      <ModernTableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-violet/15">
                            <Briefcase className="w-4 h-4 text-brand-violet" />
                          </div>
                          <span className="text-foreground">
                            {request?.specializationId?.name || 'Not specified'}
                          </span>
                        </div>
                      </ModernTableCell>

                      <ModernTableCell>
                        {request?.kyc?.submittedAt ? (
                          <DateTimeDisplay
                            date={request.kyc.submittedAt}
                            format="date-only"
                          />
                        ) : (
                          <span className="text-muted-foreground italic">Not submitted</span>
                        )}
                      </ModernTableCell>

                      <ModernTableCell>
                        <StatusBadge status={request.verificationStatus} type="kyc" />
                      </ModernTableCell>

                      <ModernTableCell>
                        {request?.kyc?.documents && request.kyc.documents.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {request.kyc.documents.slice(0, 2).map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-md bg-brand-cyan/15 px-2 py-1 text-xs font-medium text-brand-cyan-fg transition-colors hover:bg-brand-cyan/25"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Doc {idx + 1}
                              </a>
                            ))}
                            {request.kyc.documents.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{request.kyc.documents.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">No documents</span>
                        )}
                      </ModernTableCell>

                      <ModernTableCell>
                        {request.verificationStatus === 'Submitted' && (
                          <div className="flex items-center gap-2">
                            <ActionButton
                              variant="success"
                              size="xs"
                              icon={<Check className="w-3 h-3" />}
                              onClick={() => updateStatus(request._id, 'Approved')}
                              disabled={updatingId === request._id}
                            >
                              Approve
                            </ActionButton>
                            <ActionButton
                              variant="danger"
                              size="xs"
                              icon={<X className="w-3 h-3" />}
                              onClick={() => updateStatus(request._id, 'Rejected')}
                              disabled={updatingId === request._id}
                            >
                              Reject
                            </ActionButton>
                          </div>
                        )}
                        {updatingId === request._id && (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-cyan/40 border-t-brand-cyan"></div>
                        )}
                      </ModernTableCell>
                    </ModernTableRow>
                  ))}
                </tbody>
              </table>
            )}
          </ModernTableContainer>
        </Reveal>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 lg:hidden">
        {filteredItems.length === 0 ? (
          <MobileCard>
            <EmptyState
              icon={<FileText className="w-8 h-8 text-muted-foreground" />}
              title="No KYC Requests Found"
              description={filter === 'all' ? 'No KYC submissions found.' : `No ${filter} requests found.`}
            />
          </MobileCard>
        ) : (
          filteredItems.map((request) => (
            <MobileCard key={request._id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={request?.userId?.name || 'Unknown Doctor'}
                      size="md"
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {request?.userId?.name || 'Unknown Doctor'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {request?.userId?.email || 'No email'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={request.verificationStatus} type="kyc" />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Specialization</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-brand-violet" />
                      <span className="text-foreground">
                        {request?.specializationId?.name || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Submitted</label>
                    <div className="mt-1">
                      {request?.kyc?.submittedAt ? (
                        <DateTimeDisplay
                          date={request.kyc.submittedAt}
                          format="date-only"
                        />
                      ) : (
                        <span className="text-muted-foreground italic">Not submitted</span>
                      )}
                    </div>
                  </div>

                  {request?.kyc?.documents && request.kyc.documents.length > 0 && (
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Documents</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {request.kyc.documents.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-brand-cyan/15 px-3 py-1 text-xs font-medium text-brand-cyan-fg transition-colors hover:bg-brand-cyan/25"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Document {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {request?.kyc?.rejectedReason && (
                    <div>
                      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Rejection Reason</label>
                      <div className="mt-1 rounded-lg border border-error/20 bg-error/10 p-3">
                        <p className="text-sm text-error-fg">{request.kyc.rejectedReason}</p>
                      </div>
                    </div>
                  )}
                </div>

                {request.verificationStatus === 'Submitted' && (
                  <div className="flex gap-2 pt-2">
                    <ActionButton
                      variant="success"
                      size="sm"
                      icon={<Check className="w-4 h-4" />}
                      onClick={() => updateStatus(request._id, 'Approved')}
                      disabled={updatingId === request._id}
                      className="flex-1 justify-center"
                    >
                      {updatingId === request._id ? 'Processing...' : 'Approve'}
                    </ActionButton>
                    <ActionButton
                      variant="danger"
                      size="sm"
                      icon={<X className="w-4 h-4" />}
                      onClick={() => updateStatus(request._id, 'Rejected')}
                      disabled={updatingId === request._id}
                      className="flex-1 justify-center"
                    >
                      {updatingId === request._id ? 'Processing...' : 'Reject'}
                    </ActionButton>
                  </div>
                )}
              </div>
            </MobileCard>
          ))
        )}
      </div>
    </div>
  );
}
