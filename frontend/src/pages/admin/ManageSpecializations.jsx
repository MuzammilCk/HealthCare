import { useEffect, useState } from 'react';
import { FiPlus, FiBriefcase, FiFileText, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
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
  MobileCard
} from '../../components/ui';

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
    { label: 'Specialization', icon: <FiBriefcase className="w-4 h-4 text-blue-500" /> },
    { label: 'Description', icon: <FiFileText className="w-4 h-4 text-green-500" /> },
    { label: 'Actions', icon: null }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Specializations</h1>
        <p className="text-gray-600">Add and manage medical specializations for doctors</p>
      </div>

      {/* Add New Specialization Form */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <FiPlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add New Specialization</h2>
            <p className="text-sm text-gray-600">Create a new medical specialization</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Specialization Name *
              </label>
              <div className="relative">
                <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  id="name"
                  type="text"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white" 
                  placeholder="e.g., Cardiology, Neurology"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <FiFileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea 
                  id="description"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white resize-none" 
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
            icon={<FiPlus className="w-4 h-4" />}
            disabled={saving}
            className="w-full md:w-auto"
          >
            {saving ? 'Adding Specialization...' : 'Add Specialization'}
          </ActionButton>
        </form>
      </div>

      {/* Specializations Table */}
      <div className="hidden md:block">
        <ModernTableContainer
          title="Medical Specializations"
          subtitle={`${list.length} specialization${list.length !== 1 ? 's' : ''} available`}
        >
          {loading ? (
            <LoadingState rows={5} />
          ) : list.length === 0 ? (
            <EmptyState
              icon={<FiBriefcase className="w-8 h-8 text-gray-400" />}
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
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                          <FiBriefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{specialization.name}</div>
                          <div className="text-sm text-gray-500">Medical Specialization</div>
                        </div>
                      </div>
                    </ModernTableCell>
                    
                    <ModernTableCell>
                      <div className="text-gray-700">
                        {specialization.description || (
                          <span className="text-gray-400 italic">No description provided</span>
                        )}
                      </div>
                    </ModernTableCell>
                    
                    <ModernTableCell>
                      <div className="flex items-center gap-2">
                        <ActionButton
                          variant="secondary"
                          size="sm"
                          icon={<FiEdit2 className="w-4 h-4" />}
                          onClick={() => handleEdit(specialization)}
                          title="Edit"
                        >
                          Edit
                        </ActionButton>
                        <ActionButton
                          variant="danger"
                          size="sm"
                          icon={<FiTrash2 className="w-4 h-4" />}
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
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <MobileCard key={index}>
                <div className="animate-pulse">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>
        ) : list.length === 0 ? (
          <MobileCard>
            <EmptyState
              icon={<FiBriefcase className="w-8 h-8 text-gray-400" />}
              title="No Specializations Found"
              description="Add your first medical specialization to get started."
            />
          </MobileCard>
        ) : (
          list.map((specialization) => (
            <MobileCard key={specialization._id}>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <FiBriefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{specialization.name}</h3>
                    <p className="text-sm text-gray-500">Medical Specialization</p>
                  </div>
                </div>
                
                {specialization.description && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</label>
                    <p className="mt-1 text-gray-700">{specialization.description}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <ActionButton
                    variant="secondary"
                    size="sm"
                    icon={<FiEdit2 className="w-4 h-4" />}
                    onClick={() => handleEdit(specialization)}
                    className="flex-1"
                  >
                    Edit
                  </ActionButton>
                  <ActionButton
                    variant="danger"
                    size="sm"
                    icon={<FiTrash2 className="w-4 h-4" />}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Specialization</h2>
              <button
                onClick={() => setEditingSpec(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization Name *
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editingSpec.name}
                  onChange={(e) => setEditingSpec({ ...editingSpec, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={editingSpec.description || ''}
                  onChange={(e) => setEditingSpec({ ...editingSpec, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingSpec(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
              <button
                onClick={() => setDeletingSpec(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete the specialization{' '}
                <span className="font-semibold">"{deletingSpec.name}"</span>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingSpec(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}