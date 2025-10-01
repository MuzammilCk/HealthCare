import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiUser, FiDollarSign, FiCheckCircle, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ViewBill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const res = await api.get(`/doctors/bills/${id}`);
        setBill(res.data.data);
      } catch (err) {
        toast.error('Failed to load bill');
        navigate('/doctor/appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!bill) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/doctor/appointments')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bill Details</h1>
          <p className="text-gray-600">Read-only view</p>
        </div>
      </div>

      {/* Bill Card */}
      <div className="bg-white rounded-xl shadow-card p-6 space-y-6">
        {/* Patient & Status Info */}
        <div className="grid md:grid-cols-3 gap-6 pb-6 border-b border-gray-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiUser className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Patient</div>
              <div className="font-semibold text-gray-900">{bill.patientId?.name}</div>
              <div className="text-sm text-gray-500">{bill.patientId?.email}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiCalendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Appointment</div>
              <div className="font-semibold text-gray-900">
                {new Date(bill.appointmentId?.date).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">{bill.appointmentId?.timeSlot}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${bill.status === 'paid' ? 'bg-green-100' : 'bg-orange-100'}`}>
              {bill.status === 'paid' ? (
                <FiCheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <FiClock className="w-5 h-5 text-orange-600" />
              )}
            </div>
            <div>
              <div className="text-sm text-gray-600">Payment Status</div>
              <div className={`font-semibold ${bill.status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                {bill.status === 'paid' ? 'Paid' : 'Unpaid'}
              </div>
              {bill.paidAt && (
                <div className="text-xs text-gray-500">
                  {new Date(bill.paidAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bill Items */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Bill Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Unit Price</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">{item.description}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-gray-700">
                      ₹{(item.amount / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      ₹{((item.amount * item.quantity) / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300">
                  <td colSpan="3" className="py-4 px-4 text-right font-bold text-gray-900">
                    Total Amount:
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-primary text-xl">
                    ₹{(bill.totalAmount / 100).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Payment Information */}
        {bill.status === 'paid' && bill.paymentDetails && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Payment Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {bill.paymentDetails.orderId && (
                <div>
                  <span className="text-green-700">Order ID:</span>
                  <span className="ml-2 font-medium text-green-900">{bill.paymentDetails.orderId}</span>
                </div>
              )}
              {bill.paymentDetails.paymentId && (
                <div>
                  <span className="text-green-700">Payment ID:</span>
                  <span className="ml-2 font-medium text-green-900">{bill.paymentDetails.paymentId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Unpaid Notice */}
        {bill.status === 'unpaid' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiClock className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-900 mb-1">Payment Pending</h4>
                <p className="text-sm text-orange-700">
                  This bill is awaiting payment from the patient. The patient can make the payment through their dashboard.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bill Metadata */}
        <div className="pt-4 border-t border-gray-200 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Bill Created:</span>
            <span className="font-medium text-gray-900">
              {new Date(bill.createdAt).toLocaleString()}
            </span>
          </div>
          {bill.updatedAt && bill.updatedAt !== bill.createdAt && (
            <div className="flex justify-between mt-1">
              <span>Last Updated:</span>
              <span className="font-medium text-gray-900">
                {new Date(bill.updatedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/doctor/appointments')}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
          Back to Appointments
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
        >
          Print Bill
        </button>
      </div>
    </div>
  );
}
