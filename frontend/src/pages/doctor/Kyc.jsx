import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { cn } from '../../utils/cn';
import { Button, buttonVariants } from '../../components/ui/Button';
import Reveal from '../../components/Reveal';

export default function DoctorKyc() {
  const [documents, setDocuments] = useState(['']);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const inputCls =
    'w-full rounded-xl bg-background/60 border border-border px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors';

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/doctors/profile');
        setStatus(res?.data?.data?.verificationStatus || '');
      } catch (e) {}
    })();
  }, []);

  const updateDoc = (idx, val) => {
    const next = [...documents];
    next[idx] = val;
    setDocuments(next);
  };

  const addField = () => setDocuments((d) => [...d, '']);
  const removeField = (idx) => setDocuments((d) => d.filter((_, i) => i !== idx));

  const onSubmit = async (e) => {
    e.preventDefault();
    const filtered = documents.map((d) => d.trim()).filter(Boolean);
    if (filtered.length === 0) {
      toast.error('Please add at least one document URL');
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading('Submitting KYC documents...');

    try {
      await api.post('/doctors/me/kyc', { documents: filtered });
      toast.dismiss(loadingToast);
      toast.success('KYC documents submitted for verification.');
      navigate('/doctor');
    } catch (e) {
      toast.dismiss(loadingToast);
      const errorMessage = e?.response?.data?.message || 'Failed to submit documents. Please check file types.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl space-y-8 p-6">
        <Reveal>
          <div className="flex items-center justify-between">
            <h1 className="font-head text-3xl font-bold tracking-tight text-foreground">KYC Verification</h1>
            <Link to="/doctor" className="text-brand-cyan-fg hover:underline">Back to Dashboard</Link>
          </div>
        </Reveal>

        {status === 'Submitted' && (
          <Reveal>
            <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-amber-600">
              Your KYC is submitted and currently under review.
            </div>
          </Reveal>
        )}
        {status === 'Approved' && (
          <Reveal>
            <div className="mb-4 rounded-xl border border-success/30 bg-success/10 p-4 text-success-fg">
              <h2 className="font-semibold">Verification Complete</h2>
              <p>Your KYC has been successfully verified and your profile is now visible to patients.</p>
            </div>
          </Reveal>
        )}
        {status === 'Rejected' && (
          <Reveal>
            <div className="mb-4 rounded-xl border border-error/30 bg-error/10 p-3 text-error-fg">
              Your previous KYC was rejected. Please re-submit with correct documents.
            </div>
          </Reveal>
        )}

        {status !== 'Approved' && (
          <Reveal>
            <form onSubmit={onSubmit} className="glass space-y-4 rounded-2xl p-6 shadow-card">
              <p className="text-sm text-muted-foreground">
                Provide secure links to your documents (e.g., medical license, ID). You can add multiple.
              </p>
              {documents.map((doc, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={doc}
                    onChange={(e) => updateDoc(idx, e.target.value)}
                    className={cn('flex-1', inputCls)}
                    placeholder="https://link-to-your-document"
                  />
                  {documents.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeField(idx)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addField}
                >
                  Add another
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting…' : 'Submit for Review'}
                </Button>
              </div>
            </form>
          </Reveal>
        )}
      </div>
    </div>
  );
}
