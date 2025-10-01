# Inventory-Based Billing System - Implementation Guide

## Overview

This document outlines the implementation of a comprehensive inventory-based billing system for the healthcare application.

---

## ✅ Part 1: Database Models - COMPLETE

### 1. Hospital Model ✅
**File:** `backend/models/Hospital.js`

**Fields:**
- name, address, phone, email
- district, city, state, pincode
- registrationNumber (unique)
- isActive

### 2. Inventory Model ✅
**File:** `backend/models/Inventory.js`

**Fields:**
- hospitalId (ref: Hospital)
- medicineName, genericName, manufacturer
- stockQuantity, price (in paise)
- unit (tablet, capsule, syrup, etc.)
- batchNumber, expiryDate
- minStockLevel, isActive
- lastRestocked, notes

**Methods:**
- `isAvailable(quantity)` - Check if medicine is available
- `reduceStock(quantity)` - Reduce stock after sale
- `addStock(quantity)` - Add stock when restocked

**Virtuals:**
- `isLowStock` - Returns true if stock <= minStockLevel

### 3. Doctor Model Updated ✅
**File:** `backend/models/Doctor.js`

**Added:**
- `hospitalId` (ref: Hospital) - Links doctor to hospital

### 4. Prescription Model Updated ✅
**File:** `backend/models/Prescription.js`

**New Structure:**
```javascript
medicines: [{
  medicineName: String,
  dosage: String,
  frequency: String,
  duration: String,
  instructions: String,
  quantity: Number,
  purchaseFromHospital: Boolean  // ← KEY FIELD
}]
```

**Also Added:**
- diagnosis, notes fields
- Legacy fields kept for backward compatibility

### 5. Appointment Model Updated ✅
**File:** `backend/models/Appointment.js`

**Added:**
- `finalBillGenerated: Boolean` - Prevents duplicate bill generation

---

## ✅ Part 2: Inventory Management API - COMPLETE

### Backend Controllers ✅
**File:** `backend/controllers/inventory.js`

**Endpoints Implemented:**

1. **GET /api/inventory/my-hospital**
   - Get all inventory for doctor's hospital
   - Supports search and low-stock filtering

2. **POST /api/inventory**
   - Add new medicine to inventory
   - Validates doctor's hospital association
   - Prevents duplicates

3. **PUT /api/inventory/:itemId**
   - Update inventory item
   - Updates lastRestocked when stock increases
   - Ensures price is stored in paise

4. **DELETE /api/inventory/:itemId**
   - Soft delete (sets isActive = false)

5. **GET /api/inventory/low-stock**
   - Get all low stock items for alerts

6. **GET /api/inventory/search**
   - Search medicines for prescription
   - Returns only available items

### Backend Routes ✅
**File:** `backend/routes/inventory.js`

- All routes require authentication
- Doctor/Admin access only
- Added to server.js

---

## 🔨 Part 3: Frontend Implementation - IN PROGRESS

### What Needs to Be Built:

#### 1. Inventory Management Page
**Location:** `frontend/src/pages/doctor/Inventory.jsx`

**Features Needed:**
- ✅ List all medicines in hospital inventory
- ✅ Search functionality
- ✅ Filter by low stock
- ✅ Add new medicine form
- ✅ Edit medicine (stock, price)
- ✅ Delete medicine
- ✅ Low stock alerts
- ✅ Display prices in rupees (convert from paise)

**UI Components:**
- Table/Grid view of medicines
- Add Medicine modal/form
- Edit Medicine modal/form
- Search bar
- Low stock badge/indicator

#### 2. Enhanced Prescription Form
**Location:** `frontend/src/pages/doctor/CreatePrescription.jsx`

**Features Needed:**
- ✅ Medicine search with autocomplete (from inventory)
- ✅ For each medicine, add checkbox: "Bill from hospital pharmacy"
- ✅ Show available stock when selecting medicine
- ✅ Show price from inventory
- ✅ Prevent selecting out-of-stock medicines
- ✅ Save purchaseFromHospital flag with prescription

**UI Updates:**
```javascript
// For each medicine in prescription:
{
  medicineName: "Paracetamol 500mg",
  dosage: "1 tablet",
  frequency: "Twice daily",
  duration: "5 days",
  quantity: 10,
  purchaseFromHospital: true  // ← Checkbox value
}
```

#### 3. Refactored Bill Generation
**Location:** `frontend/src/pages/doctor/GenerateBill.jsx`

**Features Needed:**
- ✅ Check if bill already generated (finalBillGenerated flag)
- ✅ Disable button if bill exists
- ✅ Show message: "Bill already generated for this appointment"
- ✅ Fetch prescription automatically
- ✅ Show medicines marked for hospital purchase
- ✅ Display inventory prices
- ✅ Auto-calculate line items
- ✅ Add doctor's consultation fee
- ✅ Show total

---

## 🔨 Part 4: Backend Bill Generation Logic - NEEDS UPDATE

### Current File: `backend/controllers/bills.js`

**What Needs to Change:**

```javascript
exports.createBill = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const doctorId = req.user.id;

    // 1. Check if bill already generated
    const appointment = await Appointment.findById(appointmentId);
    if (appointment.finalBillGenerated) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bill already generated for this appointment' 
      });
    }

    // 2. Get prescription
    const prescription = await Prescription.findOne({ appointmentId });
    if (!prescription || !prescription.medicines) {
      return res.status(404).json({ 
        success: false, 
        message: 'No prescription found' 
      });
    }

    // 3. Get doctor's hospital
    const doctor = await Doctor.findOne({ userId: doctorId });
    if (!doctor || !doctor.hospitalId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Doctor not associated with hospital' 
      });
    }

    // 4. Filter medicines marked for hospital purchase
    const hospitalMedicines = prescription.medicines.filter(
      m => m.purchaseFromHospital === true
    );

    // 5. Build line items from inventory
    const lineItems = [];
    let totalAmount = 0;

    for (const medicine of hospitalMedicines) {
      // Find medicine in inventory
      const inventoryItem = await Inventory.findOne({
        hospitalId: doctor.hospitalId,
        medicineName: medicine.medicineName,
        isActive: true
      });

      if (!inventoryItem) {
        return res.status(404).json({ 
          success: false, 
          message: `Medicine ${medicine.medicineName} not found in inventory` 
        });
      }

      // Check stock
      if (inventoryItem.stockQuantity < medicine.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for ${medicine.medicineName}` 
        });
      }

      // Add to line items
      const itemTotal = inventoryItem.price * medicine.quantity;
      lineItems.push({
        description: `${medicine.medicineName} (${medicine.dosage})`,
        quantity: medicine.quantity,
        amount: inventoryItem.price
      });
      totalAmount += itemTotal;

      // Reduce stock
      await inventoryItem.reduceStock(medicine.quantity);
    }

    // 6. Add consultation fee
    lineItems.push({
      description: 'Consultation Fee',
      quantity: 1,
      amount: doctor.consultationFee || 25000
    });
    totalAmount += doctor.consultationFee || 25000;

    // 7. Create bill
    const bill = new Bill({
      appointmentId,
      patientId: appointment.patientId,
      doctorId,
      items: lineItems,
      totalAmount,
      status: 'unpaid'
    });

    await bill.save();

    // 8. Mark appointment as billed
    appointment.finalBillGenerated = true;
    await appointment.save();

    res.status(201).json({ 
      success: true, 
      message: 'Bill generated successfully',
      bill 
    });
  } catch (error) {
    console.error('Error generating bill:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate bill' 
    });
  }
};
```

---

## 📋 Implementation Checklist

### Backend ✅
- [x] Create Hospital model
- [x] Create Inventory model
- [x] Update Doctor model (add hospitalId)
- [x] Update Prescription model (add medicines array with purchaseFromHospital)
- [x] Update Appointment model (add finalBillGenerated)
- [x] Create inventory controller
- [x] Create inventory routes
- [x] Add routes to server.js
- [ ] Update bills controller with inventory logic

### Frontend 🔨
- [ ] Create Inventory Management page
- [ ] Add inventory link to doctor sidebar
- [ ] Update prescription form with medicine search
- [ ] Add "Bill from hospital" checkbox
- [ ] Update bill generation page
- [ ] Add bill already generated check
- [ ] Show inventory-based line items

---

## 🎯 Next Steps

### Immediate (High Priority):
1. **Update Bills Controller** - Implement inventory-based billing logic
2. **Create Inventory Management UI** - Doctor can manage medicines
3. **Update Prescription Form** - Add hospital purchase checkbox

### Soon:
4. **Add Navigation** - Link to inventory page in sidebar
5. **Testing** - Test complete flow end-to-end
6. **Seed Data** - Add sample hospitals and inventory

---

## 🔄 Complete Workflow

### 1. Setup Phase:
```
Admin creates Hospital
  ↓
Doctor assigned to Hospital
  ↓
Doctor adds medicines to Inventory
```

### 2. Prescription Phase:
```
Patient books appointment
  ↓
Doctor completes appointment
  ↓
Doctor writes prescription
  ↓
For each medicine:
  - Search from inventory
  - Check "Bill from hospital pharmacy" if needed
  - Save prescription
```

### 3. Billing Phase:
```
Doctor clicks "Generate Bill"
  ↓
System checks: finalBillGenerated?
  ↓
If false:
  - Fetch prescription
  - Filter medicines with purchaseFromHospital=true
  - Look up prices from inventory
  - Check stock availability
  - Create line items
  - Add consultation fee
  - Calculate total
  - Create bill
  - Reduce inventory stock
  - Set finalBillGenerated=true
```

### 4. Payment Phase:
```
Patient views bill
  ↓
Patient pays bill
  ↓
Payment recorded
  ↓
Bill status = 'paid'
```

---

## 💡 Key Features

### Inventory Management:
✅ Hospital-specific inventory
✅ Stock tracking
✅ Low stock alerts
✅ Price management (in paise)
✅ Medicine search
✅ Batch and expiry tracking

### Prescription:
✅ Multiple medicines per prescription
✅ Selective hospital billing
✅ Stock availability check
✅ Inventory integration

### Billing:
✅ One-time bill generation
✅ Inventory-based pricing
✅ Automatic stock reduction
✅ Consultation fee inclusion
✅ Detailed line items

---

## 🚀 API Endpoints Summary

### Inventory:
```
GET    /api/inventory/my-hospital        # Get doctor's hospital inventory
GET    /api/inventory/search?query=...   # Search medicines
GET    /api/inventory/low-stock          # Get low stock items
POST   /api/inventory                    # Add medicine
PUT    /api/inventory/:itemId            # Update medicine
DELETE /api/inventory/:itemId            # Delete medicine
```

### Bills (Updated):
```
POST   /api/bills                        # Generate bill (with inventory logic)
GET    /api/bills/patient                # Get patient bills
GET    /api/bills/:billId                # Get bill details
```

---

## 📊 Database Schema

### Hospital:
```javascript
{
  name: "City Hospital",
  address: "123 Main St",
  phone: "1234567890",
  district: "Thiruvananthapuram"
}
```

### Inventory:
```javascript
{
  hospitalId: ObjectId,
  medicineName: "Paracetamol 500mg",
  stockQuantity: 100,
  price: 500,  // ₹5.00 in paise
  unit: "tablet",
  minStockLevel: 20
}
```

### Prescription (Updated):
```javascript
{
  appointmentId: ObjectId,
  medicines: [
    {
      medicineName: "Paracetamol 500mg",
      dosage: "1 tablet",
      frequency: "Twice daily",
      duration: "5 days",
      quantity: 10,
      purchaseFromHospital: true  // ← Key field
    }
  ]
}
```

---

**Status:** Backend models and API complete. Frontend UI needs to be built.

**Next Action:** Create Inventory Management page and update prescription form.
