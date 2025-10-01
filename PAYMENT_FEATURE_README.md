# Payment & Billing System Feature

## 🎯 Overview

The healthcare application now includes a complete **Stripe-powered payment and billing system** that handles:

- 💳 **Pre-booking consultation fees** - Patients pay before appointment confirmation
- 🧾 **Post-appointment billing** - Doctors generate itemized bills for services
- 💰 **Secure payments** - All transactions processed through Stripe
- 📊 **Payment tracking** - Complete history and status monitoring

---

## ✨ Key Features

### For Patients

1. **Secure Payment Flow**
   - Pay consultation fee (₹250) when booking appointments
   - Redirected to secure Stripe Checkout page
   - Support for all major credit/debit cards
   - Instant payment confirmation

2. **Bills Dashboard**
   - View all medical bills in one place
   - Filter by status (All, Unpaid, Paid)
   - Detailed bill breakdown with line items
   - One-click payment for unpaid bills

3. **Payment History**
   - Track all payment transactions
   - View payment dates and amounts
   - Download payment receipts

### For Doctors

1. **Bill Generation**
   - Create itemized bills for completed appointments
   - Add multiple line items (consultations, medicines, tests)
   - Specify quantities and amounts
   - Add notes and instructions

2. **Billing Management**
   - View all generated bills
   - Track payment status
   - Cancel unpaid bills if needed
   - Billing statistics and analytics

---

## 💵 Currency Handling

All monetary values are handled as **integers in paise** (smallest currency unit):

- **Storage:** Amounts stored as integers (e.g., 25000 paise = ₹250)
- **Display:** Converted to rupees for user interface (e.g., ₹250.00)
- **Input:** Users enter amounts in rupees, automatically converted to paise
- **Stripe:** Receives amounts in paise as per INR requirements

**Example:**
```
User enters: ₹500.00
Stored in DB: 50000 (paise)
Sent to Stripe: 50000 (paise)
Displayed: ₹500.00
```

---

## 🔧 Technical Implementation

### Backend

**New Models:**
- `Payment` - Tracks all payment transactions
- `Bill` - Stores medical bills with line items

**Updated Models:**
- `Appointment` - Added `bookingFeeStatus` field
- `Prescription` - Added `price` field

**New Routes:**
- `/api/payments/*` - Payment processing endpoints
- `/api/bills/*` - Billing management endpoints

**Key Features:**
- Stripe webhook integration for real-time updates
- Secure signature verification
- Automatic status updates
- Real-time notifications

### Frontend

**New Pages:**
- `/patient/bills` - Bills dashboard
- `/payment-success` - Payment confirmation
- `/payment-cancelled` - Payment cancellation
- `/doctor/generate-bill` - Bill creation form

**Updated Pages:**
- Booking flow now includes payment step
- Doctor appointments page has "Generate Bill" button

---

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Configure Environment Variables

**Backend `.env`:**
```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
CONSULTATION_FEE=25000
```

**Frontend `.env`:**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 3. Setup Stripe Webhook (Local Testing)

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/payments/webhook
```

### 4. Test with Test Cards

Use Stripe test cards:
- **Success:** 4242 4242 4242 4242
- **Declined:** 4000 0000 0000 9995

---

## 📋 User Flows

### Patient Booking Flow

1. Select doctor, date, and time slot
2. Click "Proceed to Payment"
3. Redirected to Stripe Checkout
4. Enter card details and complete payment
5. Redirected to success page
6. Appointment confirmed with "paid" status

### Doctor Billing Flow

1. Complete an appointment
2. Click "Generate Bill" button
3. Add bill items (description, quantity, amount)
4. Submit bill
5. Patient receives notification
6. Bill appears in patient's dashboard

### Patient Bill Payment Flow

1. Go to "Bills & Payments" section
2. View unpaid bills
3. Click "Pay Now" on a bill
4. Redirected to Stripe Checkout
5. Complete payment
6. Bill status updated to "paid"

---

## 🔒 Security Features

- ✅ Webhook signature verification
- ✅ Secure API key management
- ✅ Role-based access control
- ✅ HTTPS required for production
- ✅ PCI DSS compliant (via Stripe)
- ✅ No card data stored on server

---

## 📊 API Endpoints

### Payment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-booking-checkout` | Create payment session for booking |
| POST | `/api/payments/create-bill-checkout` | Create payment session for bill |
| POST | `/api/payments/webhook` | Stripe webhook handler |
| GET | `/api/payments/history` | Get payment history |

### Billing Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bills` | Create new bill (doctor) |
| GET | `/api/bills/patient` | Get patient bills |
| GET | `/api/bills/doctor` | Get doctor bills |
| GET | `/api/bills/:billId` | Get bill details |

---

## 🧪 Testing

### Test Mode

The system is configured for **Stripe Test Mode** by default:

1. Use test API keys from Stripe Dashboard
2. Use test card numbers for payments
3. No real money is charged
4. All transactions are simulated

### Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 9995 | Card declined |
| 4000 0025 0000 3155 | Requires authentication |

**Card Details:**
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

---

## 📖 Documentation

Detailed documentation available:

1. **`PAYMENT_SETUP_QUICK_START.md`** - Quick setup guide
2. **`PAYMENT_SYSTEM_GUIDE.md`** - Complete technical documentation
3. **`PAYMENT_IMPLEMENTATION_SUMMARY.md`** - Implementation details

---

## 🎨 UI/UX Features

### Patient Experience

- Clean, modern payment interface
- Real-time payment status updates
- Detailed bill breakdowns
- Mobile-responsive design
- Clear success/error messages

### Doctor Experience

- Intuitive bill creation form
- Dynamic item addition
- Real-time total calculation
- Bill management dashboard
- Payment status tracking

---

## 🔄 Webhook Events

The system listens for the following Stripe events:

- `checkout.session.completed` - Payment successful
  - Updates appointment booking fee status
  - Updates bill payment status
  - Creates payment records
  - Sends notifications

---

## 💡 Best Practices

1. **Always use test mode** during development
2. **Never commit** `.env` files with real keys
3. **Verify webhook signatures** for security
4. **Handle errors gracefully** with user-friendly messages
5. **Test thoroughly** before production deployment
6. **Monitor Stripe Dashboard** for payment issues

---

## 🚨 Troubleshooting

### Common Issues

**Webhook not working:**
- Ensure Stripe CLI is running
- Check webhook secret in `.env`
- Verify backend server is running

**Payment not updating status:**
- Check webhook events in Stripe Dashboard
- Review backend console logs
- Verify database connection

**Amount display issues:**
- Confirm amounts are in paise
- Check conversion logic (÷100 for display)

---

## 📈 Future Enhancements

Potential features to add:

- 📧 Email receipts
- 📄 PDF invoice generation
- 💸 Refund processing
- 📊 Advanced analytics
- 🔔 Payment reminders
- 💳 Multiple payment methods (UPI, wallets)
- 🎫 Discount codes
- 📱 Mobile app integration

---

## 🤝 Support

For issues or questions:

1. Check the documentation files
2. Review Stripe Dashboard logs
3. Test with Stripe CLI
4. Verify environment variables
5. Check server console logs

---

## 📝 License

This payment integration uses Stripe's services. Ensure compliance with:
- Stripe Terms of Service
- PCI DSS requirements
- Local payment regulations

---

## ✅ Production Checklist

Before going live:

- [ ] Replace test keys with live Stripe keys
- [ ] Configure production webhook endpoint
- [ ] Enable HTTPS/SSL
- [ ] Set up error monitoring
- [ ] Configure email notifications
- [ ] Test all payment flows
- [ ] Review security settings
- [ ] Set up backup systems
- [ ] Train staff on billing system
- [ ] Prepare customer support documentation

---

**Status:** ✅ Fully implemented and ready for testing

**Version:** 1.0.0

**Last Updated:** October 2025
