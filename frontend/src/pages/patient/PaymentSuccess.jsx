import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui';

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
      <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-cyan mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full glass rounded-2xl shadow-card p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-success/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-success-fg text-5xl animate-pulse-glow" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">Your payment has been processed successfully.</p>
        </div>

        {payment && (
          <div className="bg-foreground/5 rounded-lg p-6 mb-6 text-left space-y-3">
            <h2 className="font-semibold text-foreground text-center mb-4">Payment Details</h2>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-semibold text-foreground">{formatAmount(payment.amount)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Type:</span>
              <span className="font-semibold text-foreground capitalize">
                {payment.paymentType.replace('_', ' ')}
              </span>
            </div>

            {payment.doctorId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Doctor:</span>
                <span className="font-semibold text-foreground">
                  Dr. {payment.doctorId.name}
                </span>
              </div>
            )}

            {payment.appointmentId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Appointment Date:</span>
                <span className="font-semibold text-foreground">
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
                <span className="text-muted-foreground">Time Slot:</span>
                <span className="font-semibold text-foreground">
                  {payment.appointmentId.timeSlot}
                </span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Date:</span>
              <span className="font-semibold text-foreground">
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
          <Button
            onClick={() => navigate('/patient/appointments')}
            className="w-full"
          >
            View My Appointments
            <ArrowRight />
          </Button>

          <Button
            variant="glass"
            onClick={() => navigate('/patient/dashboard')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          A confirmation email has been sent to your registered email address.
        </p>
      </div>
    </div>
  );
}
