import { useEffect, useState } from 'react';
import { User, Mail, Briefcase, MapPin, Star, Trash2, Filter } from 'lucide-react';
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
  MobileCard,
  AppSelect
} from '../../components/ui';
import { cn } from '../../utils/cn';
import Reveal from '../../components/Reveal';

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
    { label: 'Doctor', icon: <User className="w-4 h-4 text-brand-cyan-fg" /> },
    { label: 'Contact', icon: <Mail className="w-4 h-4 text-brand-teal" /> },
    { label: 'Specialization', icon: <Briefcase className="w-4 h-4 text-brand-violet" /> },
    { label: 'Hospital', icon: <MapPin className="w-4 h-4 text-brand-sky-fg" /> },
    { label: 'Location', icon: <MapPin className="w-4 h-4 text-brand-indigo" /> },
    { label: 'Rating', icon: <Star className="w-4 h-4 text-brand-cyan-fg" /> },
    { label: 'Actions', icon: <Trash2 className="w-4 h-4 text-brand-cyan-fg" /> }
  ];

  const sortOptions = [
    { value: '', label: 'Default Order' },
    { value: 'rating_desc', label: 'Highest Rated' },
    { value: 'rating_asc', label: 'Lowest Rated' }
  ];

  return (
    <div className="space-y-6 bg-background text-foreground">
      <Reveal className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 font-head text-3xl font-bold tracking-tight text-foreground">Manage Doctors</h1>
          <p className="text-muted-foreground">View and manage registered doctors in the system</p>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <AppSelect
            value={sortBy}
            onChange={setSortBy}
            options={sortOptions}
            placeholder="Sort doctors"
            className="min-w-[200px]"
          />
        </div>
      </Reveal>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <Reveal>
          <ModernTableContainer
            title="Registered Doctors"
            subtitle={`${doctors.length} doctor${doctors.length !== 1 ? 's' : ''} in the system`}
          >
            {loading ? (
              <LoadingState rows={5} />
            ) : doctors.length === 0 ? (
              <EmptyState
                icon={<User className="w-8 h-8 text-muted-foreground" />}
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
                            <div className="font-medium text-foreground">
                              {doctor.userId?.name || 'Unknown Doctor'}
                            </div>
                            <div className="text-sm text-muted-foreground">Doctor</div>
                          </div>
                        </div>
                      </ModernTableCell>

                      <ModernTableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {doctor.userId?.email || 'No email'}
                          </span>
                        </div>
                      </ModernTableCell>

                      <ModernTableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-violet/15">
                            <Briefcase className="w-4 h-4 text-brand-violet" />
                          </div>
                          <span className="text-foreground">
                            {doctor.specializationId?.name || 'Not specified'}
                          </span>
                        </div>
                      </ModernTableCell>

                      <ModernTableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {doctor.hospitalId?.name || 'Not assigned'}
                          </span>
                          {doctor.hospitalId?.district && (
                            <span className="text-xs text-muted-foreground">
                              {doctor.hospitalId.district}
                            </span>
                          )}
                        </div>
                      </ModernTableCell>

                      <ModernTableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">
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
                          icon={<Trash2 className="w-3 h-3" />}
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
        </Reveal>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 lg:hidden">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <MobileCard key={index}>
                <div className="animate-pulse">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-foreground/10"></div>
                    <div className="flex-1">
                      <div className="mb-2 h-4 w-3/4 rounded bg-foreground/10"></div>
                      <div className="h-3 w-1/2 rounded bg-foreground/10"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-foreground/10"></div>
                    <div className="h-3 w-2/3 rounded bg-foreground/10"></div>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <MobileCard>
            <EmptyState
              icon={<User className="w-8 h-8 text-muted-foreground" />}
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
                      <h3 className="font-semibold text-foreground">
                        {doctor.userId?.name || 'Unknown Doctor'}
                      </h3>
                      <p className="text-sm text-muted-foreground">Doctor</p>
                    </div>
                  </div>
                  <ActionButton
                    variant="danger"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => onRemove(doctor.userId?._id)}
                    disabled={removingId === doctor.userId?._id}
                  >
                    {removingId === doctor.userId?._id ? 'Removing...' : 'Remove'}
                  </ActionButton>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {doctor.userId?.email || 'No email'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Specialization</label>
                    <div className="mt-1 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-brand-violet" />
                      <span className="text-foreground">
                        {doctor.specializationId?.name || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Location</label>
                    <div className="mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-indigo" />
                      <span className="text-foreground">
                        {doctor.userId?.district || doctor.district || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Rating</label>
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
