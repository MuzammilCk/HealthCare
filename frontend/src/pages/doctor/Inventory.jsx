import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, AlertTriangle, Package, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { cn } from '../../utils/cn';
import { Button, buttonVariants } from '../../components/ui/Button';
import Reveal from '../../components/Reveal';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [formData, setFormData] = useState({
    medicineName: '',
    genericName: '',
    manufacturer: '',
    stockQuantity: '',
    price: '',
    unit: 'tablet',
    batchNumber: '',
    expiryDate: '',
    minStockLevel: '10',
    notes: ''
  });

  const inputCls =
    'w-full rounded-xl bg-background/60 border border-border px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors';
  const labelCls = 'mb-1 block text-sm font-medium text-muted-foreground';

  // Helper to convert paise to rupees
  const formatPrice = (paise) => `₹${(paise / 100).toFixed(2)}`;

  // Helper to convert rupees to paise
  const rupeesToPaise = (rupees) => Math.round(parseFloat(rupees) * 100);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (showLowStock) params.append('isLowStock', 'true');

      const response = await api.get(`/inventory/my-hospital?${params}`);
      setInventory(response.data.inventory || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [searchQuery, showLowStock]);

  const resetForm = () => {
    setFormData({
      medicineName: '',
      genericName: '',
      manufacturer: '',
      stockQuantity: '',
      price: '',
      unit: 'tablet',
      batchNumber: '',
      expiryDate: '',
      minStockLevel: '10',
      notes: ''
    });
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        stockQuantity: parseInt(formData.stockQuantity),
        price: rupeesToPaise(formData.price),
        minStockLevel: parseInt(formData.minStockLevel)
      };

      await api.post('/inventory', data);
      toast.success('Medicine added successfully!');
      setShowAddModal(false);
      resetForm();
      loadInventory();
    } catch (error) {
      console.error('Error adding medicine:', error);
      toast.error(error?.response?.data?.message || 'Failed to add medicine');
    }
  };

  const handleEditMedicine = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        stockQuantity: parseInt(formData.stockQuantity),
        price: rupeesToPaise(formData.price),
        minStockLevel: parseInt(formData.minStockLevel)
      };

      await api.put(`/inventory/${selectedItem._id}`, data);
      toast.success('Medicine updated successfully!');
      setShowEditModal(false);
      setSelectedItem(null);
      resetForm();
      loadInventory();
    } catch (error) {
      console.error('Error updating medicine:', error);
      toast.error(error?.response?.data?.message || 'Failed to update medicine');
    }
  };

  const handleDeleteMedicine = async (item) => {
    if (!window.confirm(`Are you sure you want to delete ${item.medicineName}?`)) {
      return;
    }

    try {
      await api.delete(`/inventory/${item._id}`);
      toast.success('Medicine deleted successfully!');
      loadInventory();
    } catch (error) {
      console.error('Error deleting medicine:', error);
      toast.error('Failed to delete medicine');
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      medicineName: item.medicineName,
      genericName: item.genericName || '',
      manufacturer: item.manufacturer || '',
      stockQuantity: item.stockQuantity.toString(),
      price: (item.price / 100).toFixed(2),
      unit: item.unit,
      batchNumber: item.batchNumber || '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      minStockLevel: item.minStockLevel.toString(),
      notes: item.notes || ''
    });
    setShowEditModal(true);
  };

  const MedicineForm = ({ onSubmit, onCancel, isEdit = false }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelCls}>
            Medicine Name *
          </label>
          <input
            type="text"
            value={formData.medicineName}
            onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
            className={inputCls}
            required
            disabled={isEdit}
          />
        </div>

        <div>
          <label className={labelCls}>
            Generic Name
          </label>
          <input
            type="text"
            value={formData.genericName}
            onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>
            Manufacturer
          </label>
          <input
            type="text"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>
            Stock Quantity *
          </label>
          <input
            type="number"
            min="0"
            value={formData.stockQuantity}
            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
            className={inputCls}
            required
          />
        </div>

        <div>
          <label className={labelCls}>
            Price per Unit (₹) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className={inputCls}
            required
          />
        </div>

        <div>
          <label className={labelCls}>
            Unit *
          </label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className={inputCls}
          >
            <option value="tablet">Tablet</option>
            <option value="capsule">Capsule</option>
            <option value="syrup">Syrup</option>
            <option value="injection">Injection</option>
            <option value="cream">Cream</option>
            <option value="drops">Drops</option>
            <option value="inhaler">Inhaler</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>
            Batch Number
          </label>
          <input
            type="text"
            value={formData.batchNumber}
            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>
            Expiry Date
          </label>
          <input
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>
            Min Stock Level *
          </label>
          <input
            type="number"
            min="0"
            value={formData.minStockLevel}
            onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
            className={inputCls}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className={inputCls}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEdit ? 'Update Medicine' : 'Add Medicine'}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <Reveal>
          <div>
            <h1 className="font-head text-3xl font-bold tracking-tight text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground">Manage your hospital's pharmacy inventory</p>
          </div>
        </Reveal>

        <Reveal>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="w-full sm:w-auto sm:flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-background/60 border border-border py-2 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLowStock(!showLowStock)}
                className={cn(
                  'flex items-center rounded-lg px-4 py-2 font-medium transition-colors',
                  showLowStock
                    ? 'bg-gradient-to-br from-brand-cyan to-brand-teal text-white shadow-glow'
                    : 'glass text-foreground hover:bg-foreground/5'
                )}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Low Stock
              </button>

              <Button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Medicine
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal>
          {loading ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-brand-cyan/30 border-t-brand-cyan"></div>
              <p className="text-muted-foreground">Loading inventory...</p>
            </div>
          ) : inventory.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center shadow-card">
              <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
              <h3 className="mb-2 font-head text-xl font-semibold text-foreground">No Medicines Found</h3>
              <p className="mb-4 text-muted-foreground">
                {searchQuery || showLowStock
                  ? 'No medicines match your filters'
                  : 'Start by adding medicines to your inventory'}
              </p>
              {!searchQuery && !showLowStock && (
                <Button
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}
                >
                  Add First Medicine
                </Button>
              )}
            </div>
          ) : (
            <div className="glass overflow-hidden rounded-2xl shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-foreground/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Medicine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Expiry
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {inventory.map((item) => (
                      <tr key={item._id} className="transition-colors hover:bg-foreground/5">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-foreground">{item.medicineName}</div>
                            {item.genericName && (
                              <div className="text-sm text-muted-foreground">{item.genericName}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{item.stockQuantity}</span>
                            {item.isLowStock && (
                              <span className="rounded-full bg-amber-400/15 px-2 py-1 text-xs font-semibold text-amber-500">
                                Low
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-6 py-4 capitalize text-muted-foreground">
                          {item.unit}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {item.expiryDate
                            ? new Date(item.expiryDate).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="rounded-lg p-2 text-brand-cyan-fg transition-colors hover:bg-brand-cyan/10"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMedicine(item)}
                              className="rounded-lg p-2 text-error-fg transition-colors hover:bg-error/10"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Reveal>

        {/* Add Medicine Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="glass-strong max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl shadow-glow">
              <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background/80 p-6 backdrop-blur">
                <h2 className="font-head text-2xl font-bold text-foreground">Add New Medicine</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <MedicineForm
                  onSubmit={handleAddMedicine}
                  onCancel={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Medicine Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="glass-strong max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl shadow-glow">
              <div className="sticky top-0 flex items-center justify-between border-b border-border bg-background/80 p-6 backdrop-blur">
                <h2 className="font-head text-2xl font-bold text-foreground">Edit Medicine</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedItem(null);
                    resetForm();
                  }}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6">
                <MedicineForm
                  onSubmit={handleEditMedicine}
                  onCancel={() => {
                    setShowEditModal(false);
                    setSelectedItem(null);
                    resetForm();
                  }}
                  isEdit={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
