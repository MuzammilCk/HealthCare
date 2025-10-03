import { useEffect, useState } from 'react';
import { FiDollarSign, FiFileText, FiCalendar, FiUser, FiCheckCircle, FiClock, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { BillSkeleton } from '../../components/ui/SkeletonLoader';

export default function PatientBills() {
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bills'); // bills, payments
  const [filter, setFilter] = useState('all'); // all, unpaid, paid
  const [selectedBill, setSelectedBill] = useState(null);
  const [paying, setPaying] = useState(false);

  // Helper function to convert paise to rupees for display
  const formatAmount = (amountInPaise) => {
    const rupees = amountInPaise / 100;
    return `₹${rupees.toFixed(2)}`;
  };

  const loadBills = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await api.get(`/bills/patient${params}`);
      setBills(response.data.bills || []);
    } catch (error) {
      console.error('Error loading bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/mock-payments/history');
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bills') {
      loadBills();
    } else {
      loadPayments();
    }
  }, [activeTab, filter]);

  const handlePayNow = async (bill) => {
    setPaying(true);
    const loadingToast = toast.loading('Processing payment...');

    try {
      // Step 1: Create mock payment order
      const orderRes = await api.post('/mock-payments/create-bill-order', {
        billId: bill._id
      });

      const order = orderRes.data.order;

      // Step 2: Simulate payment processing (auto-verify after 1.5 seconds)
      setTimeout(async () => {
        try {
          // Step 3: Verify mock payment
          await api.post('/mock-payments/verify-payment', {
            orderId: order.id,
            paymentId: `pay_${Date.now()}`
          });

          toast.dismiss(loadingToast);
          toast.success('Payment successful!');

          // Redirect to success page
          window.location.href = `/payment-success?order_id=${order.id}`;
        } catch (verifyError) {
          toast.dismiss(loadingToast);
          toast.error('Payment verification failed.');
          setPaying(false);
        }
      }, 1500); // Simulate payment processing delay

    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage = error.response?.data?.message || 'Failed to initiate payment';
      toast.error(errorMessage);
      setPaying(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const BillDetailsModal = ({ bill, onClose }) => {
    if (!bill) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text-primary">Bill Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Bill Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Bill ID:</span>
                <span className="font-mono text-text-primary">{bill._id.slice(-8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Doctor:</span>
                <span className="font-semibold text-text-primary">Dr. {bill.doctorId?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Appointment Date:</span>
                <span className="text-text-primary">
                  {new Date(bill.appointmentId?.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Bill Date:</span>
                <span className="text-text-primary">
                  {new Date(bill.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(bill.status)}`}>
                  {bill.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Bill Items */}
            <div>
              <h3 className="font-semibold text-text-primary mb-3">Bill Items</h3>
              <div className="space-y-2">
                {bill.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">{item.description}</p>
                      <p className="text-sm text-text-secondary">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-text-primary">{formatAmount(item.amount * item.quantity)}</p>
                      <p className="text-xs text-text-secondary">{formatAmount(item.amount)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {bill.notes && (
              <div>
                <h3 className="font-semibold text-text-primary mb-2">Notes</h3>
                <p className="text-sm text-text-secondary bg-gray-50 p-3 rounded-lg">{bill.notes}</p>
              </div>
            )}

            {/* Total */}
            <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-text-primary">Total Amount</span>
                <span className="text-2xl font-bold text-primary">{formatAmount(bill.totalAmount)}</span>
              </div>
            </div>

            {/* Payment Info */}
            {bill.status === 'paid' && bill.paidAt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <FiCheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Payment Completed</span>
                </div>
                <p className="text-sm text-green-700">
                  Paid on {new Date(bill.paidAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {/* Actions */}
            {bill.status === 'unpaid' && (
              <button
                onClick={() => {
                  onClose();
                  handlePayNow(bill);
                }}
                disabled={paying}
                className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FiDollarSign className="w-5 h-5" />
                Pay Now - {formatAmount(bill.totalAmount)}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Bills & Payments</h1>
        <p className="text-text-secondary">View and manage your medical bills</p>
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-xl shadow-card p-2 flex gap-2 mb-4">
        {[
          { value: 'bills', label: 'My Bills', icon: <FiFileText className="w-4 h-4" /> },
          { value: 'payments', label: 'Payment History', icon: <FiDollarSign className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === tab.value
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Tabs (only for bills) */}
      {activeTab === 'bills' && (
        <div className="bg-white rounded-xl shadow-card p-2 flex gap-2">
          {[
            { value: 'all', label: 'All Bills' },
            { value: 'unpaid', label: 'Pending Dues' },
            { value: 'paid', label: 'Paid' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content Area */}
      {activeTab === 'bills' ? (
        // Bills List
        loading ? (
          <BillSkeleton count={5} />
        ) : bills.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-12 text-center">
          <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Bills Found</h3>
          <p className="text-text-secondary">
            {filter === 'unpaid' 
              ? "You don't have any unpaid bills." 
              : filter === 'paid'
              ? "You don't have any paid bills yet."
              : "You don't have any bills yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bills.map((bill) => (
            <div
              key={bill._id}
              className="bg-white rounded-xl shadow-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedBill(bill)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <FiFileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">Bill #{bill._id.slice(-6)}</h3>
                    <p className="text-sm text-text-secondary">
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(bill.status)}`}>
                  {bill.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <FiUser className="w-4 h-4" />
                  <span>Dr. {bill.doctorId?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <FiCalendar className="w-4 h-4" />
                  <span>{new Date(bill.appointmentId?.date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                <span className="text-sm text-text-secondary">Total Amount</span>
                <span className="text-xl font-bold text-primary">{formatAmount(bill.totalAmount)}</span>
              </div>

              {bill.status === 'unpaid' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePayNow(bill);
                  }}
                  disabled={paying}
                  className="w-full mt-4 bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FiDollarSign className="w-4 h-4" />
                  Pay Now
                </button>
              )}
            </div>
          ))}
        </div>
        )
      ) : (
        // Payment History
        loading ? (
          <BillSkeleton count={5} />
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-card p-12 text-center">
            <FiDollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No Payments Yet</h3>
            <p className="text-text-secondary">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.paymentType === 'booking_fee' ? 'bg-blue-100 text-blue-800' :
                          payment.paymentType === 'bill_payment' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {payment.paymentType === 'booking_fee' ? 'Booking Fee' :
                           payment.paymentType === 'bill_payment' ? 'Bill Payment' :
                           'Refund'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.doctor ? `Dr. ${payment.doctor.name}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        <span className={payment.paymentType === 'refund' ? 'text-green-600' : 'text-gray-900'}>
                          {payment.paymentType === 'refund' ? '+' : ''}{formatAmount(payment.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Bill Details Modal */}
      {selectedBill && (
        <BillDetailsModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </div>
  );
}
