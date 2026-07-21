import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Package, AlertCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { AppSelect, ModernTableContainer, Button } from '../../components/ui';
import { cn } from '../../utils/cn';
import Reveal from '../../components/Reveal';

const inputCls =
  'w-full bg-background/60 border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-colors';

export default function ManageInventory() {
  const [inventory, setInventory] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [formData, setFormData] = useState({
    hospitalId: '',
    medicineName: '',
    genericName: '',
    manufacturer: '',
    stockQuantity: '',
    price: '',
    unit: 'tablet',
    batchNumber: '',
    expiryDate: '',
    minStockLevel: '10',
    notes: '',
  });

  useEffect(() => {
    fetchHospitals();
    fetchInventory();
  }, [selectedHospital]);

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/admin/hospitals');
      setHospitals(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load hospitals');
    }
  };

  const fetchInventory = async () => {
    try {
      const url = selectedHospital
        ? `/admin/inventory?hospitalId=${selectedHospital}`
        : '/admin/inventory';
      const res = await api.get(url);
      setInventory(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert price from rupees to paise
    const priceInPaise = Math.round(parseFloat(formData.price) * 100);

    const payload = {
      ...formData,
      price: priceInPaise,
      stockQuantity: parseInt(formData.stockQuantity),
      minStockLevel: parseInt(formData.minStockLevel),
    };

    try {
      if (editingItem) {
        await api.put(`/admin/inventory/${editingItem._id}`, payload);
        toast.success('Medicine updated successfully');
      } else {
        await api.post('/admin/inventory', payload);
        toast.success('Medicine added successfully');
      }

      setShowModal(false);
      resetForm();
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      hospitalId: item.hospitalId._id,
      medicineName: item.medicineName,
      genericName: item.genericName || '',
      manufacturer: item.manufacturer || '',
      stockQuantity: item.stockQuantity.toString(),
      price: (item.price / 100).toFixed(2),
      unit: item.unit,
      batchNumber: item.batchNumber || '',
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      minStockLevel: item.minStockLevel.toString(),
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await api.delete(`/admin/inventory/${id}`);
      toast.success('Medicine deleted successfully');
      fetchInventory();
    } catch (err) {
      toast.error('Failed to delete medicine');
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      hospitalId: '',
      medicineName: '',
      genericName: '',
      manufacturer: '',
      stockQuantity: '',
      price: '',
      unit: 'tablet',
      batchNumber: '',
      expiryDate: '',
      minStockLevel: '10',
      notes: '',
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isLowStock = (item) => item.stockQuantity <= item.minStockLevel;

  const isExpiringSoon = (item) => {
    if (!item.expiryDate) return false;
    const daysUntilExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-foreground/20 border-t-brand-cyan"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl bg-background text-foreground">
      <Reveal className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-head text-3xl font-bold tracking-tight text-foreground">Inventory Management</h1>
          <p className="mt-1 text-muted-foreground">Manage medicines across all hospitals</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Medicine
        </Button>
      </Reveal>

      {/* Filter */}
      <Reveal className="mb-6 rounded-xl glass p-4 shadow-card">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <label className="text-sm font-medium text-muted-foreground">Filter by Hospital:</label>
          <div className="max-w-md flex-1">
            <AppSelect
              placeholder="All Hospitals"
              value={selectedHospital}
              onChange={setSelectedHospital}
              options={[{ value: '', label: 'All Hospitals' }, ...hospitals.map(h => ({ value: h._id, label: `${h.name} - ${h.district || ''}` }))]}
            />
          </div>
        </div>
      </Reveal>

      {/* Inventory Table */}
      <Reveal>
        <ModernTableContainer title="Inventory" subtitle={`${inventory.length} item${inventory.length !== 1 ? 's' : ''} found`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-foreground/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Medicine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Hospital
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inventory.map((item) => (
                  <tr key={item._id} className="transition-colors hover:bg-foreground/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium text-foreground">{item.medicineName}</div>
                          {item.genericName && (
                            <div className="text-xs text-muted-foreground">{item.genericName}</div>
                          )}
                          <div className="text-xs text-muted-foreground">{item.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">{item.hospitalId?.name}</div>
                      <div className="text-xs text-muted-foreground">{item.hospitalId?.district}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-sm font-medium',
                          isLowStock(item) ? 'text-error-fg' : 'text-foreground'
                        )}>
                          {item.stockQuantity}
                        </span>
                        {isLowStock(item) && (
                          <span className="flex items-center gap-1 rounded-full bg-error/15 px-2 py-1 text-xs text-error-fg">
                            <AlertCircle className="w-3 h-3" />
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">₹{(item.price / 100).toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      {item.expiryDate ? (
                        <div className={cn(
                          'text-sm',
                          isExpiringSoon(item) ? 'font-medium text-amber-500' : 'text-foreground'
                        )}>
                          {new Date(item.expiryDate).toLocaleDateString()}
                          {isExpiringSoon(item) && (
                            <div className="text-xs text-amber-400">Expiring soon</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-lg p-2 text-brand-cyan-fg transition-colors hover:bg-brand-cyan/10"
                          aria-label="Edit medicine"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.medicineName)}
                          className="rounded-lg p-2 text-error-fg transition-colors hover:bg-error/10"
                          aria-label="Delete medicine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {inventory.length === 0 && (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-3 w-12 h-12 text-muted-foreground" />
              <p className="text-muted-foreground">No inventory items found</p>
            </div>
          )}
        </ModernTableContainer>
      </Reveal>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="glass-strong max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border shadow-card">
            <div className="border-b border-border p-6">
              <h2 className="font-head text-2xl font-bold text-foreground">
                {editingItem ? 'Edit Medicine' : 'Add New Medicine'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Hospital *
                  </label>
                  <AppSelect
                    value={formData.hospitalId}
                    onChange={(val) => setFormData({ ...formData, hospitalId: val })}
                    options={hospitals.map(h => ({ value: h._id, label: `${h.name} - ${h.district || ''}` }))}
                    placeholder="Select Hospital"
                    disabled={!!editingItem}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    name="medicineName"
                    value={formData.medicineName}
                    onChange={handleChange}
                    required
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Generic Name
                  </label>
                  <input
                    type="text"
                    name="genericName"
                    value={formData.genericName}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Unit *
                  </label>
                  <AppSelect
                    value={formData.unit}
                    onChange={(val) => setFormData({ ...formData, unit: val })}
                    options={[
                      'tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'other'
                    ].map(u => ({ value: u, label: u.charAt(0).toUpperCase() + u.slice(1) }))}
                    placeholder="Select unit"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    required
                    min="0"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Min Stock Level *
                  </label>
                  <input
                    type="number"
                    name="minStockLevel"
                    value={formData.minStockLevel}
                    onChange={handleChange}
                    required
                    min="0"
                    className={inputCls}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingItem ? 'Update Medicine' : 'Add Medicine'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
