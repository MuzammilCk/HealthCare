import { useEffect, useState } from 'react';
import { FiUser, FiCalendar, FiBriefcase, FiFileText, FiCheck, FiX, FiClock, FiFilter, FiExternalLink } from 'react-icons/fi';
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
  MobileCard
} from '../../components/ui';

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
    { label: 'Doctor', icon: <FiUser className="w-4 h-4 text-blue-500" /> },
    { label: 'Specialization', icon: <FiBriefcase className="w-4 h-4 text-purple-500" /> },
    { label: 'Submitted', icon: <FiCalendar className="w-4 h-4 text-green-500" /> },
    { label: 'Status', icon: <FiClock className="w-4 h-4 text-orange-500" /> },
    { label: 'Documents', icon: <FiFileText className="w-4 h-4 text-teal-500" /> },
    { label: 'Actions', icon: <FiCheck className="w-4 h-4 text-red-500" /> }
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification Requests</h1>
          <p className="text-gray-600">Review and manage doctor verification requests</p>
        </div>
        <ModernTableContainer>
          <LoadingState rows={5} />
        </ModernTableContainer>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification Requests</h1>
          <p className="text-gray-600">Review and manage doctor verification requests</p>
        </div>
        
        <div className="flex items-center gap-3">
          <FiFilter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-900">
                {items.filter(item => item.verificationStatus === 'Submitted').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-200 rounded-xl flex items-center justify-center">
              <FiClock className="w-6 h-6 text-yellow-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Approved</p>
              <p className="text-2xl font-bold text-green-900">
                {items.filter(item => item.verificationStatus === 'Approved').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
              <FiCheck className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Rejected</p>
              <p className="text-2xl font-bold text-red-900">
                {items.filter(item => item.verificationStatus === 'Rejected').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-200 rounded-xl flex items-center justify-center">
              <FiX className="w-6 h-6 text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <ModernTableContainer
          title="KYC Verification Requests"
          subtitle={`${filteredItems.length} request${filteredItems.length !== 1 ? 's' : ''} found`}
        >
          {filteredItems.length === 0 ? (
            <EmptyState
              icon={<FiFileText className="w-8 h-8 text-gray-400" />}
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
                          <div className="font-medium text-gray-900">
                            {request?.userId?.name || 'Unknown Doctor'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request?.userId?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </ModernTableCell>
                    
                    <ModernTableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                          <FiBriefcase className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-gray-700">
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
                        <span className="text-gray-400 italic">Not submitted</span>
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
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                            >
                              <FiExternalLink className="w-3 h-3" />
                              Doc {idx + 1}
                            </a>
                          ))}
                          {request.kyc.documents.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{request.kyc.documents.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No documents</span>
                      )}
                    </ModernTableCell>
                    
                    <ModernTableCell>
                      {request.verificationStatus === 'Submitted' && (
                        <div className="flex items-center gap-2">
                          <ActionButton
                            variant="success"
                            size="xs"
                            icon={<FiCheck className="w-3 h-3" />}
                            onClick={() => updateStatus(request._id, 'Approved')}
                            disabled={updatingId === request._id}
                          >
                            Approve
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            size="xs"
                            icon={<FiX className="w-3 h-3" />}
                            onClick={() => updateStatus(request._id, 'Rejected')}
                            disabled={updatingId === request._id}
                          >
                            Reject
                          </ActionButton>
                        </div>
                      )}
                      {updatingId === request._id && (
                        <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                      )}
                    </ModernTableCell>
                  </ModernTableRow>
                ))}
              </tbody>
            </table>
          )}
        </ModernTableContainer>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredItems.length === 0 ? (
          <MobileCard>
            <EmptyState
              icon={<FiFileText className="w-8 h-8 text-gray-400" />}
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
                      <h3 className="font-semibold text-gray-900">
                        {request?.userId?.name || 'Unknown Doctor'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {request?.userId?.email || 'No email'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={request.verificationStatus} type="kyc" />
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Specialization</label>
                    <div className="mt-1 flex items-center gap-2">
                      <FiBriefcase className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-700">
                        {request?.specializationId?.name || 'Not specified'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Submitted</label>
                    <div className="mt-1">
                      {request?.kyc?.submittedAt ? (
                        <DateTimeDisplay 
                          date={request.kyc.submittedAt} 
                          format="date-only"
                        />
                      ) : (
                        <span className="text-gray-400 italic">Not submitted</span>
                      )}
                    </div>
                  </div>
                  
                  {request?.kyc?.documents && request.kyc.documents.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Documents</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {request.kyc.documents.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                          >
                            <FiExternalLink className="w-3 h-3" />
                            Document {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {request?.kyc?.rejectedReason && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rejection Reason</label>
                      <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{request.kyc.rejectedReason}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {request.verificationStatus === 'Submitted' && (
                  <div className="flex gap-2 pt-2">
                    <ActionButton
                      variant="success"
                      size="sm"
                      icon={<FiCheck className="w-4 h-4" />}
                      onClick={() => updateStatus(request._id, 'Approved')}
                      disabled={updatingId === request._id}
                      className="flex-1 justify-center"
                    >
                      {updatingId === request._id ? 'Processing...' : 'Approve'}
                    </ActionButton>
                    <ActionButton
                      variant="danger"
                      size="sm"
                      icon={<FiX className="w-4 h-4" />}
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
