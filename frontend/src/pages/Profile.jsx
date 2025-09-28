import { useState, useEffect, useRef } from 'react';
import { FiUser, FiMail, FiMapPin, FiCamera, FiEdit2, FiSave, FiX, FiLock, FiCalendar, FiTrash2, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { KERALA_DISTRICTS } from '../constants';
import { AppSelect, Avatar } from '../components/ui';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const fileInputRef = useRef(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    district: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      const profileData = response.data.data;
      setProfile(profileData);
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        district: profileData.district || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      const response = await api.put('/profile', formData);
      if (response.data.success) {
        setProfile(response.data.data);
        setEditing(false);
        toast.success('Profile updated successfully!');
        
        // Update user context with new data
        updateUser({
          ...user,
          name: response.data.data.name,
          email: response.data.data.email,
          district: response.data.data.district
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    }
  };

  // Handle profile picture upload
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      setUploading(true);
      const response = await api.post('/profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const newPhotoUrl = response.data.data.photoUrl;
        setProfile(prev => ({ ...prev, photoUrl: newPhotoUrl }));
        updateUser({ ...user, photoUrl: newPhotoUrl });
        toast.success('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload profile picture';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove profile picture
  const handleRemovePicture = async () => {
    try {
      const response = await api.delete('/profile/picture');
      if (response.data.success) {
        setProfile(prev => ({ ...prev, photoUrl: '' }));
        updateUser({ ...user, photoUrl: '' });
        toast.success('Profile picture removed successfully!');
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture');
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    try {
      const response = await api.put('/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Password changed successfully!');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl p-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar
              src={profile?.photoUrl}
              name={profile?.name}
              size="3xl"
              className="border-4 border-white shadow-lg"
            />
            
            {/* Upload/Remove Picture Buttons */}
            <div className="absolute -bottom-2 -right-2 flex gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-white text-primary p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Change picture"
              >
                {uploading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                ) : (
                  <FiCamera className="w-4 h-4" />
                )}
              </button>
              
              {profile?.photoUrl && (
                <button
                  onClick={handleRemovePicture}
                  className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  title="Remove picture"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{profile?.name}</h1>
            <p className="text-white/80 text-lg capitalize">{profile?.role}</p>
            <p className="text-white/60 text-sm">
              Member since {new Date(profile?.createdAt).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
            <button
              onClick={() => {
                if (editing) {
                  setFormData({
                    name: profile?.name || '',
                    email: profile?.email || '',
                    district: profile?.district || ''
                  });
                }
                setEditing(!editing);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
            >
              {editing ? <FiX className="w-4 h-4" /> : <FiEdit2 className="w-4 h-4" />}
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FiUser className="w-4 h-4" />
              Full Name
            </label>
            {editing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profile?.name || 'Not provided'}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FiMail className="w-4 h-4" />
              Email Address
            </label>
            {editing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="Enter your email address"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profile?.email || 'Not provided'}</p>
            )}
          </div>

          {/* District Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FiMapPin className="w-4 h-4" />
              District
            </label>
            {editing ? (
              <AppSelect
                value={formData.district}
                onChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
                options={[
                  { value: '', label: 'Select District' },
                  ...KERALA_DISTRICTS.map(district => ({ value: district, label: district }))
                ]}
                placeholder="Select your district"
                searchable
                searchPlaceholder="Search districts..."
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profile?.district || 'Not provided'}</p>
            )}
          </div>

          {/* Save Button */}
          {editing && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-medium"
              >
                <FiSave className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Security</h2>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FiLock className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="font-medium text-gray-900">Password</h3>
                <p className="text-sm text-gray-600">Last updated: {new Date(profile?.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
