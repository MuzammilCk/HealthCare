# Hospital & Inventory Management - Admin Feature

## Overview
Complete implementation of admin features to manage hospitals and their inventory across the entire healthcare system.

---

## Features Implemented

### 1. **Hospital Management**
Admins can:
- ✅ View all hospitals
- ✅ Create new hospitals
- ✅ Update hospital details
- ✅ Delete hospitals (with safety checks)
- ✅ Assign doctors to hospitals

### 2. **Inventory Management**
Admins can:
- ✅ View inventory across all hospitals
- ✅ Filter inventory by hospital
- ✅ Add new medicines to hospital inventory
- ✅ Update medicine details (price, stock, etc.)
- ✅ Delete medicines from inventory
- ✅ Track stock levels and expiry dates

### 3. **Doctor-Hospital Association**
- ✅ Every doctor is assigned to a hospital
- ✅ Hospital information displayed in doctor profiles
- ✅ Automatic hospital assignment during doctor seeding
- ✅ Hospital-based inventory access for prescriptions

---

## Backend Implementation

### **API Endpoints**

#### Hospital Management
```
GET    /api/admin/hospitals          - Get all hospitals
POST   /api/admin/hospitals          - Create new hospital
PUT    /api/admin/hospitals/:id      - Update hospital
DELETE /api/admin/hospitals/:id      - Delete hospital
```

#### Inventory Management
```
GET    /api/admin/inventory          - Get all inventory (optional: ?hospitalId=xxx)
POST   /api/admin/inventory          - Add inventory item
PUT    /api/admin/inventory/:id      - Update inventory item
DELETE /api/admin/inventory/:id      - Delete inventory item
```

### **Database Models**

#### Hospital Model
```javascript
{
  name: String (required),
  address: String (required),
  phone: String (required),
  email: String,
  district: String,
  city: String,
  state: String (default: 'Kerala'),
  pincode: String,
  registrationNumber: String (unique),
  isActive: Boolean (default: true),
  timestamps: true
}
```

#### Inventory Model
```javascript
{
  hospitalId: ObjectId (ref: Hospital, required),
  medicineName: String (required),
  genericName: String,
  manufacturer: String,
  stockQuantity: Number (required, min: 0),
  price: Number (required, in paise),
  unit: Enum ['tablet', 'capsule', 'syrup', ...],
  batchNumber: String,
  expiryDate: Date,
  minStockLevel: Number (default: 10),
  isActive: Boolean (default: true),
  lastRestocked: Date,
  notes: String,
  timestamps: true
}
```

#### Doctor Model (Updated)
```javascript
{
  userId: ObjectId (ref: User),
  hospitalId: ObjectId (ref: Hospital), // ← Added
  specializationId: ObjectId (ref: Specialization),
  availability: Array,
  // ... other fields
}
```

---

## Seeding Scripts

### **1. Seed Hospitals**
**File:** `backend/seedHospitals.js`

**Hospitals Included:**
- Rajagiri Hospital (Ernakulam)
- Apollo Hospitals (Ernakulam)
- Amrita Institute of Medical Sciences (Ernakulam)
- Lakeshore Hospital (Ernakulam)
- KIMS Hospital (Thiruvananthapuram)
- Sree Gokulam Medical College (Thiruvananthapuram)
- MIMS Hospital (Kozhikode)
- Baby Memorial Hospital (Kozhikode)
- Aster Medcity (Ernakulam)
- Lisie Hospital (Ernakulam)
- Believers Church Medical College (Pathanamthitta)
- Caritas Hospital (Kottayam)
- Sunrise Hospital (Ernakulam)
- PVS Memorial Hospital (Ernakulam)
- Mother Hospital (Thrissur)

**Run:**
```bash
cd backend
node seedHospitals.js
```

### **2. Seed Doctors (Updated)**
**File:** `backend/seedDoctors.js`

**New Features:**
- ✅ Parses JSON availability correctly
- ✅ Assigns hospital based on doctor's district
- ✅ Sets verification status to 'Approved'
- ✅ Updates existing doctors with hospital assignment

**Run:**
```bash
cd backend
node seedDoctors.js
```

---

## Admin Controller Functions

### **Hospital Management**

#### `getAllHospitals`
- Returns all hospitals sorted by name
- No pagination (suitable for admin dropdown)

#### `createHospital`
- Validates required fields (name, address, phone)
- Checks for duplicate registration numbers
- Creates hospital with Kerala as default state

#### `updateHospital`
- Updates hospital details
- Validates registration number uniqueness
- Allows toggling isActive status

#### `deleteHospital`
- Safety check: Prevents deletion if doctors are assigned
- Safety check: Prevents deletion if inventory exists
- Returns helpful error messages

### **Inventory Management**

#### `getAllInventory`
- Returns all inventory items across hospitals
- Optional filter by hospitalId
- Populates hospital name and district
- Sorted by hospital and medicine name

#### `createInventoryItem`
- Validates required fields
- Checks if hospital exists
- Prevents duplicate medicines per hospital
- Sets lastRestocked date automatically

#### `updateInventoryItem`
- Updates medicine details
- Updates lastRestocked when stock changes
- Allows toggling isActive status

#### `deleteInventoryItem`
- Removes medicine from inventory
- No safety checks (direct deletion)

---

## Security & Validation

### **Role-Based Access**
All admin endpoints require:
```javascript
router.use(protect);           // Must be authenticated
router.use(authorize('admin')); // Must have admin role
```

### **Data Validation**

#### Hospital Creation:
- ✅ Name, address, phone are required
- ✅ Registration number must be unique
- ✅ Email format validation (if provided)

#### Inventory Creation:
- ✅ Hospital ID must exist
- ✅ Medicine name, price, stock are required
- ✅ No duplicate medicines per hospital
- ✅ Price must be in paise (positive number)
- ✅ Stock quantity must be non-negative

#### Safety Checks:
- ✅ Cannot delete hospital with assigned doctors
- ✅ Cannot delete hospital with inventory
- ✅ Cannot create duplicate medicines
- ✅ Validates hospital exists before adding inventory

---

## Frontend Integration (To Be Implemented)

### **Admin Dashboard - New Sections**

#### 1. Hospital Management Page
```
/admin/hospitals

Features:
- List all hospitals in a table
- Add new hospital button (opens modal)
- Edit hospital (inline or modal)
- Delete hospital (with confirmation)
- View doctors assigned to each hospital
- View inventory count per hospital
```

#### 2. Inventory Management Page
```
/admin/inventory

Features:
- List all inventory items
- Filter by hospital (dropdown)
- Add new medicine button (opens modal)
- Edit medicine details (inline or modal)
- Delete medicine (with confirmation)
- Low stock alerts (red badge)
- Expiry date warnings (yellow badge)
- Bulk actions (export, import)
```

#### 3. Doctor Profile Updates
```
Doctor profile pages should show:
- Hospital name
- Hospital address
- Hospital contact
- Hospital district
```

---

## Usage Flow

### **Admin Workflow**

#### Setting Up Hospitals:
1. Admin logs in
2. Goes to Hospital Management
3. Adds hospitals with details
4. Hospitals become available for doctor assignment

#### Managing Inventory:
1. Admin selects a hospital
2. Adds medicines with details:
   - Medicine name
   - Stock quantity
   - Price (in rupees, converted to paise)
   - Batch number
   - Expiry date
   - Minimum stock level
3. System tracks stock and alerts on low levels

#### Assigning Doctors:
1. When doctors register or are seeded
2. System automatically assigns them to a hospital based on district
3. Admin can manually reassign doctors to different hospitals

### **Doctor Workflow**

#### Using Inventory:
1. Doctor creates prescription
2. Adds medicines from their hospital's inventory
3. System checks stock availability
4. Bill is generated with hospital inventory prices
5. Stock is reduced when bill is paid

---

## Database Queries

### **Get Hospitals by District**
```javascript
const hospitals = await Hospital.find({ district: 'Ernakulam', isActive: true });
```

### **Get Hospital Inventory**
```javascript
const inventory = await Inventory.find({ 
  hospitalId: hospitalId, 
  isActive: true 
}).sort({ medicineName: 1 });
```

### **Get Doctors by Hospital**
```javascript
const doctors = await Doctor.find({ hospitalId: hospitalId })
  .populate('userId', 'name email')
  .populate('specializationId', 'name');
```

### **Low Stock Items**
```javascript
const lowStock = await Inventory.find({
  hospitalId: hospitalId,
  $expr: { $lte: ['$stockQuantity', '$minStockLevel'] }
});
```

### **Expired/Expiring Medicines**
```javascript
const expiring = await Inventory.find({
  hospitalId: hospitalId,
  expiryDate: { 
    $gte: new Date(),
    $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
});
```

---

## Testing Checklist

### **Hospital Management**
- [ ] Create hospital with all fields
- [ ] Create hospital with minimal fields (name, address, phone)
- [ ] Update hospital details
- [ ] Try to delete hospital with doctors (should fail)
- [ ] Try to delete hospital with inventory (should fail)
- [ ] Delete empty hospital (should succeed)
- [ ] Try duplicate registration number (should fail)

### **Inventory Management**
- [ ] Add medicine to hospital inventory
- [ ] Try to add duplicate medicine (should fail)
- [ ] Update medicine stock quantity
- [ ] Update medicine price
- [ ] Mark medicine as inactive
- [ ] Delete medicine
- [ ] Filter inventory by hospital
- [ ] View all inventory across hospitals

### **Doctor-Hospital Integration**
- [ ] Seed hospitals first
- [ ] Seed doctors (should auto-assign hospitals)
- [ ] View doctor profile (should show hospital)
- [ ] Create prescription (should access hospital inventory)
- [ ] Generate bill (should use hospital inventory prices)

---

## Files Modified/Created

### **Created:**
1. `backend/seedHospitals.js` - Hospital seeding script
2. `HOSPITAL_INVENTORY_ADMIN_FEATURE.md` - This documentation

### **Modified:**
1. `backend/controllers/admin.js` - Added hospital & inventory functions
2. `backend/routes/admin.js` - Added new routes
3. `backend/seedDoctors.js` - Added hospital assignment logic
4. `backend/controllers/doctors.js` - Added hospital population
5. `backend/models/Doctor.js` - Already had hospitalId field
6. `backend/models/Hospital.js` - Already existed
7. `backend/models/Inventory.js` - Already existed

---

## Next Steps

### **Immediate Actions:**
1. ✅ Run hospital seeding: `node seedHospitals.js`
2. ✅ Run doctor seeding: `node seedDoctors.js`
3. ✅ Test admin API endpoints using Postman/Thunder Client
4. ⏳ Create frontend admin pages for hospital management
5. ⏳ Create frontend admin pages for inventory management
6. ⏳ Update doctor profile pages to show hospital info
7. ⏳ Update patient booking flow to show doctor's hospital

### **Frontend Components Needed:**
1. `ManageHospitals.jsx` - Hospital CRUD interface
2. `ManageInventory.jsx` - Inventory CRUD interface
3. `HospitalSelector.jsx` - Dropdown component
4. `InventoryTable.jsx` - Inventory list with filters
5. `LowStockAlert.jsx` - Alert component for low stock
6. Update `DoctorProfile.jsx` - Show hospital info
7. Update `BookAppointment.jsx` - Show doctor's hospital

---

## API Response Examples

### **Get All Hospitals**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
      "name": "Rajagiri Hospital",
      "address": "Chunangamvely, Aluva",
      "phone": "+91-484-2708000",
      "district": "Ernakulam",
      "city": "Aluva",
      "registrationNumber": "RH-ERN-001",
      "isActive": true
    }
  ]
}
```

### **Get Inventory**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
      "hospitalId": {
        "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
        "name": "Rajagiri Hospital",
        "district": "Ernakulam"
      },
      "medicineName": "Paracetamol 500mg",
      "stockQuantity": 500,
      "price": 500,
      "unit": "tablet",
      "isLowStock": false,
      "expiryDate": "2025-12-31"
    }
  ]
}
```

---

## Error Handling

### **Common Errors:**

#### Hospital Deletion with Dependencies:
```json
{
  "success": false,
  "message": "Cannot delete hospital. 5 doctor(s) are associated with it."
}
```

#### Duplicate Medicine:
```json
{
  "success": false,
  "message": "This medicine already exists in the hospital inventory. Use update to modify it."
}
```

#### Hospital Not Found:
```json
{
  "success": false,
  "message": "Hospital not found"
}
```

---

**Implementation Date:** October 2025  
**Status:** ✅ Backend Complete | ⏳ Frontend Pending  
**Breaking Changes:** None - Backward compatible  
**Migration Required:** Run seeding scripts in order (hospitals → doctors)
