# 🚀 Quick Reference Guide

## Start the Application

```bash
# Backend (Already Running!)
# Your backend is running with nodemon

# Frontend
cd frontend
npm run dev
```

Open: http://localhost:5173

---

## Quick Test (10 Minutes)

### 1. Payment Flow (3 min)
1. Login as Patient
2. Book Appointment
3. Choose **OK** in payment dialog
4. ✅ Appointment created

### 2. Cancellation (2 min)
1. Book appointment 5+ days ahead
2. Pay fee
3. Cancel
4. ✅ Get 50% refund

### 3. Medical History (2 min)
1. Login as Patient
2. View Medical History (read-only)
3. Request correction
4. ✅ Correction request submitted

### 4. Dynamic Fee (2 min)
1. Login as Doctor
2. Update profile fee
3. Login as Patient
4. ✅ See new fee in booking

### 5. Payment Failure (1 min)
1. Book appointment
2. Choose **Cancel** in dialog
3. ✅ No appointment created

---

## Key Features

✅ Mock Payment System
✅ Dynamic Consultation Fees
✅ 50% Refund Policy (>3 days)
✅ Medical History Management
✅ Payment Simulation
✅ Zero Ghost Bookings

---

## Important Endpoints

**Payments:**
- `POST /api/mock-payments/create-booking-order`
- `POST /api/mock-payments/verify-payment`

**Cancellation:**
- `POST /api/patients/appointments/:id/cancel`

**Medical History:**
- `GET /api/medical-history/me` (Patient)
- `PUT /api/medical-history/patient/:patientId` (Doctor)

**Doctor Profile:**
- `PUT /api/doctors/profile` (Update fee)

---

## Currency

All amounts in **paise**:
- ₹250 = 25000 paise
- ₹500 = 50000 paise

---

## Refund Policy

- **>3 days:** 50% refund
- **<3 days:** No refund

---

## Documentation

📚 **Complete Guide:** `FINAL_IMPLEMENTATION_SUMMARY.md`
🐛 **Bug Fixes:** `GHOST_BOOKING_FIX.md`
💰 **Dynamic Fees:** `DYNAMIC_FEE_AND_FIXES.md`

---

## Status

✅ All Features Complete
✅ All Bugs Fixed
✅ Ready for Testing

**Happy Testing! 🎉**
