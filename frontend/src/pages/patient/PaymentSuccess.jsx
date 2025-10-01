import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('order_id');
    
    if (!orderId) {
      toast.error('Invalid payment order');
      navigate('/patient/appointments');
      return;
    }

    const fetchPaymentDetails = async () => {
      try {
        const response = await api.get(`/mock-payments/order/${orderId}`);
        setPayment(response.data.payment);
      } catch (error) {
        console.error('Error fetching payment details:', error);
        toast.error('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [searchParams, navigate]);

  // Helper function to format amount from paise to rupees
  const formatAmount = (amountInPaise) => {
    const rupees = amountInPaise / 100;
    return `₹${rupees.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <FiCheckCircle className="text-green-600 text-5xl" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Payment Successful!</h1>
          <p className="text-text-secondary">Your payment has been processed successfully.</p>
        </div>

        {payment && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left space-y-3">
            <h2 className="font-semibold text-text-primary text-center mb-4">Payment Details</h2>
            
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Amount Paid:</span>
              <span className="font-semibold text-text-primary">{formatAmount(payment.amount)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Payment Type:</span>
              <span className="font-semibold text-text-primary capitalize">
                {payment.paymentType.replace('_', ' ')}
              </span>
            </div>
            
            {payment.doctorId && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Doctor:</span>
                <span className="font-semibold text-text-primary">
                  Dr. {payment.doctorId.name}
                </span>
              </div>
            )}
            
            {payment.appointmentId && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Appointment Date:</span>
                <span className="font-semibold text-text-primary">
                  {new Date(payment.appointmentId.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            
            {payment.appointmentId?.timeSlot && (
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Time Slot:</span>
                <span className="font-semibold text-text-primary">
                  {payment.appointmentId.timeSlot}
                </span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Payment Date:</span>
              <span className="font-semibold text-text-primary">
                {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/patient/appointments')}
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-light transition-all flex items-center justify-center gap-2"
          >
            View My Appointments
            <FiArrowRight />
          </button>
          
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="w-full bg-gray-100 text-text-primary font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all"
          >
            Go to Dashboard
          </button>
        </div>

        <p className="text-xs text-text-secondary mt-6">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}
