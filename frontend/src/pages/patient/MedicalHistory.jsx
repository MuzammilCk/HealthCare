import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Heart, AlertTriangle, PlusCircle } from 'lucide-react';
import { Button } from '../../components/ui';

export default function MedicalHistory() {
  const [form, setForm] = useState({ bloodType: '', allergies: '', pastConditions: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/patients/me/medical-history');
        const mh = res.data.data;
        setForm({
          bloodType: mh.bloodType || '',
          allergies: (mh.allergies || []).join(', '),
          pastConditions: (mh.pastConditions || []).join(', '),
        });
      } catch (e) {
        if (e.response?.status === 404) setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const loadingToast = toast.loading('Saving medical history...');

    try {
      await api.put('/patients/me/medical-history', {
        bloodType: form.bloodType,
        allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        pastConditions: form.pastConditions ? form.pastConditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      toast.dismiss(loadingToast);
      toast.success('Medical history saved successfully!');
      setNotFound(false);
    } catch (e) {
      toast.dismiss(loadingToast);
      toast.error('Failed to save medical history.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-6 text-muted-foreground">Loading medical history...</div>;

  return (
    <div className="bg-background text-foreground">
      <h1 className="text-2xl font-bold text-foreground mb-6">Medical History</h1>

      {notFound && (
        <div className="mb-4 p-4 bg-amber-400/10 text-amber-600 border border-amber-500/20 rounded-lg">
          No medical record found. Please fill out the form below to create one.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6 max-w-2xl glass p-6 rounded-2xl shadow-card border border-border">
        <div className="relative">
          <Heart className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            name="bloodType"
            value={form.bloodType}
            onChange={onChange}
            className="w-full bg-background/60 border border-border rounded-xl h-12 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan shadow-sm text-foreground"
            placeholder="Blood Type (e.g., O+)"
          />
        </div>

        <div className="relative">
          <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            name="allergies"
            value={form.allergies}
            onChange={onChange}
            className="w-full bg-background/60 border border-border rounded-xl h-12 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan shadow-sm text-foreground"
            placeholder="Allergies (comma-separated, e.g., Peanuts, Pollen)"
          />
        </div>

        <div className="relative">
          <PlusCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            name="pastConditions"
            value={form.pastConditions}
            onChange={onChange}
            className="w-full bg-background/60 border border-border rounded-xl h-12 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:border-brand-cyan shadow-sm text-foreground"
            placeholder="Past Conditions (comma-separated, e.g., Asthma)"
          />
        </div>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Saving…' : 'Save Medical History'}
        </Button>
      </form>
    </div>
  );
}
