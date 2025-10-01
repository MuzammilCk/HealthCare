import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPlus, FiTrash2, FiDollarSign, FiFileText, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function GenerateBill() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointment } = location.state || {};

  const [items, setItems] = useState([
    { description: '', quantity: 1, amount: '' }
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/doctor/appointments')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Generate Bill</h1>
          <p className="text-text-secondary">Create a bill for completed appointment</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Appointment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
          <p><span className="font-medium">Patient:</span> {appointment.patientId?.name}</p>
          <p><span className="font-medium">Date:</span> {new Date(appointment.date).toLocaleDateString()}</p>
          <p><span className="font-medium">Time:</span> {appointment.timeSlot}</p>
          <p><span className="font-medium">Status:</span> {appointment.status}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
              <FiFileText className="text-primary" />
              Bill Items
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-6">
                    <input
                      type="text"
                      placeholder="Description (e.g., Consultation Fee, Medicine)"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  <div className="md:col-span-4">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Amount (per item)"
                        value={item.amount}
                        onChange={(e) => updateItem(index, 'amount', e.target.value)}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                  </div>
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes or instructions..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between text-lg">
            <span className="font-semibold text-text-primary flex items-center gap-2">
              <FiDollarSign className="text-green-600" />
              Total Amount
            </span>
            <span className="text-2xl font-bold text-primary">
              ₹{calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/doctor/appointments')}
            className="flex-1 px-6 py-3 border border-gray-300 text-text-primary font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating Bill...' : 'Create Bill'}
          </button>
        </div>
      </form>
    </div>
  );
}
