# Payment System Testing Checklist

Use this checklist to verify that the payment and billing system is working correctly.

## ✅ Pre-Testing Setup

### Environment Configuration

- [ ] Backend `.env` file has all required Stripe variables
  - [ ] `STRIPE_SECRET_KEY` (starts with `sk_test_`)
  - [ ] `STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_`)
  - [ ] `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)
  - [ ] `CONSULTATION_FEE=25000`

- [ ] Frontend `.env` file configured
  - [ ] `VITE_API_URL=http://localhost:5000/api`
  - [ ] `VITE_STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_`)

### Dependencies

- [ ] Backend dependencies installed (`npm install` in backend folder)
- [ ] Frontend dependencies installed (`npm install` in frontend folder)
- [ ] Stripe package installed in backend (`stripe` in package.json)
- [ ] Stripe.js installed in frontend (`@stripe/stripe-js` in package.json)

### Services Running

- [ ] MongoDB is running
- [ ] Backend server is running (`npm run dev` in backend)
- [ ] Frontend server is running (`npm run dev` in frontend)
- [ ] Stripe CLI is running (`stripe listen --forward-to localhost:5000/api/payments/webhook`)

---

## 🧪 Test 1: Pre-Booking Payment Flow

### Setup
- [ ] Have a patient account registered
- [ ] Have a doctor account with availability set

### Steps

1. **Login as Patient**
   - [ ] Navigate to `/patient/book-appointment`
   - [ ] Select a doctor from the list
   - [ ] Click "View Availability"

2. **Select Appointment Slot**
   - [ ] Choose a date from the calendar
   - [ ] Select a time slot
   - [ ] Verify appointment summary shows correct details

3. **Initiate Payment**
   - [ ] Click "Proceed to Payment" button
   - [ ] Verify redirect to Stripe Checkout page
   - [ ] Check that amount shows ₹250.00

4. **Complete Payment**
   - [ ] Enter test card: `4242 4242 4242 4242`
   - [ ] Enter expiry: `12/34`
   - [ ] Enter CVC: `123`
   - [ ] Enter ZIP: `12345`
   - [ ] Click "Pay"

5. **Verify Success**
   - [ ] Redirected to `/payment-success` page
   - [ ] Success message displayed
   - [ ] Payment details shown correctly
   - [ ] Amount displayed as ₹250.00

6. **Check Database Updates**
   - [ ] Go to `/patient/appointments`
   - [ ] Verify appointment appears in list
   - [ ] Booking fee status should be "paid"

7. **Check Backend Logs**
   - [ ] Webhook event received in Stripe CLI
   - [ ] Backend console shows "Payment processed successfully"
   - [ ] No errors in console

### Expected Results
✅ Payment completes successfully
✅ Appointment created with "paid" status
✅ Payment record created in database
✅ User redirected to success page

---

## 🧪 Test 2: Payment Cancellation

### Steps

1. **Start Booking Process**
   - [ ] Login as patient
   - [ ] Select doctor, date, and time
   - [ ] Click "Proceed to Payment"

2. **Cancel Payment**
   - [ ] On Stripe Checkout page, click back button or close tab
   - [ ] Or click "← Back" link on Stripe page

3. **Verify Cancellation**
   - [ ] Redirected to `/payment-cancelled` page
   - [ ] Cancellation message displayed
   - [ ] "Try Again" button available

4. **Check Appointment Status**
   - [ ] Appointment may exist but with "unpaid" status
   - [ ] No payment record created

### Expected Results
✅ User sees cancellation page
✅ No payment charged
✅ Appointment not confirmed

---

## 🧪 Test 3: Bill Generation (Doctor)

### Setup
- [ ] Have a completed appointment (patient has paid booking fee)
- [ ] Login as doctor

### Steps

1. **Navigate to Appointments**
   - [ ] Go to `/doctor/appointments`
   - [ ] Find a completed appointment
   - [ ] Verify "Generate Bill" button is visible

2. **Create Bill**
   - [ ] Click "Generate Bill" button
   - [ ] Verify redirect to `/doctor/generate-bill`
   - [ ] Appointment details displayed correctly

3. **Add Bill Items**
   - [ ] Add first item:
     - Description: "Consultation Fee"
     - Quantity: 1
     - Amount: 500
   - [ ] Click "Add Item" button
   - [ ] Add second item:
     - Description: "Medicine"
     - Quantity: 2
     - Amount: 150.50
   - [ ] Verify total calculates correctly (₹801.00)

4. **Add Notes (Optional)**
   - [ ] Enter notes: "Follow-up required in 2 weeks"

5. **Submit Bill**
   - [ ] Click "Create Bill" button
   - [ ] Verify success message
   - [ ] Redirected to `/doctor/appointments`

6. **Verify Bill Created**
   - [ ] Check backend console for success log
   - [ ] Bill should be stored with amounts in paise:
     - Item 1: 50000 paise
     - Item 2: 15050 paise
     - Total: 80100 paise

### Expected Results
✅ Bill created successfully
✅ Amounts converted to paise correctly
✅ Patient receives notification
✅ Bill appears in patient's dashboard

---

## 🧪 Test 4: Bill Payment (Patient)

### Setup
- [ ] Have an unpaid bill (from Test 3)
- [ ] Login as patient

### Steps

1. **View Bills**
   - [ ] Navigate to `/patient/bills`
   - [ ] Verify unpaid bill appears in list
   - [ ] Amount displayed correctly (₹801.00)

2. **View Bill Details**
   - [ ] Click on the bill card
   - [ ] Modal opens with full bill details
   - [ ] Verify all items listed correctly
   - [ ] Verify total amount correct

3. **Initiate Payment**
   - [ ] Click "Pay Now" button
   - [ ] Verify redirect to Stripe Checkout
   - [ ] Amount shows ₹801.00

4. **Complete Payment**
   - [ ] Enter test card: `4242 4242 4242 4242`
   - [ ] Complete payment form
   - [ ] Click "Pay"

5. **Verify Success**
   - [ ] Redirected to `/payment-success`
   - [ ] Payment details shown
   - [ ] Bill payment type indicated

6. **Check Bill Status**
   - [ ] Go back to `/patient/bills`
   - [ ] Filter by "Paid"
   - [ ] Bill should appear with "paid" status
   - [ ] "Pay Now" button should not appear

7. **Check Webhook**
   - [ ] Stripe CLI shows webhook received
   - [ ] Backend logs show bill updated
   - [ ] Doctor receives notification

### Expected Results
✅ Payment completes successfully
✅ Bill status updated to "paid"
✅ Payment record created
✅ Both parties notified

---

## 🧪 Test 5: Payment Decline

### Steps

1. **Start Payment Process**
   - [ ] Login as patient
   - [ ] Go to bills or book appointment
   - [ ] Click "Pay Now" or "Proceed to Payment"

2. **Use Declined Card**
   - [ ] Enter card: `4000 0000 0000 9995`
   - [ ] Complete form and submit

3. **Verify Decline Handling**
   - [ ] Error message displayed by Stripe
   - [ ] Payment not processed
   - [ ] User can try again

### Expected Results
✅ Payment declined gracefully
✅ Error message shown
✅ No charges made
✅ User can retry

---

## 🧪 Test 6: Multiple Bill Items

### Steps

1. **Create Complex Bill**
   - [ ] Login as doctor
   - [ ] Generate bill with 5+ items
   - [ ] Use various quantities and amounts
   - [ ] Include decimal amounts (e.g., 123.45)

2. **Verify Calculations**
   - [ ] Total calculates correctly
   - [ ] All items saved properly

3. **Patient Pays**
   - [ ] Login as patient
   - [ ] View bill details
   - [ ] Verify all items displayed
   - [ ] Complete payment

### Expected Results
✅ All items saved correctly
✅ Total calculated accurately
✅ Payment processes successfully

---

## 🧪 Test 7: Edge Cases

### Test 7a: Very Small Amount
- [ ] Create bill with ₹0.01 (1 paise)
- [ ] Verify it processes correctly

### Test 7b: Large Amount
- [ ] Create bill with ₹10,000.00
- [ ] Verify it displays and processes correctly

### Test 7c: Decimal Precision
- [ ] Create bill with ₹123.45
- [ ] Verify stored as 12345 paise
- [ ] Verify displays as ₹123.45

### Test 7d: Zero Quantity
- [ ] Try to create bill item with quantity 0
- [ ] Should be prevented or default to 1

### Test 7e: Negative Amount
- [ ] Try to enter negative amount
- [ ] Should be prevented by validation

---

## 🧪 Test 8: Webhook Failure Scenarios

### Test 8a: Webhook Down
- [ ] Stop Stripe CLI
- [ ] Complete a payment
- [ ] Payment succeeds on Stripe
- [ ] Backend doesn't receive webhook
- [ ] Status not updated (expected)

### Test 8b: Webhook Recovery
- [ ] Restart Stripe CLI
- [ ] Stripe can resend webhook events
- [ ] Verify manual reconciliation possible

---

## 🧪 Test 9: UI/UX Verification

### Patient Dashboard
- [ ] Bills section accessible from navigation
- [ ] Bills display in card format
- [ ] Filter tabs work (All, Unpaid, Paid)
- [ ] Empty state shows when no bills
- [ ] Loading states display correctly
- [ ] Mobile responsive design

### Doctor Dashboard
- [ ] "Generate Bill" button visible for completed appointments
- [ ] Button disabled for non-completed appointments
- [ ] Bill form is intuitive
- [ ] Add/Remove item buttons work
- [ ] Total updates in real-time

### Payment Pages
- [ ] Success page shows all details
- [ ] Cancel page has retry option
- [ ] Both pages are mobile responsive
- [ ] Navigation buttons work correctly

---

## 🧪 Test 10: Security Verification

### Authentication
- [ ] Payment endpoints require authentication
- [ ] Patients can only see their own bills
- [ ] Doctors can only create bills for their appointments
- [ ] Unauthorized access returns 401/403

### Webhook Security
- [ ] Webhook verifies signature
- [ ] Invalid signatures rejected
- [ ] Webhook endpoint is public but secured

### Data Validation
- [ ] Amounts validated on backend
- [ ] Negative amounts rejected
- [ ] Required fields enforced
- [ ] SQL injection prevented (using Mongoose)

---

## 📊 Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Pre-Booking Payment | ⬜ Pass / ⬜ Fail | |
| Payment Cancellation | ⬜ Pass / ⬜ Fail | |
| Bill Generation | ⬜ Pass / ⬜ Fail | |
| Bill Payment | ⬜ Pass / ⬜ Fail | |
| Payment Decline | ⬜ Pass / ⬜ Fail | |
| Multiple Items | ⬜ Pass / ⬜ Fail | |
| Edge Cases | ⬜ Pass / ⬜ Fail | |
| Webhook Scenarios | ⬜ Pass / ⬜ Fail | |
| UI/UX | ⬜ Pass / ⬜ Fail | |
| Security | ⬜ Pass / ⬜ Fail | |

---

## 🐛 Issue Tracking

Use this section to track any issues found during testing:

### Issue 1
- **Test:** 
- **Description:** 
- **Steps to Reproduce:** 
- **Expected:** 
- **Actual:** 
- **Status:** 

### Issue 2
- **Test:** 
- **Description:** 
- **Steps to Reproduce:** 
- **Expected:** 
- **Actual:** 
- **Status:** 

---

## ✅ Final Verification

Before marking as complete:

- [ ] All tests passed
- [ ] No critical issues found
- [ ] Documentation reviewed
- [ ] Environment variables documented
- [ ] Error handling tested
- [ ] Edge cases covered
- [ ] Security verified
- [ ] UI/UX acceptable
- [ ] Performance acceptable
- [ ] Ready for production setup

---

## 📝 Notes

Add any additional notes or observations here:

---

**Tester:** _______________
**Date:** _______________
**Environment:** Development / Staging / Production
**Overall Status:** ⬜ Pass / ⬜ Fail / ⬜ Needs Review
