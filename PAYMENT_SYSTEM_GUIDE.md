# Payment & Billing System Integration Guide

## Overview

This guide explains the complete Stripe payment and billing system integrated into the healthcare application. All monetary values are handled as integers in the smallest currency unit (paise for INR).

## Table of Contents

1. [Backend Setup](#backend-setup)
2. [Frontend Setup](#frontend-setup)
3. [Payment Flow](#payment-flow)
4. [Billing Flow](#billing-flow)
5. [Testing](#testing)
6. [Important Notes](#important-notes)

---

## Backend Setup

### 1. Environment Configuration

Add the following variables to `backend/.env`:

```env
# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Consultation Fee (in paise - e.g., 25000 = ₹250)
CONSULTATION_FEE=25000
```

**Important:** 
- Use test mode keys from your Stripe dashboard
- The `CONSULTATION_FEE` is stored in paise (multiply rupees by 100)
- Keep the `.env` file secure and never commit it to version control

### 2. Database Models

#### Payment Model (`backend/models/Payment.js`)
Stores all payment transactions with amounts in paise.

**Key Fields:**
- `amount`: Number (in paise)
- `paymentType`: 'booking_fee' | 'bill_payment'
- `status`: 'pending' | 'completed' | 'failed' | 'refunded'
- `stripeSessionId`: Stripe checkout session ID
- `stripePaymentIntentId`: Stripe payment intent ID

#### Bill Model (`backend/models/Bill.js`)
Stores medical bills with line items.

**Key Fields:**
- `items`: Array of { description, quantity, amount (in paise) }
- `totalAmount`: Number (in paise)
- `status`: 'unpaid' | 'paid' | 'cancelled'

#### Updated Models:
- **Appointment**: Added `bookingFeeStatus` field ('unpaid' | 'paid')
- **Prescription**: Added `price` field (Number, in paise)

### 3. API Endpoints

#### Payment Routes (`/api/payments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create-booking-checkout` | Create Stripe session for booking fee | Patient |
| POST | `/create-bill-checkout` | Create Stripe session for bill payment | Patient |
| POST | `/webhook` | Stripe webhook handler | Public (verified) |
| GET | `/history` | Get payment history | Patient |
| GET | `/session/:sessionId` | Get payment by session ID | Patient |

#### Billing Routes (`/api/bills`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create a new bill | Doctor |
| GET | `/patient` | Get patient's bills | Patient |
| GET | `/doctor` | Get doctor's bills | Doctor |
| GET | `/doctor/stats` | Get billing statistics | Doctor |
| GET | `/:billId` | Get bill details | Patient/Doctor |
| PATCH | `/:billId` | Update bill (cancel) | Doctor |

### 4. Webhook Configuration

The Stripe webhook must receive raw body data. This is handled in `server.js`:

```javascript
// Webhook route BEFORE express.json() middleware
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), require('./routes/payments'));

// Then add express.json() for other routes
app.use(express.json());
```

**Setting up Stripe Webhook:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `http://your-domain.com/api/payments/webhook`
3. Select event: `checkout.session.completed`
4. Copy the webhook signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

For local testing, use Stripe CLI:
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

---

## Frontend Setup

### 1. Environment Configuration

Add to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 2. Dependencies

The following package is installed:
```bash
npm install @stripe/stripe-js
```

### 3. New Pages

#### Patient Pages:
- **Bills** (`/patient/bills`): View and pay bills
- **Payment Success** (`/payment-success`): Confirmation page after successful payment
- **Payment Cancelled** (`/payment-cancelled`): Page shown when payment is cancelled

#### Doctor Pages:
- **Generate Bill** (`/doctor/generate-bill`): Create bills for completed appointments

---

## Payment Flow

### Pre-Booking Consultation Fee

1. **Patient books appointment:**
   - Selects doctor, date, and time slot
   - Clicks "Proceed to Payment"

2. **Frontend creates appointment:**
   ```javascript
   POST /api/patients/appointments
   // Returns appointmentId
   ```

3. **Frontend requests Stripe session:**
   ```javascript
   POST /api/payments/create-booking-checkout
   Body: { appointmentId }
   // Returns sessionUrl
   ```

4. **Redirect to Stripe Checkout:**
   - User enters payment details on secure Stripe page
   - Amount displayed: ₹250.00 (from 25000 paise)

5. **Payment completion:**
   - Stripe sends webhook to backend
   - Backend updates appointment `bookingFeeStatus` to 'paid'
   - Creates Payment record with status 'completed'
   - Redirects user to `/payment-success`

### Currency Conversion

**Backend to Stripe:**
```javascript
// Amount is already in paise in env variable
const consultationFee = parseInt(process.env.CONSULTATION_FEE); // 25000 paise
stripe.checkout.sessions.create({
  line_items: [{
    price_data: {
      currency: 'inr',
      unit_amount: consultationFee, // Send paise directly
    }
  }]
});
```

**Frontend Display:**
```javascript
// Convert paise to rupees for display
const formatAmount = (amountInPaise) => {
  const rupees = amountInPaise / 100;
  return `₹${rupees.toFixed(2)}`;
};
```

---

## Billing Flow

### Doctor Creates Bill

1. **Doctor completes appointment:**
   - Marks appointment as "Completed"
   - Clicks "Generate Bill" button

2. **Doctor adds bill items:**
   - Enters description, quantity, and amount **in rupees**
   - Example: "Consultation Fee", 1, 500.00
   - Frontend converts to paise before sending

3. **Frontend conversion:**
   ```javascript
   const rupeesToPaise = (rupees) => {
     return Math.round(parseFloat(rupees) * 100);
   };

   // User enters: 500.00
   // Sent to backend: 50000 (paise)
   ```

4. **Backend creates bill:**
   ```javascript
   POST /api/bills
   Body: {
     appointmentId,
     items: [
       { description: "Consultation Fee", quantity: 1, amount: 50000 }
     ],
     notes: "Optional notes"
   }
   ```

### Patient Pays Bill

1. **Patient views bills:**
   - Goes to `/patient/bills`
   - Sees unpaid bills with amounts in rupees

2. **Frontend displays amount:**
   ```javascript
   // Backend sends: 50000 (paise)
   // Frontend displays: ₹500.00
   const displayAmount = 50000 / 100; // 500.00
   ```

3. **Patient clicks "Pay Now":**
   - Frontend requests Stripe session
   - Redirects to Stripe Checkout

4. **Payment completion:**
   - Webhook updates bill status to 'paid'
   - Creates Payment record
   - Sends notifications to patient and doctor

---

## Testing

### Test Card Numbers (Stripe Test Mode)

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 9995 | Declined payment |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |

**Test Details:**
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

### Testing Webhook Locally

1. Install Stripe CLI:
   ```bash
   stripe login
   ```

2. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```

3. Copy the webhook signing secret to `.env`

4. Test payment flow and check webhook events

### Manual Testing Checklist

- [ ] Book appointment and complete payment
- [ ] Cancel payment and verify appointment status
- [ ] Complete appointment and generate bill
- [ ] Pay bill and verify payment record
- [ ] Check payment history page
- [ ] Verify notifications are sent
- [ ] Test with different amounts
- [ ] Test bill with multiple items

---

## Important Notes

### Currency Handling Rules

1. **Storage:** Always store amounts as integers in paise
2. **API Communication:** Always send/receive amounts in paise
3. **User Input:** Accept amounts in rupees, convert to paise
4. **Display:** Convert paise to rupees for display

### Conversion Examples

| Rupees | Paise (Backend) | Display |
|--------|-----------------|---------|
| ₹1.00 | 100 | ₹1.00 |
| ₹250.00 | 25000 | ₹250.00 |
| ₹150.50 | 15050 | ₹150.50 |
| ₹1,234.56 | 123456 | ₹1,234.56 |

### Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Validate webhook signatures** to prevent fraud
3. **Use HTTPS** in production
4. **Implement rate limiting** on payment endpoints
5. **Log all payment transactions** for audit trail
6. **Handle errors gracefully** and show user-friendly messages

### Common Issues

**Issue:** Webhook not receiving events
- **Solution:** Check webhook URL, ensure raw body parsing, verify signing secret

**Issue:** Amount mismatch
- **Solution:** Verify all amounts are in paise, check conversion logic

**Issue:** Payment successful but appointment not updated
- **Solution:** Check webhook handler, verify database updates, check logs

**Issue:** Stripe session expired
- **Solution:** Sessions expire after 24 hours, user needs to restart payment

### Production Deployment

1. Replace test keys with live keys in `.env`
2. Update webhook endpoint to production URL
3. Configure proper CORS settings
4. Enable SSL/TLS certificates
5. Set up monitoring and alerts
6. Implement proper error logging
7. Add payment reconciliation process

---

## API Request/Response Examples

### Create Booking Checkout Session

**Request:**
```http
POST /api/payments/create-booking-checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "appointmentId": "64f5a1b2c3d4e5f6g7h8i9j0"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0",
  "sessionUrl": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### Create Bill

**Request:**
```http
POST /api/bills
Authorization: Bearer <token>
Content-Type: application/json

{
  "appointmentId": "64f5a1b2c3d4e5f6g7h8i9j0",
  "items": [
    {
      "description": "Consultation Fee",
      "quantity": 1,
      "amount": 50000
    },
    {
      "description": "Medicine",
      "quantity": 2,
      "amount": 15000
    }
  ],
  "notes": "Follow-up required in 2 weeks"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bill created successfully",
  "bill": {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "appointmentId": "...",
    "patientId": "...",
    "doctorId": "...",
    "items": [...],
    "totalAmount": 80000,
    "status": "unpaid",
    "createdAt": "2025-10-01T10:00:00.000Z"
  }
}
```

---

## Support

For issues or questions:
1. Check Stripe dashboard for payment details
2. Review server logs for webhook events
3. Verify environment variables are set correctly
4. Test with Stripe test cards
5. Use Stripe CLI for local webhook testing

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
