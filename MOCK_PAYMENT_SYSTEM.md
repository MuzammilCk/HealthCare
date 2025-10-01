# Mock Payment System Documentation

## Overview

The healthcare application now uses a **Mock Payment System** for testing purposes. This system simulates the entire payment flow without requiring external payment gateway credentials or making real transactions.

---

## 🎯 Key Features

✅ **No External Dependencies** - No Stripe, Razorpay, or other payment gateway required
✅ **Instant Processing** - Payments are processed immediately (with simulated delay)
✅ **Complete Flow** - Simulates the entire payment lifecycle
✅ **Database Integration** - All payment records are stored properly
✅ **Notifications** - Real-time notifications work as expected
✅ **Testing Ready** - Perfect for development and testing

---

## 🔄 How It Works

### Flow Diagram

```
User Action → Create Order → Simulate Processing → Auto-Verify → Update Status → Success
```

### Detailed Flow

#### **Part 1: Booking Fee Payment**

1. **Patient Books Appointment**
   - Selects doctor, date, and time
   - Clicks "Proceed to Payment"

2. **Frontend Creates Mock Order**
   ```javascript
   POST /api/mock-payments/create-booking-order
   Body: { appointmentId }
   ```

3. **Backend Generates Fake Order**
   - Creates fake order ID (e.g., `order_1696234567890_abc123`)
   - Creates pending Payment record
   - Returns order details instantly

4. **Frontend Simulates Processing**
   - Shows loading state for 1.5 seconds
   - Automatically calls verify endpoint

5. **Backend Verifies Payment**
   ```javascript
   POST /api/mock-payments/verify-payment
   Body: { orderId, paymentId }
   ```

6. **Status Updates**
   - Payment status → 'completed'
   - Appointment bookingFeeStatus → 'paid'
   - Notifications sent

7. **Success Page**
   - User redirected to `/payment-success?order_id=xxx`
   - Payment details displayed

#### **Part 2: Bill Payment**

1. **Doctor Generates Bill**
   - Creates bill with line items
   - Patient receives notification

2. **Patient Initiates Payment**
   - Goes to "Bills & Payments"
   - Clicks "Pay Now"

3. **Mock Payment Flow**
   - Same as booking fee flow
   - Uses bill amount instead of consultation fee

4. **Status Updates**
   - Bill status → 'paid'
   - Payment record created
   - Both parties notified

---

## 📁 Files Structure

### Backend Files

**Controllers:**
- `backend/controllers/mockPayments.js` - Mock payment logic

**Routes:**
- `backend/routes/mockPayments.js` - Mock payment endpoints

**Models:** (Reused from Stripe implementation)
- `backend/models/Payment.js` - Payment records
- `backend/models/Bill.js` - Bill records

### Frontend Files

**Updated Pages:**
- `frontend/src/pages/patient/BookAppointment.jsx` - Mock payment integration
- `frontend/src/pages/patient/Bills.jsx` - Mock bill payment
- `frontend/src/pages/patient/PaymentSuccess.jsx` - Success page

---

## 🔌 API Endpoints

### Mock Payment Endpoints (`/api/mock-payments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create-booking-order` | Create mock order for booking fee | Patient |
| POST | `/create-bill-order` | Create mock order for bill payment | Patient |
| POST | `/verify-payment` | Verify and complete mock payment | Patient |
| GET | `/history` | Get payment history | Patient |
| GET | `/order/:orderId` | Get payment by order ID | Patient |

---

## 💻 Code Examples

### Creating Mock Order (Frontend)

```javascript
// Create mock payment order
const orderRes = await api.post('/mock-payments/create-booking-order', {
  appointmentId: appointmentId,
});

const order = orderRes.data.order;
// order.id = "order_1696234567890_abc123"
// order.amount = 25000 (paise)
```

### Verifying Payment (Frontend)

```javascript
// Simulate payment processing delay
setTimeout(async () => {
  // Auto-verify payment
  const verifyRes = await api.post('/mock-payments/verify-payment', {
    orderId: order.id,
    paymentId: `pay_${Date.now()}`
  });
  
  // Redirect to success page
  window.location.href = `/payment-success?order_id=${order.id}`;
}, 1500);
```

### Backend Order Creation

```javascript
// Generate fake order ID
const fakeOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Create pending payment record
const payment = new Payment({
  patientId,
  doctorId,
  appointmentId,
  amount: consultationFee,
  paymentType: 'booking_fee',
  stripeSessionId: fakeOrderId, // Reusing this field
  status: 'pending',
});

await payment.save();
```

### Backend Payment Verification

```javascript
// Find payment by order ID
const payment = await Payment.findOne({ stripeSessionId: orderId });

// Update to completed
payment.status = 'completed';
payment.paymentDate = new Date();
payment.stripePaymentIntentId = paymentId;
await payment.save();

// Update appointment
await Appointment.findByIdAndUpdate(appointmentId, {
  bookingFeeStatus: 'paid',
});
```

---

## 🧪 Testing the System

### Prerequisites

- MongoDB running
- Backend server running
- Frontend server running
- No external payment gateway needed!

### Test Booking Payment

1. **Login as Patient**
   - Navigate to "Book Appointment"

2. **Select Appointment**
   - Choose doctor, date, and time
   - Click "Proceed to Payment"

3. **Observe Mock Payment**
   - Loading message: "Processing payment..."
   - Automatic verification after 1.5 seconds
   - Success message: "Payment successful! Appointment confirmed."

4. **Verify Results**
   - Redirected to success page
   - Appointment shows "paid" status
   - Payment record created in database

### Test Bill Payment

1. **Login as Doctor**
   - Complete an appointment
   - Click "Generate Bill"
   - Add items and submit

2. **Login as Patient**
   - Go to "Bills & Payments"
   - See the unpaid bill

3. **Pay Bill**
   - Click "Pay Now"
   - Observe mock payment processing
   - Success confirmation

4. **Verify Results**
   - Bill status updated to "paid"
   - Payment record created
   - Notifications sent

---

## 🔧 Configuration

### Environment Variables

**Backend `.env`:**
```env
# Only this is required for mock payments
CONSULTATION_FEE=25000

# No Stripe keys needed!
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api

# No Stripe publishable key needed!
```

---

## 💰 Currency Handling

Same as before - all amounts in paise:

**Storage:**
```javascript
amount: 25000  // ₹250.00 in paise
```

**Display:**
```javascript
const formatAmount = (paise) => `₹${(paise / 100).toFixed(2)}`;
formatAmount(25000) // "₹250.00"
```

**Input:**
```javascript
const rupeesToPaise = (rupees) => Math.round(parseFloat(rupees) * 100);
rupeesToPaise(250.00) // 25000
```

---

## 🎨 User Experience

### What Users See

1. **Booking Flow:**
   - Click "Proceed to Payment"
   - See loading message (1.5 seconds)
   - Automatic success confirmation
   - Redirected to success page

2. **Bill Payment:**
   - Click "Pay Now"
   - See loading message (1.5 seconds)
   - Automatic success confirmation
   - Bill marked as paid

### Simulated Delays

- **Order Creation:** Instant
- **Payment Processing:** 1.5 seconds (simulated)
- **Verification:** Instant
- **Status Updates:** Instant

---

## 🔒 Security

### What's Maintained

✅ **Authentication** - All endpoints require valid JWT
✅ **Authorization** - Users can only access their own data
✅ **Data Validation** - All inputs validated
✅ **Database Integrity** - Proper transaction handling

### What's Removed

❌ **External API Calls** - No calls to payment gateways
❌ **Webhook Verification** - Not needed for mock system
❌ **API Keys** - No sensitive credentials required

---

## 📊 Database Records

### Payment Record Example

```javascript
{
  _id: "64f5a1b2c3d4e5f6g7h8i9j0",
  patientId: "64f5a1b2c3d4e5f6g7h8i9j1",
  doctorId: "64f5a1b2c3d4e5f6g7h8i9j2",
  appointmentId: "64f5a1b2c3d4e5f6g7h8i9j3",
  amount: 25000, // paise
  paymentType: "booking_fee",
  stripeSessionId: "order_1696234567890_abc123", // fake order ID
  stripePaymentIntentId: "pay_1696234569890", // fake payment ID
  status: "completed",
  paymentDate: "2025-10-01T05:40:20.000Z",
  createdAt: "2025-10-01T05:40:15.000Z",
  updatedAt: "2025-10-01T05:40:20.000Z"
}
```

---

## 🆚 Comparison: Mock vs Real Payment Gateway

| Feature | Mock System | Real Gateway (Stripe) |
|---------|-------------|----------------------|
| **Setup Time** | Instant | Requires account setup |
| **API Keys** | Not needed | Required |
| **Processing Time** | 1.5 seconds (simulated) | 2-5 seconds (real) |
| **Real Money** | No | Yes (in production) |
| **Testing** | Perfect for development | Requires test mode |
| **External Dependency** | None | Internet + Gateway uptime |
| **Webhook** | Not needed | Required for status updates |
| **Security** | Internal only | PCI DSS compliant |

---

## 🚀 Advantages of Mock System

1. **No Setup Required** - Works immediately
2. **Fast Development** - No waiting for external APIs
3. **Offline Testing** - Works without internet
4. **Predictable** - Always succeeds (or fails if you want)
5. **Free** - No transaction fees
6. **Simple** - Easy to understand and debug
7. **Flexible** - Easy to modify behavior

---

## ⚠️ Limitations

1. **Not Production Ready** - Only for testing/prototyping
2. **No Real Validation** - Doesn't validate card details
3. **No Payment Gateway UI** - No checkout form
4. **Always Succeeds** - Doesn't simulate failures (can be added)
5. **No Refunds** - Refund logic not implemented

---

## 🔄 Migration to Real Gateway

When ready for production, you can easily switch to a real payment gateway:

### Steps:

1. **Get Gateway Credentials**
   - Sign up for Stripe/Razorpay
   - Get API keys

2. **Update Backend**
   - Replace mock controller with real gateway controller
   - Add webhook handler
   - Update routes

3. **Update Frontend**
   - Add gateway checkout integration
   - Handle redirects properly
   - Update success/failure pages

4. **Test Thoroughly**
   - Use gateway test mode
   - Test all flows
   - Verify webhooks

5. **Go Live**
   - Switch to live keys
   - Monitor transactions
   - Handle errors gracefully

---

## 🧪 Advanced Testing Scenarios

### Simulate Payment Failure (Optional Enhancement)

You can modify the mock system to simulate failures:

```javascript
// In mockPayments.js
exports.verifyMockPayment = async (req, res) => {
  // Simulate random failures (10% chance)
  if (Math.random() < 0.1) {
    return res.status(400).json({ 
      success: false, 
      message: 'Payment failed (simulated)' 
    });
  }
  
  // Continue with success flow...
};
```

### Test Different Amounts

```javascript
// Test with various amounts
const testAmounts = [
  100,      // ₹1.00
  25000,    // ₹250.00
  100000,   // ₹1,000.00
  999999,   // ₹9,999.99
];
```

---

## 📝 Summary

The mock payment system provides:

✅ Complete payment flow simulation
✅ No external dependencies
✅ Instant testing capability
✅ Proper database integration
✅ Real-time notifications
✅ Currency handling in paise
✅ Easy to understand and modify

**Perfect for:**
- Development and testing
- Prototyping
- Demonstrations
- Learning payment integration

**Not suitable for:**
- Production use
- Real transactions
- Compliance requirements

---

## 🎓 Learning Resources

- **Payment Gateway Concepts:** https://stripe.com/docs/payments
- **Mock Testing Best Practices:** https://martinfowler.com/articles/mocksArentStubs.html
- **Payment Integration Patterns:** https://www.patterns.dev/posts/payment-integration

---

## 🆘 Troubleshooting

### Payment Not Completing

**Issue:** Payment stays in "Processing" state

**Solutions:**
- Check browser console for errors
- Verify backend is running
- Check API endpoint URLs
- Ensure database is connected

### Success Page Not Loading

**Issue:** Redirect to success page fails

**Solutions:**
- Check order_id in URL
- Verify route configuration
- Check payment record in database

### Amount Display Issues

**Issue:** Amounts showing incorrectly

**Solutions:**
- Verify amounts are in paise
- Check conversion functions
- Ensure proper formatting

---

## ✅ Quick Start Checklist

- [ ] Backend server running
- [ ] Frontend server running
- [ ] MongoDB connected
- [ ] Mock payment routes registered
- [ ] Test booking payment flow
- [ ] Test bill payment flow
- [ ] Verify database records
- [ ] Check notifications

---

**Status:** ✅ Ready to use!

**No setup required** - Just start testing!
