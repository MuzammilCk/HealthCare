# Quick Start Guide - Advanced Clinical & Billing System

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- MongoDB running
- Backend and frontend dependencies installed

### Step 1: Start the Application

#### Backend
```bash
cd backend
npm install
npm start
```
Backend will run on `http://localhost:5000`

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

---

## 🏥 Step 2: Setup Test Data

### 2.1 Seed Hospitals
```bash
cd backend
node seedHospital.js
```
This creates sample hospitals in different districts.

### 2.2 Seed Doctors
```bash
node seedDoctors.js
```
This creates doctors and links them to hospitals.

### 2.3 Add Inventory Items

**Option A: Via API (Recommended)**
Use the inventory management page or API to add medicines:

```bash
# Example: Add medicines via curl
curl -X POST http://localhost:5000/api/v1/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DOCTOR_TOKEN" \
  -d '{
    "medicineName": "Paracetamol",
    "genericName": "Acetaminophen",
    "stockQuantity": 100,
    "price": 500,
    "unit": "tablet",
    "minStockLevel": 20
  }'
```

**Option B: Create a seed script**
Create `backend/seedInventory.js`:

```javascript
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');
const Hospital = require('./models/Hospital');
require('dotenv').config();

const medicines = [
  { name: 'Paracetamol', generic: 'Acetaminophen', price: 500, stock: 100, unit: 'tablet' },
  { name: 'Amoxicillin', generic: 'Amoxicillin', price: 1500, stock: 50, unit: 'capsule' },
  { name: 'Ibuprofen', generic: 'Ibuprofen', price: 800, stock: 75, unit: 'tablet' },
  { name: 'Azithromycin', generic: 'Azithromycin', price: 2000, stock: 30, unit: 'tablet' },
  { name: 'Cetirizine', generic: 'Cetirizine', price: 300, stock: 120, unit: 'tablet' },
];

async function seedInventory() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const hospitals = await Hospital.find();
    
    for (const hospital of hospitals) {
      for (const med of medicines) {
        await Inventory.create({
          hospitalId: hospital._id,
          medicineName: med.name,
          genericName: med.generic,
          stockQuantity: med.stock,
          price: med.price,
          unit: med.unit,
          minStockLevel: 10,
          isActive: true
        });
      }
      console.log(`Added inventory for ${hospital.name}`);
    }

    console.log('Inventory seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedInventory();
```

Run it:
```bash
node seedInventory.js
```

---

## 👨‍⚕️ Step 3: Test Doctor Workflow

### 3.1 Login as Doctor
1. Navigate to `http://localhost:5173/auth/login`
2. Use credentials from seeded doctors (e.g., `anjali.nair@email.com` / `pass_tvm_card1`)

### 3.2 Complete an Appointment
1. Go to **Appointments**
2. Find a scheduled appointment
3. Click **Update Status** → Select **Completed**

### 3.3 Create Smart Prescription

#### Navigate to Prescription Page
1. From appointments list, click **Prescription** button for a completed appointment
2. OR go to **New Prescription** from sidebar

#### Add Billed Medicines (From Inventory)
1. In the search bar, type medicine name (e.g., "Paracetamol")
2. Select from dropdown (shows price and stock)
3. Fill in:
   - **Dosage**: e.g., "500mg"
   - **Frequency**: e.g., "Twice daily"
   - **Duration**: e.g., "5 days"
   - **Quantity**: e.g., 10
   - **Instructions**: e.g., "After meals"
4. Medicine appears in "Billed Items" section with subtotal

#### Add Prescribed-Only Medicines (Not Billed)
1. Click **Add Prescribed-Only Medicine**
2. Manually enter:
   - Medicine name
   - Dosage
   - Frequency
   - Duration
   - Instructions
3. These won't be billed but will appear on prescription

#### Complete Prescription
1. Enter **Diagnosis** (optional)
2. Add **Notes** (optional)
3. Set **Consultation Fee** (or leave empty for default)
4. Review **Bill Summary** (shows medicines + consultation fee)
5. Click **Create Prescription & Generate Bill**

#### What Happens
- ✅ Prescription created with both medicine types
- ✅ Bill auto-generated (if billed items exist)
- ✅ `prescriptionGenerated` flag set to `true`
- ✅ `finalBillGenerated` flag set to `true`
- ✅ Patient receives notification
- ✅ Prescription button becomes disabled

---

## 👤 Step 4: Test Patient Workflow

### 4.1 Login as Patient
1. Logout from doctor account
2. Login with patient credentials

### 4.2 View Prescription
1. Go to **Prescriptions**
2. See newly created prescription
3. View both billed and prescribed-only medicines

### 4.3 View Bill
1. Go to **Bills & Payments**
2. See unpaid bill
3. View line items (medicines + consultation fee)

### 4.4 Pay Bill (Two-Step Check in Action)

#### Initiate Payment
1. Click **Pay Now** on the bill
2. System performs **CHECK 2**: Re-verifies inventory stock
3. If stock available → Payment order created
4. If stock depleted → Error message shown

#### Complete Payment
1. On mock payment page, click **Complete Payment**
2. System:
   - Verifies stock one more time
   - Reduces inventory quantities
   - Marks bill as paid
   - Sends notifications

#### Verify Stock Reduction
1. Logout and login as doctor
2. Go to **Inventory**
3. Check stock levels - should be reduced by quantities in bill

---

## 📋 Step 5: Test Patient File Viewer

### 5.1 Access Patient File
1. Login as doctor
2. Go to **Patient Files** from sidebar
3. Search for patient by name or email
4. Click on patient from results

### 5.2 Explore Patient File

#### Overview Tab
- Patient demographics
- Medical history (blood type, allergies)
- Quick stats (appointments, unpaid bills)

#### Appointments Tab
- All appointments (past and upcoming)
- Status badges
- Chronological order

#### Prescriptions Tab
- All prescriptions issued
- Diagnosis and medicines
- Billed vs prescribed-only distinction

#### Bills Tab
- All bills with line items
- Payment status
- Total amounts

---

## 🧪 Step 6: Test Edge Cases

### 6.1 Duplicate Prescription Prevention
1. Try creating prescription for same appointment twice
2. Should show error: "Prescription already generated"
3. Button should be disabled after first creation

### 6.2 Out of Stock Handling
1. Reduce inventory stock to 0 for a medicine
2. Try adding it to prescription
3. Should show "Out of Stock" in search results
4. Cannot add to billed items

### 6.3 Concurrent Payment Race Condition
1. Create bill with medicine (stock: 5, quantity: 5)
2. Open bill in two browser tabs
3. Click "Pay Now" in both tabs simultaneously
4. First payment succeeds, stock reduced to 0
5. Second payment fails with "Insufficient stock" error

### 6.4 Stock Verification at Payment
1. Create prescription with medicine (stock: 10, quantity: 5)
2. Bill generated
3. Manually reduce stock to 3 in database
4. Patient tries to pay
5. Should fail with "Insufficient stock" message

---

## 📊 Step 7: Verify Data Flow

### 7.1 Check Database

#### Appointment Flags
```javascript
db.appointments.findOne({ _id: "APPOINTMENT_ID" })
// Should show:
// prescriptionGenerated: true
// finalBillGenerated: true
```

#### Prescription with Both Medicine Types
```javascript
db.prescriptions.findOne({ appointmentId: "APPOINTMENT_ID" })
// Should show:
// medicines: [
//   { medicineName: "...", purchaseFromHospital: true, inventoryItemId: "..." },
//   { medicineName: "...", purchaseFromHospital: false }
// ]
```

#### Bill with Inventory References
```javascript
db.bills.findOne({ appointmentId: "APPOINTMENT_ID" })
// Should show:
// items: [
//   { description: "...", inventoryItemId: "..." },
//   { description: "Consultation Fee" }
// ]
```

#### Inventory Stock Reduction
```javascript
// Before payment
db.inventory.findOne({ medicineName: "Paracetamol" })
// stockQuantity: 100

// After payment (quantity: 10)
db.inventory.findOne({ medicineName: "Paracetamol" })
// stockQuantity: 90
```

---

## 🔍 Step 8: Test API Endpoints

### 8.1 Search Inventory
```bash
curl -X GET "http://localhost:5000/api/v1/inventory/search?query=para" \
  -H "Authorization: Bearer DOCTOR_TOKEN"
```

### 8.2 Create Prescription
```bash
curl -X POST http://localhost:5000/api/v1/doctors/prescriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DOCTOR_TOKEN" \
  -d '{
    "appointmentId": "APPOINTMENT_ID",
    "billedMedicines": [
      {
        "medicineName": "Paracetamol",
        "dosage": "500mg",
        "frequency": "Twice daily",
        "duration": "5 days",
        "quantity": 10,
        "instructions": "After meals"
      }
    ],
    "prescribedOnlyMedicines": [
      {
        "medicineName": "Vitamin D3",
        "dosage": "60000 IU",
        "frequency": "Once weekly",
        "duration": "8 weeks",
        "quantity": 1
      }
    ],
    "diagnosis": "Viral fever",
    "consultationFee": 50000,
    "generateBill": true
  }'
```

### 8.3 Get Patient File
```bash
curl -X GET "http://localhost:5000/api/v1/patients/PATIENT_ID/file" \
  -H "Authorization: Bearer DOCTOR_TOKEN"
```

### 8.4 Search Patients
```bash
curl -X GET "http://localhost:5000/api/v1/patients/search?query=john" \
  -H "Authorization: Bearer DOCTOR_TOKEN"
```

---

## 🎯 Step 9: Common Issues & Solutions

### Issue: "Doctor not associated with any hospital"
**Solution**: Ensure doctor has `hospitalId` set in database
```javascript
db.doctors.updateOne(
  { userId: ObjectId("DOCTOR_USER_ID") },
  { $set: { hospitalId: ObjectId("HOSPITAL_ID") } }
)
```

### Issue: Inventory search returns empty
**Solution**: 
1. Check if inventory items exist for doctor's hospital
2. Verify `isActive: true` on inventory items
3. Check search query (minimum 2 characters)

### Issue: Bill not auto-generated
**Solution**:
1. Ensure `generateBill: true` in request
2. Check if billed medicines exist (not just prescribed-only)
3. Verify `finalBillGenerated` is false

### Issue: Stock not reducing on payment
**Solution**:
1. Check if bill items have `inventoryItemId`
2. Verify payment webhook is executing
3. Check console logs for stock reduction messages

---

## 📈 Step 10: Performance Testing

### Test Concurrent Prescriptions
1. Create multiple appointments
2. Create prescriptions simultaneously
3. Verify no race conditions
4. Check all flags set correctly

### Test Large Inventory Search
1. Add 100+ medicines to inventory
2. Test search performance
3. Verify results limited to 20
4. Check debouncing works (300ms delay)

### Test Patient File with Large Data
1. Create patient with 50+ appointments
2. Load patient file
3. Verify performance
4. Check pagination if needed

---

## 🎓 Step 11: Feature Highlights to Demo

### 1. Smart Prescription Creation
- Real-time inventory search
- Stock status indicators
- Separate billed vs prescribed-only sections
- Auto-bill generation
- One-time action enforcement

### 2. Two-Step Inventory Check
- CHECK 1: At prescription creation
- CHECK 2: At payment time
- Prevents overselling
- Handles concurrent payments

### 3. Patient File Viewer
- Comprehensive patient data
- Organized tabs
- Statistics cards
- Chronological history

### 4. Monetary Precision
- All values in paise (integers)
- No floating-point errors
- Accurate calculations

### 5. Role-Based Access
- Patients: View only their data
- Doctors: Create prescriptions, view patient files
- Admins: Manage inventory

---

## 📝 Step 12: Next Steps

### Production Deployment
1. Set up environment variables
2. Configure real payment gateway
3. Set up email/SMS notifications
4. Enable HTTPS
5. Set up monitoring

### Additional Features to Consider
1. Prescription templates
2. Batch inventory updates
3. Analytics dashboard
4. Export patient files to PDF
5. Appointment reminders

---

## 🆘 Support

### Logs to Check
- Backend console: API calls, errors
- Frontend console: Network requests, state changes
- MongoDB logs: Database operations

### Debug Mode
Enable detailed logging:
```javascript
// backend/server.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

### Common Commands
```bash
# Check MongoDB connection
mongosh
use healthcare
db.appointments.find().pretty()

# Clear test data
db.prescriptions.deleteMany({})
db.bills.deleteMany({})
db.appointments.updateMany({}, { $set: { prescriptionGenerated: false, finalBillGenerated: false } })

# Reset inventory stock
db.inventory.updateMany({}, { $set: { stockQuantity: 100 } })
```

---

## ✅ Success Criteria

You've successfully implemented the system when:

- ✅ Doctor can create prescription with inventory search
- ✅ Prescription includes both billed and prescribed-only medicines
- ✅ Bill auto-generates with correct line items
- ✅ Duplicate prescriptions prevented
- ✅ Stock verified at payment time (two-step check)
- ✅ Stock reduced only after successful payment
- ✅ Patient file shows comprehensive data
- ✅ All monetary values calculated correctly
- ✅ No race conditions in concurrent operations
- ✅ Proper error handling and user feedback

---

## 🎉 Congratulations!

You now have a fully functional advanced clinical and billing system with:
- Inventory-based prescription management
- Smart billing workflow
- Two-step availability checks
- Centralized patient file management
- Role-based access control
- Production-ready error handling

For detailed implementation details, see `ADVANCED_CLINICAL_BILLING_IMPLEMENTATION.md`
