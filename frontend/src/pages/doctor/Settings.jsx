import { useEffect, useState } from 'react';
import { Save, IndianRupee, User, MapPin, BookOpen, Award, Home } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { cn } from '../../utils/cn';
import { Button, buttonVariants } from '../../components/ui/Button';
import Reveal from '../../components/Reveal';

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

  const inputCls =
    'w-full rounded-xl bg-background/60 border border-border px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors';
  const labelCls = 'mb-1 block text-sm font-medium text-muted-foreground';

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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-brand-cyan/30 border-t-brand-cyan"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        <Reveal>
          <div>
            <h1 className="font-head text-3xl font-bold tracking-tight text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your profile and consultation fee</p>
          </div>
        </Reveal>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Consultation Fee - Highlighted */}
          <Reveal>
            <div className="rounded-2xl border-2 border-brand-cyan/30 bg-gradient-to-r from-brand-cyan/10 to-brand-teal/5 p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-brand-cyan/15 p-3 text-brand-cyan-fg">
                  <IndianRupee className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-head text-xl font-bold text-foreground">Consultation Fee</h2>
                  <p className="text-sm text-muted-foreground">Set your consultation charges (per appointment)</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelCls}>
                  Fee Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-brand-cyan-fg">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    className="w-full rounded-xl border-2 border-brand-cyan/30 bg-background/60 py-4 pl-12 pr-4 text-2xl font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 transition-colors"
                    placeholder="250.00"
                    required
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-muted-foreground">
                    Current fee: <span className="font-semibold text-brand-cyan-fg">
                      ₹{profile?.consultationFee ? (profile.consultationFee / 100).toFixed(2) : '250.00'}
                    </span>
                  </p>
                  {formData.consultationFee && parseFloat(formData.consultationFee) !== (profile?.consultationFee / 100) && (
                    <p className="font-medium text-amber-500">
                      New fee: ₹{parseFloat(formData.consultationFee).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Hospital Information - Read Only */}
          {profile?.hospitalId && (
            <Reveal>
              <div className="glass rounded-2xl border border-border p-6 shadow-card">
                <div className="mb-4 flex items-center gap-3">
                  <Home className="h-5 w-5 text-brand-cyan-fg" />
                  <h2 className="font-head text-lg font-semibold text-foreground">Hospital Information</h2>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Hospital:</span> {profile.hospitalId.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Location:</span> {profile.hospitalId.district}, {profile.hospitalId.city || 'Kerala'}
                  </p>
                  {profile.hospitalId.address && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Address:</span> {profile.hospitalId.address}
                    </p>
                  )}
                  {profile.hospitalId.phone && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Phone:</span> {profile.hospitalId.phone}
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          )}

          {/* Basic Information */}
          <Reveal>
            <div className="glass rounded-2xl border border-border p-6 shadow-card">
              <div className="mb-4 flex items-center gap-3">
                <User className="h-5 w-5 text-brand-cyan-fg" />
                <h2 className="font-head text-lg font-semibold text-foreground">Basic Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelCls}>
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className={inputCls}
                    placeholder="Tell patients about yourself..."
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Qualifications
                  </label>
                  <input
                    type="text"
                    value={formData.qualifications}
                    onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    className={inputCls}
                    placeholder="MBBS, MD, etc."
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    className={inputCls}
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    Languages Spoken
                  </label>
                  <input
                    type="text"
                    value={formData.languages.join(', ')}
                    onChange={handleLanguageChange}
                    className={inputCls}
                    placeholder="English, Hindi, Tamil (comma separated)"
                  />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Location Information */}
          <Reveal>
            <div className="glass rounded-2xl border border-border p-6 shadow-card">
              <div className="mb-4 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-brand-cyan-fg" />
                <h2 className="font-head text-lg font-semibold text-foreground">Location</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelCls}>
                    Clinic/Hospital Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={inputCls}
                    placeholder="123 Medical Street, City"
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className={inputCls}
                    placeholder="District name"
                  />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Save Button */}
          <Reveal>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={loadProfile}
                disabled={saving}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </Reveal>
        </form>

        {/* Info Box */}
        <Reveal>
          <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan/10 p-4">
            <h3 className="mb-2 font-semibold text-brand-cyan-fg">💡 About Consultation Fee</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Patients will see this fee before booking appointments</li>
              <li>• Fee is charged per consultation/appointment</li>
              <li>• You can update your fee anytime</li>
              <li>• Changes apply to new bookings only</li>
            </ul>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
