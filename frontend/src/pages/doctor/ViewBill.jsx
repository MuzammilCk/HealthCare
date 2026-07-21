import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, IndianRupee, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { cn } from '../../utils/cn';
import { Button, buttonVariants } from '../../components/ui/Button';
import Reveal from '../../components/Reveal';

export default function ViewBill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  // Format legacy description pattern: "(N for M)" -> "(N times for M days)"
  const formatDescription = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/\((\d+)\s+for\s+(\d+)\)/g, '($1 times for $2 days)');
  };

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-cyan/30 border-t-brand-cyan"></div>
      </div>
    );
  }

  if (!bill) {
    return null;
  }

  const isPaid = bill.status === 'paid';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        <Reveal>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/doctor/appointments')}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-foreground/5"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-head text-3xl font-bold tracking-tight text-foreground">Bill Details</h1>
              <p className="text-muted-foreground">Read-only view</p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="glass space-y-6 rounded-2xl p-6 shadow-card">
            {/* Patient & Status Info */}
            <div className="grid gap-6 border-b border-border pb-6 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-brand-cyan/15 p-2 text-brand-cyan-fg">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Patient</div>
                  <div className="font-semibold text-foreground">{bill.patientId?.name}</div>
                  <div className="text-sm text-muted-foreground">{bill.patientId?.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-success/15 p-2 text-success-fg">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Appointment</div>
                  <div className="font-semibold text-foreground">
                    {new Date(bill.appointmentId?.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">{bill.appointmentId?.timeSlot}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={cn('rounded-lg p-2', isPaid ? 'bg-success/15 text-success-fg' : 'bg-amber-400/15 text-amber-500')}>
                  {isPaid ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Payment Status</div>
                  <div className={cn('font-semibold', isPaid ? 'text-success-fg' : 'text-amber-500')}>
                    {isPaid ? 'Paid' : 'Unpaid'}
                  </div>
                  {bill.paidAt && (
                    <div className="text-xs text-muted-foreground">
                      {new Date(bill.paidAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bill Items */}
            <div>
              <h3 className="mb-4 font-head font-semibold text-foreground">Bill Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Description</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-muted-foreground">Quantity</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Unit Price</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item, index) => (
                      <tr key={index} className="border-b border-border/60">
                        <td className="px-4 py-3 text-foreground">{formatDescription(item.description)}</td>
                        <td className="px-4 py-3 text-center text-foreground">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-foreground">
                          ₹{(item.amount / 100).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">
                          ₹{((item.amount * item.quantity) / 100).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border">
                      <td colSpan="3" className="px-4 py-4 text-right font-bold text-foreground">
                        Total Amount:
                      </td>
                      <td className="px-4 py-4 text-right text-xl font-bold text-brand-cyan-fg">
                        ₹{(bill.totalAmount / 100).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment Information */}
            {isPaid && bill.paymentDetails && (
              <div className="rounded-xl border border-success/20 bg-success/10 p-4">
                <h4 className="mb-2 font-semibold text-success-fg">Payment Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {bill.paymentDetails.orderId && (
                    <div>
                      <span className="text-success/80">Order ID:</span>
                      <span className="ml-2 font-medium text-success-fg">{bill.paymentDetails.orderId}</span>
                    </div>
                  )}
                  {bill.paymentDetails.paymentId && (
                    <div>
                      <span className="text-success/80">Payment ID:</span>
                      <span className="ml-2 font-medium text-success-fg">{bill.paymentDetails.paymentId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Unpaid Notice */}
            {!isPaid && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-amber-500" />
                  <div>
                    <h4 className="mb-1 font-semibold text-amber-600">Payment Pending</h4>
                    <p className="text-sm text-amber-500">
                      This bill is awaiting payment from the patient. The patient can make the payment through their dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bill Metadata */}
            <div className="border-t border-border pt-4 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Bill Created:</span>
                <span className="font-medium text-foreground">
                  {new Date(bill.createdAt).toLocaleString()}
                </span>
              </div>
              {bill.updatedAt && bill.updatedAt !== bill.createdAt && (
                <div className="mt-1 flex justify-between">
                  <span>Last Updated:</span>
                  <span className="font-medium text-foreground">
                    {new Date(bill.updatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/doctor/appointments')}
            >
              Back to Appointments
            </Button>
            <Button onClick={() => window.print()}>
              Print Bill
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
