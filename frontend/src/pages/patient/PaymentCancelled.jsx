import { useNavigate } from 'react-router-dom';
import { FiXCircle, FiArrowLeft, FiHome } from 'react-icons/fi';

export default function PaymentCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiXCircle className="text-red-600 text-5xl" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Payment Cancelled</h1>
          <p className="text-text-secondary">
            Your payment was not completed. No charges have been made to your account.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Your appointment slot has been reserved but not confirmed. 
            Please complete the payment to confirm your booking.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-light transition-all flex items-center justify-center gap-2"
          >
            <FiArrowLeft />
            Try Again
          </button>
          
          <button
            onClick={() => navigate('/patient/book-appointment')}
            className="w-full bg-gray-100 text-text-primary font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all"
          >
            Book Another Appointment
          </button>
          
          <button
            onClick={() => navigate('/patient/dashboard')}
            className="w-full border border-gray-300 text-text-secondary font-semibold py-3 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <FiHome />
            Go to Dashboard
          </button>
        </div>

        <p className="text-xs text-text-secondary mt-6">
          If you're experiencing issues with payment, please contact our support team.
        </p>
      </div>
    </div>
  );
}
