import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function DoctorKyc() {
  const [documents, setDocuments] = useState(['']);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

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
    if (filtered.length === 0) return alert('Please add at least one document URL');
    setSubmitting(true);
    try {
      await api.post('/doctors/me/kyc', { documents: filtered });
      alert('KYC submitted. Your application is under review.');
      navigate('/doctor');
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-h2 font-bold">KYC Verification</h1>
        <Link to="/doctor" className="text-primary hover:underline">Back to Dashboard</Link>
      </div>

      {status === 'Submitted' && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
          Your KYC is submitted and currently under review.
        </div>
      )}
      {status === 'Approved' && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800">
          <h2 className="font-semibold">Verification Complete</h2>
          <p>Your KYC has been successfully verified and your profile is now visible to patients.</p>
        </div>
      )}
      {status === 'Rejected' && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
          Your previous KYC was rejected. Please re-submit with correct documents.
        </div>
      )}

      {status !== 'Approved' && (
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">Provide secure links to your documents (e.g., medical license, ID). You can add multiple.</p>
        {documents.map((doc, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="url"
              required
              value={doc}
              onChange={(e) => updateDoc(idx, e.target.value)}
              className="flex-1 border rounded px-3 py-2"
              placeholder="https://link-to-your-document"
            />
            {documents.length > 1 && (
              <button type="button" onClick={() => removeField(idx)} className="px-3 py-2 border rounded">Remove</button>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <button type="button" onClick={addField} className="px-4 py-2 border rounded">Add another</button>
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded disabled:opacity-60">
            {submitting ? 'Submitting…' : 'Submit for Review'}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
