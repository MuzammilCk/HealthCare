import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { AppSelect } from '../../components/ui';

export default function ManageHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHospital, setEditingHospital] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    district: '',
    city: '',
    pincode: '',
    registrationNumber: '',
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await api.get('/admin/hospitals');
      setHospitals(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingHospital) {
        await api.put(`/admin/hospitals/${editingHospital._id}`, formData);
        toast.success('Hospital updated successfully');
      } else {
        await api.post('/admin/hospitals', formData);
        toast.success('Hospital created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchHospitals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (hospital) => {
    setEditingHospital(hospital);
    setFormData({
      name: hospital.name,
      address: hospital.address,
      phone: hospital.phone,
      email: hospital.email || '',
      district: hospital.district || '',
      city: hospital.city || '',
      pincode: hospital.pincode || '',
      registrationNumber: hospital.registrationNumber || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    
    try {
      await api.delete(`/admin/hospitals/${id}`);
      toast.success('Hospital deleted successfully');
      fetchHospitals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete hospital');
    }
  };

  const resetForm = () => {
    setEditingHospital(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      district: '',
      city: '',
      pincode: '',
      registrationNumber: '',
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary-dark">Hospital Management</h1>
          <p className="text-gray-600 dark:text-text-secondary-dark mt-1">Manage hospitals across Kerala</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          Add Hospital
        </button>
      </div>

      {/* Hospitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hospitals.map((hospital) => (
          <div key={hospital._id} className="bg-white dark:bg-bg-card-dark rounded-xl shadow-card dark:shadow-card-dark p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-text-primary-dark">{hospital.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(hospital)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(hospital._id, hospital.name)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{hospital.address}</span>
              </div>
              
              {hospital.district && (
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">District:</span>
                  <span>{hospital.district}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-600">
                <FiPhone className="w-4 h-4" />
                <span>{hospital.phone}</span>
              </div>

              {hospital.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <FiMail className="w-4 h-4" />
                  <span className="text-xs">{hospital.email}</span>
                </div>
              )}

              {hospital.registrationNumber && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">Reg: {hospital.registrationNumber}</span>
                </div>
              )}
            </div>

            <div className={`mt-4 px-3 py-1 rounded-full text-xs font-medium inline-block ${
              hospital.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {hospital.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        ))}
      </div>

      {hospitals.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-bg-card-dark rounded-xl">
          <p className="text-gray-500 dark:text-text-secondary-dark">No hospitals found. Add your first hospital!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-bg-card-dark rounded-2xl border border-slate-200/60 dark:border-dark-border shadow-card dark:shadow-card-dark max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-text-primary-dark">
                {editingHospital ? 'Edit Hospital' : 'Add New Hospital'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District
                  </label>
                  <AppSelect
                    value={formData.district}
                    onChange={(val) => setFormData({ ...formData, district: val })}
                    options={[
                      { value: 'Alappuzha', label: 'Alappuzha' },
                      { value: 'Ernakulam', label: 'Ernakulam' },
                      { value: 'Idukki', label: 'Idukki' },
                      { value: 'Kannur', label: 'Kannur' },
                      { value: 'Kasaragod', label: 'Kasaragod' },
                      { value: 'Kollam', label: 'Kollam' },
                      { value: 'Kottayam', label: 'Kottayam' },
                      { value: 'Kozhikode', label: 'Kozhikode' },
                      { value: 'Malappuram', label: 'Malappuram' },
                      { value: 'Palakkad', label: 'Palakkad' },
                      { value: 'Pathanamthitta', label: 'Pathanamthitta' },
                      { value: 'Thiruvananthapuram', label: 'Thiruvananthapuram' },
                      { value: 'Thrissur', label: 'Thrissur' },
                      { value: 'Wayanad', label: 'Wayanad' }
                    ]}
                    placeholder="Select District"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
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
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition-colors"
                >
                  {editingHospital ? 'Update Hospital' : 'Create Hospital'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
