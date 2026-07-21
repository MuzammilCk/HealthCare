import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui';

export default function PaymentCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full glass rounded-2xl shadow-card p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-error/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-error-fg text-5xl" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment Cancelled</h1>
          <p className="text-muted-foreground">
            Your payment was not completed. No charges have been made to your account.
          </p>
        </div>

        <div className="bg-amber-400/10 border border-amber-500/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-600">
            <strong>Note:</strong> Your appointment slot has been reserved but not confirmed.
            Please complete the payment to confirm your booking.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => navigate(-1)}
            className="w-full"
          >
            <ArrowLeft />
            Try Again
          </Button>

          <Button
            variant="glass"
            onClick={() => navigate('/patient/book-appointment')}
            className="w-full"
          >
            Book Another Appointment
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/patient/dashboard')}
            className="w-full"
          >
            <Home />
            Go to Dashboard
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          If you're experiencing issues with payment, please contact our support team.
        </p>
      </div>
    </div>
  );
}
