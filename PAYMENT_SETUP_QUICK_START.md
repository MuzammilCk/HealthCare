# Payment System - Quick Start Guide

## Prerequisites

1. Stripe account (sign up at https://stripe.com)
2. Node.js and npm installed
3. MongoDB running

## Step 1: Get Stripe Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

## Step 2: Configure Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create or update `.env` file with your Stripe keys:
   ```env
   # Existing variables...
   MONGODB_URI=mongodb://localhost:27017/healthcare
   JWT_SECRET=your_jwt_secret
   PORT=5000
   FRONTEND_ORIGIN=http://localhost:5173

   # Add these Stripe variables
   STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
   CONSULTATION_FEE=25000
   ```

3. Install dependencies (if not already done):
   ```bash
   npm install
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

## Step 3: Configure Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Create or update `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
   ```

3. Install dependencies (if not already done):
   ```bash
   npm install
   ```

4. Start the frontend:
   ```bash
   npm run dev
   ```

## Step 4: Setup Stripe Webhook (For Local Testing)

### Option A: Using Stripe CLI (Recommended for Development)

1. Install Stripe CLI:
   - **Windows:** Download from https://github.com/stripe/stripe-cli/releases
   - **Mac:** `brew install stripe/stripe-cli/stripe`
   - **Linux:** Download from releases page

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```

4. Copy the webhook signing secret (starts with `whsec_`) and add it to backend `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_FROM_CLI
   ```

### Option B: Using ngrok (Alternative)

1. Install ngrok: https://ngrok.com/download

2. Start ngrok:
   ```bash
   ngrok http 5000
   ```

3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

4. Go to Stripe Dashboard → Developers → Webhooks → Add endpoint

5. Add endpoint URL: `https://abc123.ngrok.io/api/payments/webhook`

6. Select event: `checkout.session.completed`

7. Copy the webhook signing secret to backend `.env`

## Step 5: Test the Payment Flow

### Test as Patient:

1. **Register/Login** as a patient

2. **Book an Appointment:**
   - Go to "Book Appointment"
   - Select a doctor, date, and time
   - Click "Proceed to Payment"

3. **Complete Payment:**
   - You'll be redirected to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/34)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

4. **Verify Success:**
   - You should be redirected to the success page
   - Check your appointments - booking fee should be "paid"

### Test as Doctor:

1. **Register/Login** as a doctor

2. **Complete an Appointment:**
   - Go to "Appointments"
   - Mark an appointment as "Completed"

3. **Generate Bill:**
   - Click "Generate Bill" button
   - Add items (e.g., "Consultation Fee", quantity: 1, amount: 500)
   - Click "Create Bill"

4. **Verify Bill Created:**
   - Bill should appear in patient's "Bills & Payments" section

### Test Bill Payment:

1. **Login as Patient**

2. **Go to "Bills & Payments"**

3. **Click "Pay Now"** on an unpaid bill

4. **Complete payment** with test card

5. **Verify** bill status changes to "paid"

## Troubleshooting

### Webhook Not Working

**Problem:** Payments complete but appointment/bill status doesn't update

**Solutions:**
- Ensure Stripe CLI is running: `stripe listen --forward-to localhost:5000/api/payments/webhook`
- Check webhook secret in `.env` matches the one from Stripe CLI
- Check backend console for webhook events
- Verify backend server is running on port 5000

### Payment Redirect Issues

**Problem:** After payment, not redirected properly

**Solutions:**
- Check `FRONTEND_ORIGIN` in backend `.env` matches your frontend URL
- Ensure frontend is running on the correct port (default: 5173)
- Clear browser cache and cookies

### Amount Display Issues

**Problem:** Amounts showing incorrectly

**Solutions:**
- Verify `CONSULTATION_FEE` in backend `.env` is in paise (25000 = ₹250)
- Check frontend conversion logic (divide by 100 for display)
- Ensure bill items are sent in paise from frontend

### Database Issues

**Problem:** Models not found or validation errors

**Solutions:**
- Restart backend server to load new models
- Check MongoDB is running
- Verify model files are in `backend/models/` directory

## Test Cards Reference

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Declined |
| 4000 0025 0000 3155 | Requires authentication |

## Next Steps

1. **Review the detailed guide:** See `PAYMENT_SYSTEM_GUIDE.md` for complete documentation

2. **Configure for production:**
   - Replace test keys with live keys
   - Set up production webhook endpoint
   - Enable HTTPS
   - Configure proper error handling

3. **Add features:**
   - Email receipts
   - Refund functionality
   - Payment history export
   - Invoice generation

## Support

If you encounter issues:

1. Check console logs (both frontend and backend)
2. Review Stripe Dashboard → Developers → Events
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
5. Check webhook events in Stripe CLI output

## Important Notes

- **Always use test mode** during development
- **Never commit `.env` files** to version control
- **All amounts are in paise** (smallest currency unit)
- **Webhook signature verification** is critical for security
- **Test thoroughly** before going to production

---

**Ready to test!** Start both servers, set up webhooks, and try booking an appointment with payment.
