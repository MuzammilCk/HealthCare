import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function RefillPrescription() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selected, setSelected] = useState({}); // key: prescriptionId|medicineName -> quantity
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quoting, setQuoting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/patients/prescriptions');
        setPrescriptions(res.data?.data || []);
      } catch (e) {
        toast.error('Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleItem = (prescriptionId, med) => {
    const key = `${prescriptionId}|${med.medicineName}`;
    setSelected(prev => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = 1;
      }
      return next;
    });
  };

  const updateQty = (key, qty) => {
    setSelected(prev => ({ ...prev, [key]: Math.max(1, Number(qty || 1)) }));
  };

  const selectedCount = useMemo(() => Object.keys(selected).length, [selected]);

  const requestQuote = async () => {
    if (selectedCount === 0) {
      toast.error('Select at least one medicine');
      return;
    }
    setQuoting(true);
    try {
      const items = Object.entries(selected).map(([key, quantity]) => {
        const [prescriptionId, medicineName] = key.split('|');
        return { prescriptionId, medicineName, quantity };
      });
      const res = await api.post('/patients/refill/quote', { items });
      setQuote(res.data?.data || null);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to calculate bill');
    } finally {
      setQuoting(false);
    }
  };

  const createBill = async () => {
    if (selectedCount === 0) {
      toast.error('Select at least one medicine');
      return;
    }
    setQuoting(true);
    try {
      const items = Object.entries(selected).map(([key, quantity]) => {
        const [prescriptionId, medicineName] = key.split('|');
        return { prescriptionId, medicineName, quantity };
      });
      const res = await api.post('/patients/refill', { items });
      toast.success('Bill created');
      // optional: redirect to bills page
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create bill');
    } finally {
      setQuoting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Prescription Refill</h1>
        <p className="text-text-secondary">Select medicines from your past prescriptions and generate a bill.</p>
      </div>

      <div className="grid gap-4">
        {prescriptions.map((p) => (
          <div key={p._id} className="bg-white dark:bg-bg-card-dark rounded-xl border shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Issued on {new Date(p.dateIssued).toLocaleDateString()} by {p.doctorId?.name}</div>
            </div>
            <div className="divide-y">
              {(p.medicines || []).map((m, idx) => {
                const key = `${p._id}|${m.medicineName}`;
                const checked = Boolean(selected[key]);
                return (
                  <label key={idx} className="flex items-center justify-between py-3 gap-4">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={checked} onChange={() => toggleItem(p._id, m)} />
                      <div>
                        <div className="font-medium">{m.medicineName}</div>
                        <div className="text-sm text-gray-500">{m.dosage} • {m.frequency} • {m.duration}</div>
                      </div>
                    </div>
                    {checked && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Qty</span>
                        <input className="w-20 border rounded px-2 py-1" type="number" min={1} value={selected[key]} onChange={(e) => updateQty(key, e.target.value)} />
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">{selectedCount} item(s) selected</div>
        <div className="flex gap-2">
          <button onClick={requestQuote} disabled={quoting} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
            {quoting ? 'Calculating…' : 'Calculate Bill'}
          </button>
          <button onClick={createBill} disabled={quoting} className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">
            {quoting ? 'Please wait…' : 'Buy Now'}
          </button>
        </div>
      </div>

      {quote && (
        <div className="bg-white dark:bg-bg-card-dark rounded-xl border shadow-sm p-4">
          <h2 className="text-xl font-semibold mb-3">Bill</h2>
          <div className="space-y-2">
            {(quote.items || []).map((it, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>{it.description} × {it.quantity}</div>
                <div>₹{(it.amount / 100).toFixed(2)}</div>
              </div>
            ))}
            <div className="border-t pt-2 flex items-center justify-between font-semibold">
              <div>Total</div>
              <div>₹{(quote.totalAmount / 100).toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


