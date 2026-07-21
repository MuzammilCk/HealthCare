import { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  MapPin,
  Camera,
  Pencil,
  Save,
  X,
  Lock,
  Calendar,
  Trash2,
  Home,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { KERALA_DISTRICTS } from '../constants';
import { AppSelect, Avatar, Button, buttonVariants } from '../components/ui';
import { ProfileSkeleton, FormSkeleton } from '../components/ui/SkeletonLoader';
import { cn } from '../utils/cn';

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
      <div className="mx-auto max-w-4xl space-y-6 bg-background text-foreground">
        <div>
          <h1 className="mb-2 font-head text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and settings</p>
        </div>
        <ProfileSkeleton />
        <div className="rounded-xl glass border border-border p-6 shadow-card">
          <h2 className="mb-4 font-head text-xl font-semibold text-foreground">Profile Information</h2>
          <FormSkeleton fields={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 bg-background text-foreground">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-cyan to-brand-teal p-8 text-white shadow-glow">
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
                className="glass rounded-full p-2 text-brand-cyan-fg shadow-lg transition-colors hover:bg-brand-cyan/15 disabled:opacity-50"
                title="Change picture"
              >
                {uploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-cyan border-t-transparent" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>

              {profile?.photoUrl && (
                <button
                  onClick={handleRemovePicture}
                  className="rounded-full bg-error p-2 text-white shadow-lg transition-colors hover:bg-error/90"
                  title="Remove picture"
                >
                  <Trash2 className="h-4 w-4" />
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
            <h1 className="mb-2 text-3xl font-bold text-white">{profile?.name}</h1>
            <p className="text-lg capitalize text-white/80">{profile?.role}</p>
            <p className="text-sm text-white/60">
              Member since {new Date(profile?.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="overflow-hidden rounded-2xl glass border border-border shadow-card">
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-head text-2xl font-bold text-foreground">Profile Information</h2>
            <Button
              variant={editing ? 'outline' : 'default'}
              size="default"
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
            >
              {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <User className="h-4 w-4" />
              Full Name
            </label>
            {editing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-xl bg-background/60 border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="rounded-lg bg-foreground/5 px-4 py-3 text-foreground">{profile?.name || 'Not provided'}</p>
            )}
          </div>

          {/* Email Field - Always Disabled */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Mail className="h-4 w-4" />
              Email Address
              <span className="text-xs text-muted-foreground">(Cannot be changed)</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={profile?.email || 'Not provided'}
                disabled
                className="w-full rounded-xl border border-border bg-foreground/5 px-4 py-3 text-muted-foreground cursor-not-allowed"
              />
              <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {/* District Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin className="h-4 w-4" />
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
              <p className="rounded-lg bg-foreground/5 px-4 py-3 text-foreground">{profile?.district || 'Not provided'}</p>
            )}
          </div>

          {/* Save Button */}
          {editing && (
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveProfile}>
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Hospital Information - For Doctors Only */}
      {profile?.role === 'doctor' && profile?.doctorProfile?.hospitalId && (
        <div className="overflow-hidden rounded-2xl glass border border-border shadow-card">
          <div className="border-b border-border p-6">
            <div className="flex items-center gap-3">
              <Home className="h-6 w-6 text-brand-cyan-fg" />
              <h2 className="font-head text-2xl font-bold text-foreground">Hospital Information</h2>
            </div>
          </div>

          <div className="bg-foreground/5 p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-cyan/15">
                  <Home className="h-5 w-5 text-brand-cyan-fg" />
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Hospital Name</p>
                  <p className="text-lg font-semibold text-foreground">{profile.doctorProfile.hospitalId.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-cyan/15">
                  <MapPin className="h-5 w-5 text-brand-cyan-fg" />
                </div>
                <div>
                  <p className="mb-1 text-sm text-muted-foreground">Location</p>
                  <p className="text-foreground">{profile.doctorProfile.hospitalId.district}, {profile.doctorProfile.hospitalId.city || 'Kerala'}</p>
                  {profile.doctorProfile.hospitalId.address && (
                    <p className="mt-1 text-sm text-muted-foreground">{profile.doctorProfile.hospitalId.address}</p>
                  )}
                </div>
              </div>

              {profile.doctorProfile.hospitalId.phone && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-cyan/15">
                    <User className="h-5 w-5 text-brand-cyan-fg" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Contact</p>
                    <p className="text-foreground">{profile.doctorProfile.hospitalId.phone}</p>
                    {profile.doctorProfile.hospitalId.email && (
                      <p className="text-sm text-muted-foreground">{profile.doctorProfile.hospitalId.email}</p>
                    )}
                  </div>
                </div>
              )}

              {profile.doctorProfile.specializationId && (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-cyan/15">
                    <Calendar className="h-5 w-5 text-brand-cyan-fg" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Specialization</p>
                    <p className="font-medium text-foreground">{profile.doctorProfile.specializationId.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security Section */}
      <div className="overflow-hidden rounded-2xl glass border border-border shadow-card">
        <div className="border-b border-border p-6">
          <h2 className="font-head text-2xl font-bold text-foreground">Security</h2>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between rounded-lg bg-foreground/5 p-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium text-foreground">Password</h3>
                <p className="text-sm text-muted-foreground">Last updated: {new Date(profile?.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
            <Button onClick={() => setShowPasswordModal(true)}>Change Password</Button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="glass-strong w-full max-w-md rounded-xl p-6 shadow-glow">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-head text-xl font-bold text-foreground">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-xl bg-background/60 border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-xl bg-background/60 border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full rounded-xl bg-background/60 border border-border px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 rounded-lg border border-border px-4 py-3 text-foreground transition-colors hover:bg-foreground/5"
              >
                Cancel
              </button>
              <Button onClick={handleChangePassword} className="flex-1">
                Change Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
