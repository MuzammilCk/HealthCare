import { useEffect, useState } from 'react';
import { FiSave, FiDollarSign, FiUser, FiMapPin, FiBook, FiAward, FiHome } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function DoctorSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    consultationFee: '',
    bio: '',
    qualifications: '',
    experienceYears: '',
    location: '',
    district: '',
    languages: []
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/doctors/profile');
      const data = response.data.data;
      setProfile(data);
      
      // Convert consultation fee from paise to rupees for display
      setFormData({
        consultationFee: data.consultationFee ? (data.consultationFee / 100).toFixed(2) : '250.00',
        bio: data.bio || '',
        qualifications: data.qualifications || '',
        experienceYears: data.experienceYears || '',
        location: data.location || '',
        district: data.district || '',
        languages: data.languages || []
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate consultation fee
    const feeInRupees = parseFloat(formData.consultationFee);
    if (isNaN(feeInRupees) || feeInRupees < 0) {
      toast.error('Please enter a valid consultation fee');
      return;
    }

    setSaving(true);
    try {
      // Convert rupees to paise before sending
      const feeInPaise = Math.round(feeInRupees * 100);
      
      const updateData = {
        consultationFee: feeInPaise,
        bio: formData.bio,
        qualifications: formData.qualifications,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
        location: formData.location,
        district: formData.district,
        languages: formData.languages
      };

      await api.put('/doctors/profile', updateData);
      toast.success('Profile updated successfully!');
      loadProfile(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (e) => {
    const value = e.target.value;
    const languagesArray = value.split(',').map(lang => lang.trim()).filter(lang => lang);
    setFormData({ ...formData, languages: languagesArray });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Profile Settings</h1>
        <p className="text-text-secondary">Manage your profile and consultation fee</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Consultation Fee - Highlighted */}
        <div className="bg-gradient-to-r from-primary/10 to-blue-50 border-2 border-primary/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">Consultation Fee</h2>
              <p className="text-sm text-text-secondary">Set your consultation charges (per appointment)</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">
              Fee Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="250.00"
                required
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <p className="text-text-secondary">
                Current fee: <span className="font-semibold text-primary">
                  ₹{profile?.consultationFee ? (profile.consultationFee / 100).toFixed(2) : '250.00'}
                </span>
              </p>
              {formData.consultationFee && parseFloat(formData.consultationFee) !== (profile?.consultationFee / 100) && (
                <p className="text-orange-600 font-medium">
                  New fee: ₹{parseFloat(formData.consultationFee).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Hospital Information - Read Only */}
        {profile?.hospitalId && (
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiHome className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-text-primary">Hospital Information</h2>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Hospital:</span> {profile.hospitalId.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Location:</span> {profile.hospitalId.district}, {profile.hospitalId.city || 'Kerala'}
              </p>
              {profile.hospitalId.address && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Address:</span> {profile.hospitalId.address}
                </p>
              )}
              {profile.hospitalId.phone && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Phone:</span> {profile.hospitalId.phone}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiUser className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-text-primary">Basic Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Tell patients about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Qualifications
              </label>
              <input
                type="text"
                value={formData.qualifications}
                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="MBBS, MD, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Languages Spoken
              </label>
              <input
                type="text"
                value={formData.languages.join(', ')}
                onChange={handleLanguageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="English, Hindi, Tamil (comma separated)"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiMapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-text-primary">Location</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Clinic/Hospital Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="123 Medical Street, City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                District
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="District name"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={loadProfile}
            className="px-6 py-3 border border-gray-300 text-text-primary rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 About Consultation Fee</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Patients will see this fee before booking appointments</li>
          <li>• Fee is charged per consultation/appointment</li>
          <li>• You can update your fee anytime</li>
          <li>• Changes apply to new bookings only</li>
        </ul>
      </div>
    </div>
  );
}
