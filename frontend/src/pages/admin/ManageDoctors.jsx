import { useEffect, useState } from 'react';
import { FiUser, FiMail, FiBriefcase, FiMapPin, FiStar, FiTrash2, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import {
  ModernTableContainer,
  ModernTableHeader,
  ModernTableRow,
  ModernTableCell,
  StarRating,
  Avatar,
  ActionButton,
  EmptyState,
  LoadingState,
  MobileCard
} from '../../components/ui';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const fetchDoctors = async (sort = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/doctors${sort ? `?sortBy=${sort}` : ''}`);
      setDoctors(res.data.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors(sortBy);
  }, [sortBy]);

  const onRemove = async (userId) => {
    if (!confirm('Remove this doctor? This action cannot be undone.')) return;
    
    setRemovingId(userId);
    const loadingToast = toast.loading('Removing doctor...');
    
    try {
      await api.delete(`/admin/doctors/${userId}`);
      toast.dismiss(loadingToast);
      toast.success('Doctor removed successfully');
      setDoctors((prev) => prev.filter((d) => d.userId?._id !== userId));
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error(e?.response?.data?.message || 'Failed to remove doctor');
    } finally {
      setRemovingId(null);
    }
  };

  const columns = [
    { label: 'Doctor', icon: <FiUser className="w-4 h-4 text-blue-500" /> },
    { label: 'Contact', icon: <FiMail className="w-4 h-4 text-green-500" /> },
    { label: 'Specialization', icon: <FiBriefcase className="w-4 h-4 text-purple-500" /> },
    { label: 'Hospital', icon: <FiMapPin className="w-4 h-4 text-teal-500" /> },
    { label: 'Location', icon: <FiMapPin className="w-4 h-4 text-orange-500" /> },
    { label: 'Rating', icon: <FiStar className="w-4 h-4 text-yellow-500" /> },
    { label: 'Actions', icon: <FiTrash2 className="w-4 h-4 text-red-500" /> }
  ];

  const sortOptions = [
    { value: '', label: 'Default Order' },
    { value: 'rating_desc', label: 'Highest Rated' },
    { value: 'rating_asc', label: 'Lowest Rated' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Doctors</h1>
          <p className="text-gray-600">View and manage registered doctors in the system</p>
        </div>
        
        <div className="flex items-center gap-3">
          <FiFilter className="w-5 h-5 text-gray-400" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <ModernTableContainer
          title="Registered Doctors"
          subtitle={`${doctors.length} doctor${doctors.length !== 1 ? 's' : ''} in the system`}
        >
          {loading ? (
            <LoadingState rows={5} />
          ) : doctors.length === 0 ? (
            <EmptyState
              icon={<FiUser className="w-8 h-8 text-gray-400" />}
              title="No Doctors Found"
              description="No doctors are registered in the system yet."
            />
          ) : (
            <table className="min-w-full">
              <ModernTableHeader columns={columns} />
              <tbody>
                {doctors.map((doctor, index) => (
                  <ModernTableRow key={doctor._id} isEven={index % 2 === 0}>
                    <ModernTableCell>
                      <div className="flex items-center gap-3">
                        <Avatar 
                          src={doctor.photoUrl ? `http://localhost:5000${doctor.photoUrl}` : null}
                          name={doctor.userId?.name || 'Unknown Doctor'} 
                          size="sm"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {doctor.userId?.name || 'Unknown Doctor'}
                          </div>
                          <div className="text-sm text-gray-500">Doctor</div>
                        </div>
                      </div>
                    </ModernTableCell>
                    
                    <ModernTableCell>
                      <div className="flex items-center gap-2">
                        <FiMail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {doctor.userId?.email || 'No email'}
                        </span>
                      </div>
                    </ModernTableCell>
                    
                    <ModernTableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                          <FiBriefcase className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-gray-700">
                          {doctor.specializationId?.name || 'Not specified'}
                        </span>
                      </div>
                    </ModernTableCell>
                    
                    <ModernTableCell>
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium text-sm">
                          {doctor.hospitalId?.name || 'Not assigned'}
                        </span>
                        {doctor.hospitalId?.district && (
                          <span className="text-xs text-gray-500">
                            {doctor.hospitalId.district}
                          </span>
                        )}
                      </div>
                    </ModernTableCell>
                    
                    <ModernTableCell>
                      <div className="flex items-center gap-2">
                        <FiMapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">
                          {doctor.userId?.district || doctor.district || 'Not specified'}
                        </span>
                      </div>
                    </ModernTableCell>
                    
                    <ModernTableCell>
                      <StarRating 
                        rating={doctor.averageRating || 0} 
                        size="sm"
                      />
                    </ModernTableCell>
                    
                    <ModernTableCell>
                      <ActionButton
                        variant="danger"
                        size="xs"
                        icon={<FiTrash2 className="w-3 h-3" />}
                        onClick={() => onRemove(doctor.userId?._id)}
                        disabled={removingId === doctor.userId?._id}
                      >
                        {removingId === doctor.userId?._id ? 'Removing...' : 'Remove'}
                      </ActionButton>
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
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <MobileCard key={index}>
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <MobileCard>
            <EmptyState
              icon={<FiUser className="w-8 h-8 text-gray-400" />}
              title="No Doctors Found"
              description="No doctors are registered in the system yet."
            />
          </MobileCard>
        ) : (
          doctors.map((doctor) => (
            <MobileCard key={doctor._id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      src={doctor.photoUrl ? `http://localhost:5000${doctor.photoUrl}` : null}
                      name={doctor.userId?.name || 'Unknown Doctor'} 
                      size="md"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {doctor.userId?.name || 'Unknown Doctor'}
                      </h3>
                      <p className="text-sm text-gray-500">Doctor</p>
                    </div>
                  </div>
                  <ActionButton
                    variant="danger"
                    size="sm"
                    icon={<FiTrash2 className="w-4 h-4" />}
                    onClick={() => onRemove(doctor.userId?._id)}
                    disabled={removingId === doctor.userId?._id}
                  >
                    {removingId === doctor.userId?._id ? 'Removing...' : 'Remove'}
                  </ActionButton>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                    <div className="mt-1 flex items-center gap-2">
                      <FiMail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">
                        {doctor.userId?.email || 'No email'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Specialization</label>
                    <div className="mt-1 flex items-center gap-2">
                      <FiBriefcase className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-700">
                        {doctor.specializationId?.name || 'Not specified'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</label>
                    <div className="mt-1 flex items-center gap-2">
                      <FiMapPin className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-700">
                        {doctor.userId?.district || doctor.district || 'Not specified'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rating</label>
                    <div className="mt-1">
                      <StarRating 
                        rating={doctor.averageRating || 0} 
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </MobileCard>
          ))
        )}
      </div>
    </div>
  );
}
