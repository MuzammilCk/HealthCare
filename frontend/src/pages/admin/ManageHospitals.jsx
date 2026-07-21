import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { AppSelect, Badge } from '../../components/ui';
import { Button, buttonVariants } from '../../components/ui/Button';
import { cn } from '../../utils/cn';
import Reveal from '../../components/Reveal';

const inputCls =
  'w-full bg-background/60 border border-border rounded-xl px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan transition-colors';

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
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-foreground/20 border-t-brand-cyan"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl bg-background text-foreground">
      <Reveal className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-head text-3xl font-bold tracking-tight text-foreground">Hospital Management</h1>
          <p className="mt-1 text-muted-foreground">Manage hospitals across Kerala</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Hospital
        </Button>
      </Reveal>

      {/* Hospitals Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hospitals.map((hospital) => (
          <Reveal key={hospital._id} className="rounded-xl glass p-6 shadow-card transition-all duration-300 hover:shadow-glow">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="font-head text-xl font-bold text-foreground">{hospital.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(hospital)}
                  className="rounded-lg p-2 text-brand-cyan-fg transition-colors hover:bg-brand-cyan/10"
                  aria-label="Edit hospital"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(hospital._id, hospital.name)}
                  className="rounded-lg p-2 text-error-fg transition-colors hover:bg-error/10"
                  aria-label="Delete hospital"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 w-4 h-4 flex-shrink-0" />
                <span>{hospital.address}</span>
              </div>

              {hospital.district && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium">District:</span>
                  <span>{hospital.district}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{hospital.phone}</span>
              </div>

              {hospital.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="text-xs">{hospital.email}</span>
                </div>
              )}

              {hospital.registrationNumber && (
                <div className="mt-3 border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">Reg: {hospital.registrationNumber}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Badge variant={hospital.isActive ? 'success' : 'outline'}>
                {hospital.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </Reveal>
        ))}
      </div>

      {hospitals.length === 0 && (
        <div className="rounded-xl glass py-12 text-center">
          <p className="text-muted-foreground">No hospitals found. Add your first hospital!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="glass-strong max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border shadow-card">
            <div className="border-b border-border p-6">
              <h2 className="font-head text-2xl font-bold text-foreground">
                {editingHospital ? 'Edit Hospital' : 'Add New Hospital'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Hospital Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={inputCls}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows="2"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
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
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
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
                  {editingHospital ? 'Update Hospital' : 'Create Hospital'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
