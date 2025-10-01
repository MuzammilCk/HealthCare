import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiAlertCircle, FiPackage, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medicine Name *
          </label>
          <input
            type="text"
            value={formData.medicineName}
            onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={isEdit}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Generic Name
          </label>
          <input
            type="text"
            value={formData.genericName}
            onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Manufacturer
          </label>
          <input
            type="text"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock Quantity *
          </label>
          <input
            type="number"
            min="0"
            value={formData.stockQuantity}
            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price per Unit (₹) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit *
          </label>
          <select
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Batch Number
          </label>
          <input
            type="text"
            value={formData.batchNumber}
            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date
          </label>
          <input
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Stock Level *
          </label>
          <input
            type="number"
            min="0"
            value={formData.minStockLevel}
            onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
        >
          {isEdit ? 'Update Medicine' : 'Add Medicine'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Inventory Management</h1>
        <p className="text-text-secondary">Manage your hospital's pharmacy inventory</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showLowStock
                ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <FiAlertCircle className="inline mr-2" />
            Low Stock
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light font-medium"
          >
            <FiPlus className="inline mr-2" />
            Add Medicine
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading inventory...</p>
        </div>
      ) : inventory.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-12 text-center">
          <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Medicines Found</h3>
          <p className="text-text-secondary mb-4">
            {searchQuery || showLowStock
              ? 'No medicines match your filters'
              : 'Start by adding medicines to your inventory'}
          </p>
          {!searchQuery && !showLowStock && (
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
            >
              Add First Medicine
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{item.medicineName}</div>
                        {item.genericName && (
                          <div className="text-sm text-gray-500">{item.genericName}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.stockQuantity}</span>
                        {item.isLowStock && (
                          <span className="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                            Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 capitalize">
                      {item.unit}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {item.expiryDate
                        ? new Date(item.expiryDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedicine(item)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
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

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">Add New Medicine</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">Edit Medicine</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedItem(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
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
  );
}
