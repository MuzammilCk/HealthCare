import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { FiHeart, FiAlertTriangle, FiPlusCircle } from 'react-icons/fi';

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

  if (loading) return <div className="text-center p-6">Loading medical history...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-6">Medical History</h1>
      
      {notFound && (
        <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg">
          No medical record found. Please fill out the form below to create one.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded-xl shadow-card">
        <div className="relative">
          <FiHeart className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input 
            name="bloodType" 
            value={form.bloodType} 
            onChange={onChange} 
            className="w-full bg-bg-page border border-slate-300/70 rounded-lg h-12 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary/50" 
            placeholder="Blood Type (e.g., O+)" 
          />
        </div>

        <div className="relative">
          <FiAlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input 
            name="allergies" 
            value={form.allergies} 
            onChange={onChange} 
            className="w-full bg-bg-page border border-slate-300/70 rounded-lg h-12 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary/50" 
            placeholder="Allergies (comma-separated, e.g., Peanuts, Pollen)" 
          />
        </div>

        <div className="relative">
          <FiPlusCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input 
            name="pastConditions" 
            value={form.pastConditions} 
            onChange={onChange} 
            className="w-full bg-bg-page border border-slate-300/70 rounded-lg h-12 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary/50" 
            placeholder="Past Conditions (comma-separated, e.g., Asthma)" 
          />
        </div>

        <button 
          disabled={saving} 
          className="w-full bg-primary text-white font-bold px-4 py-2 rounded-lg h-12 transition-all duration-300 ease-in-out hover:bg-primary-light hover:shadow-lg hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {saving ? 'Saving…' : 'Save Medical History'}
        </button>
      </form>
    </div>
  );
}