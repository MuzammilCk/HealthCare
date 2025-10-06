import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiAlertCircle, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { AppSelect, ModernTableContainer } from '../../components/ui';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary-dark">Inventory Management</h1>
          <p className="text-gray-600 dark:text-text-secondary-dark mt-1">Manage medicines across all hospitals</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          Add Medicine
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-bg-card-dark rounded-xl shadow-card dark:shadow-card-dark p-4 mb-6">
        <div className="flex items-center gap-3">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">Filter by Hospital:</label>
          <div className="flex-1 max-w-md">
            <AppSelect
              placeholder="All Hospitals"
              value={selectedHospital}
              onChange={setSelectedHospital}
              options={[{ value: '', label: 'All Hospitals' }, ...hospitals.map(h => ({ value: h._id, label: `${h.name} - ${h.district || ''}` }))]}
            />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <ModernTableContainer title="Inventory" subtitle={`${inventory.length} item${inventory.length!==1?'s':''} found`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hospital
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-bg-card-dark divide-y divide-gray-200 dark:divide-dark-border">
              {inventory.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FiPackage className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.medicineName}</div>
                        {item.genericName && (
                          <div className="text-xs text-gray-500">{item.genericName}</div>
                        )}
                        <div className="text-xs text-gray-400">{item.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{item.hospitalId?.name}</div>
                    <div className="text-xs text-gray-500">{item.hospitalId?.district}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        isLowStock(item) ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {item.stockQuantity}
                      </span>
                      {isLowStock(item) && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
                          <FiAlertCircle className="w-3 h-3" />
                          Low
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">₹{(item.price / 100).toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4">
                    {item.expiryDate ? (
                      <div className={`text-sm ${
                        isExpiringSoon(item) ? 'text-orange-600 font-medium' : 'text-gray-900'
                      }`}>
                        {new Date(item.expiryDate).toLocaleDateString()}
                        {isExpiringSoon(item) && (
                          <div className="text-xs text-orange-500">Expiring soon</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.medicineName)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

        {inventory.length === 0 && (
          <div className="text-center py-12">
            <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No inventory items found</p>
          </div>
        )}
      </ModernTableContainer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-bg-card-dark rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-text-primary-dark">
                {editingItem ? 'Edit Medicine' : 'Add New Medicine'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    name="medicineName"
                    value={formData.medicineName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generic Name
                  </label>
                  <input
                    type="text"
                    name="genericName"
                    value={formData.genericName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <AppSelect
                    value={formData.unit}
                    onChange={(val) => setFormData({ ...formData, unit: val })}
                    options={[
                      'tablet','capsule','syrup','injection','cream','drops','inhaler','other'
                    ].map(u => ({ value: u, label: u.charAt(0).toUpperCase()+u.slice(1) }))}
                    placeholder="Select unit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Stock Level *
                  </label>
                  <input
                    type="number"
                    name="minStockLevel"
                    value={formData.minStockLevel}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {editingItem ? 'Update Medicine' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
