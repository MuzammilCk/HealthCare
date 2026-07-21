import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, IndianRupee, FileText, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { cn } from '../../utils/cn';
import { Button, buttonVariants } from '../../components/ui/Button';
import Reveal from '../../components/Reveal';

export default function GenerateBill() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointment } = location.state || {};

  const [items, setItems] = useState([
    { description: '', quantity: 1, amount: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const inputCls =
    'w-full rounded-xl bg-background/60 border border-border px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors';

  useEffect(() => {
    if (!appointment) {
      toast.error('No appointment selected');
      navigate('/doctor/appointments');
    }
  }, [appointment, navigate]);

  // Convert rupees to paise (multiply by 100)
  const rupeesToPaise = (rupees) => {
    return Math.round(parseFloat(rupees) * 100);
  };

  // Convert paise to rupees for display (divide by 100)
  const paiseToRupees = (paise) => {
    return (paise / 100).toFixed(2);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, amount: '' }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      toast.error('At least one item is required');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Calculate total in rupees for display
  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (amount * quantity);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate items
    const validItems = items.filter(item => item.description.trim() && item.amount);
    if (validItems.length === 0) {
      toast.error('Please add at least one valid item');
      return;
    }

    // Convert amounts from rupees to paise before sending to backend
    const itemsInPaise = validItems.map(item => ({
      description: item.description.trim(),
      quantity: parseInt(item.quantity) || 1,
      amount: rupeesToPaise(item.amount) // Convert to paise
    }));

    setLoading(true);
    const loadingToast = toast.loading('Creating bill...');

    try {
      await api.post('/bills', {
        appointmentId: appointment._id,
        items: itemsInPaise,
        notes: notes.trim()
      });

      toast.dismiss(loadingToast);
      toast.success('Bill created successfully!');
      navigate('/doctor/appointments');
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage = error.response?.data?.message || 'Failed to create bill';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        <Reveal>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/doctor/appointments')}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground hover:bg-foreground/5 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-head text-3xl font-bold tracking-tight text-foreground">
                Generate Bill
              </h1>
              <p className="text-muted-foreground">Create a bill for completed appointment</p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="glass rounded-2xl p-6 shadow-card">
            <h3 className="mb-4 font-head text-lg font-semibold text-foreground">
              Appointment Details
            </h3>
            <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <p><span className="font-medium text-foreground">Patient:</span> {appointment.patientId?.name}</p>
              <p><span className="font-medium text-foreground">Date:</span> {new Date(appointment.date).toLocaleDateString()}</p>
              <p><span className="font-medium text-foreground">Time:</span> {appointment.timeSlot}</p>
              <p><span className="font-medium text-foreground">Status:</span> {appointment.status}</p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <form onSubmit={handleSubmit} className="glass space-y-6 rounded-2xl p-6 shadow-card">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-head text-xl font-semibold text-foreground">
                  <FileText className="h-5 w-5 text-brand-cyan-fg" />
                  Bill Items
                </h2>
                <Button
                  type="button"
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-12">
                      <div className="md:col-span-6">
                        <input
                          type="text"
                          placeholder="Description (e.g., Consultation Fee, Medicine)"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className={inputCls}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className={inputCls}
                          required
                        />
                      </div>
                      <div className="md:col-span-4">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Amount (per item)"
                            value={item.amount}
                            onChange={(e) => updateItem(index, 'amount', e.target.value)}
                            className="w-full rounded-xl bg-background/60 border border-border py-2 pl-8 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-error-fg transition-colors hover:bg-error/10 rounded-lg"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Additional Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or instructions..."
                className={inputCls}
              />
            </div>

            <div className="rounded-xl border border-border bg-foreground/5 p-4">
              <div className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <IndianRupee className="h-5 w-5 text-success-fg" />
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-foreground">
                  ₹{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/doctor/appointments')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Creating Bill...' : 'Create Bill'}
              </Button>
            </div>
          </form>
        </Reveal>
      </div>
    </div>
  );
}
