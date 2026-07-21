import { useEffect, useState } from 'react';
import { Plus, Briefcase, FileText, Pencil, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import {
  ModernTableContainer,
  ModernTableHeader,
  ModernTableRow,
  ModernTableCell,
  ActionButton,
  EmptyState,
  LoadingState,
  MobileCard,
  Button
} from '../../components/ui';
import { cn } from '../../utils/cn';
import Reveal from '../../components/Reveal';

const inputCls =
  'w-full bg-background/60 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-colors';

export default function ManageSpecializations() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSpec, setEditingSpec] = useState(null);
  const [deletingSpec, setDeletingSpec] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/specializations');
      setList(res.data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading('Adding specialization...');

    try {
      await api.post('/specializations', { name, description });
      toast.dismiss(loadingToast);
      toast.success('Specialization added successfully!');
      setName('');
      setDescription('');
      await load();
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error(e.response?.data?.message || 'Failed to add specialization.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (spec) => {
    setEditingSpec({ ...spec });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingSpec.name) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading('Updating specialization...');

    try {
      await api.put(`/specializations/${editingSpec._id}`, {
        name: editingSpec.name,
        description: editingSpec.description
      });
      toast.dismiss(loadingToast);
      toast.success('Specialization updated successfully!');
      setEditingSpec(null);
      await load();
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error(e.response?.data?.message || 'Failed to update specialization.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSpec) return;

    setSaving(true);
    const loadingToast = toast.loading('Deleting specialization...');

    try {
      await api.delete(`/specializations/${deletingSpec._id}`);
      toast.dismiss(loadingToast);
      toast.success('Specialization deleted successfully!');
      setDeletingSpec(null);
      await load();
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error(e.response?.data?.message || 'Failed to delete specialization.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { label: 'Specialization', icon: <Briefcase className="w-4 h-4 text-brand-cyan-fg" /> },
    { label: 'Description', icon: <FileText className="w-4 h-4 text-brand-teal" /> },
    { label: 'Actions', icon: null }
  ];

  return (
    <div className="space-y-8 bg-background text-foreground">
      <Reveal>
        <div>
          <h1 className="mb-2 font-head text-3xl font-bold tracking-tight text-foreground">Manage Specializations</h1>
          <p className="text-muted-foreground">Add and manage medical specializations for doctors</p>
        </div>
      </Reveal>

      {/* Add New Specialization Form */}
      <Reveal className="rounded-2xl glass p-6 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-cyan to-brand-teal text-white shadow-glow">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-head text-lg font-semibold text-foreground">Add New Specialization</h2>
            <p className="text-sm text-muted-foreground">Create a new medical specialization</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-muted-foreground">
                Specialization Name *
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 w-5 h-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(inputCls, 'pl-10')}
                  placeholder="e.g., Cardiology, Neurology"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-muted-foreground">
                Description
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cn(inputCls, 'resize-none pl-10')}
                  placeholder="Brief description of the specialization"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <ActionButton
            type="submit"
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            disabled={saving}
            className="w-full md:w-auto"
          >
            {saving ? 'Adding Specialization...' : 'Add Specialization'}
          </ActionButton>
        </form>
      </Reveal>

      {/* Specializations Table */}
      <div className="hidden md:block">
        <Reveal>
          <ModernTableContainer
            title="Medical Specializations"
            subtitle={`${list.length} specialization${list.length !== 1 ? 's' : ''} available`}
          >
            {loading ? (
              <LoadingState rows={5} />
            ) : list.length === 0 ? (
              <EmptyState
                icon={<Briefcase className="w-8 h-8 text-muted-foreground" />}
                title="No Specializations Found"
                description="Add your first medical specialization to get started."
              />
            ) : (
              <table className="min-w-full">
                <ModernTableHeader columns={columns} />
                <tbody>
                  {list.map((specialization, index) => (
                    <ModernTableRow key={specialization._id} isEven={index % 2 === 0}>
                      <ModernTableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-cyan/15">
                            <Briefcase className="w-5 h-5 text-brand-cyan-fg" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{specialization.name}</div>
                            <div className="text-sm text-muted-foreground">Medical Specialization</div>
                          </div>
                        </div>
                      </ModernTableCell>

                      <ModernTableCell>
                        <div className="text-foreground">
                          {specialization.description || (
                            <span className="italic text-muted-foreground">No description provided</span>
                          )}
                        </div>
                      </ModernTableCell>

                      <ModernTableCell>
                        <div className="flex items-center gap-2">
                          <ActionButton
                            variant="secondary"
                            size="sm"
                            icon={<Pencil className="w-4 h-4" />}
                            onClick={() => handleEdit(specialization)}
                            title="Edit"
                          >
                            Edit
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            size="sm"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => setDeletingSpec(specialization)}
                            title="Delete"
                          >
                            Delete
                          </ActionButton>
                        </div>
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
      <div className="space-y-4 md:hidden">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <MobileCard key={index}>
                <div className="animate-pulse">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-foreground/10"></div>
                    <div className="flex-1">
                      <div className="mb-2 h-4 w-3/4 rounded bg-foreground/10"></div>
                      <div className="h-3 w-1/2 rounded bg-foreground/10"></div>
                    </div>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        ) : list.length === 0 ? (
          <MobileCard>
            <EmptyState
              icon={<Briefcase className="w-8 h-8 text-muted-foreground" />}
              title="No Specializations Found"
              description="Add your first medical specialization to get started."
            />
          </MobileCard>
        ) : (
          list.map((specialization) => (
            <MobileCard key={specialization._id}>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-cyan/15">
                    <Briefcase className="w-6 h-6 text-brand-cyan-fg" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{specialization.name}</h3>
                    <p className="text-sm text-muted-foreground">Medical Specialization</p>
                  </div>
                </div>

                {specialization.description && (
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</label>
                    <p className="mt-1 text-foreground">{specialization.description}</p>
                  </div>
                )}

                <div className="flex gap-2 border-t border-border pt-3">
                  <ActionButton
                    variant="secondary"
                    size="sm"
                    icon={<Pencil className="w-4 h-4" />}
                    onClick={() => handleEdit(specialization)}
                    className="flex-1"
                  >
                    Edit
                  </ActionButton>
                  <ActionButton
                    variant="danger"
                    size="sm"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => setDeletingSpec(specialization)}
                    className="flex-1"
                  >
                    Delete
                  </ActionButton>
                </div>
              </div>
            </MobileCard>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="glass-strong w-full max-w-md rounded-2xl border border-border p-6 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-head text-xl font-bold text-foreground">Edit Specialization</h2>
              <button
                onClick={() => setEditingSpec(null)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="mb-2 block text-sm font-medium text-muted-foreground">
                  Specialization Name *
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editingSpec.name}
                  onChange={(e) => setEditingSpec({ ...editingSpec, name: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-description" className="mb-2 block text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={editingSpec.description || ''}
                  onChange={(e) => setEditingSpec({ ...editingSpec, description: e.target.value })}
                  className={cn(inputCls, 'resize-none')}
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditingSpec(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="glass-strong w-full max-w-md rounded-2xl border border-border p-6 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-head text-xl font-bold text-foreground">Confirm Delete</h2>
              <button
                onClick={() => setDeletingSpec(null)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-foreground">
                Are you sure you want to delete the specialization{' '}
                <span className="font-semibold">"{deletingSpec.name}"</span>?
              </p>
              <p className="mt-2 text-sm text-error-fg">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setDeletingSpec(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
