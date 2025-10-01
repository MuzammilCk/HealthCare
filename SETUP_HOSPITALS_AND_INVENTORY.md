# Quick Setup Guide - Hospitals & Inventory

## Step-by-Step Implementation

### **Step 1: Seed Hospitals** ✅
Run this command to create 15 hospitals across Kerala:

```bash
cd backend
node seedHospitals.js
```

**Expected Output:**
```
MongoDB connected for hospital seeding...
✓ Created: Rajagiri Hospital (Ernakulam)
✓ Created: Apollo Hospitals (Ernakulam)
✓ Created: KIMS Hospital (Thiruvananthapuram)
...
=== Hospital seeding complete! ===
Total hospitals in database: 15
```

---

### **Step 2: Seed Doctors with Hospital Assignment** ✅
Run this to assign all doctors to hospitals and fix availability:

```bash
cd backend
node seedDoctors.js
```

**Expected Output:**
```
MongoDB connected for doctor seeding...
User created for Dr. Anjali Nair
✓ Doctor profile created for Dr. Anjali Nair at KIMS Hospital
User created for Dr. Biju Menon
✓ Doctor profile created for Dr. Biju Menon at KIMS Hospital
...
--- Doctor data seeding complete! ---
```

---

### **Step 3: Test Admin API Endpoints**

#### Get All Hospitals
```bash
GET http://localhost:5000/api/admin/hospitals
Authorization: Bearer <admin_token>
```

#### Get All Inventory
```bash
GET http://localhost:5000/api/admin/inventory
Authorization: Bearer <admin_token>
```

#### Create Inventory Item
```bash
POST http://localhost:5000/api/admin/inventory
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "hospitalId": "64f5a1b2c3d4e5f6a7b8c9d0",
  "medicineName": "Paracetamol 500mg",
  "genericName": "Acetaminophen",
  "manufacturer": "Cipla",
  "stockQuantity": 500,
  "price": 500,
  "unit": "tablet",
  "batchNumber": "BATCH001",
  "expiryDate": "2025-12-31",
  "minStockLevel": 50
}
```

---

### **Step 4: Verify Doctor-Hospital Association**

#### Get Doctor Profile
```bash
GET http://localhost:5000/api/doctors/profile
Authorization: Bearer <doctor_token>
```

**Response should include:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": {...},
    "hospitalId": {
      "_id": "...",
      "name": "Rajagiri Hospital",
      "address": "Chunangamvely, Aluva",
      "district": "Ernakulam",
      "city": "Aluva",
      "phone": "+91-484-2708000"
    },
    "specializationId": {...},
    ...
  }
}
```

---

## What's Working Now

### ✅ **Backend Complete**
- Hospital CRUD operations
- Inventory CRUD operations
- Doctor-hospital association
- Hospital information in doctor profiles
- Inventory filtering by hospital
- Safety checks for deletions

### ⏳ **Frontend To Do**
- Admin hospital management page
- Admin inventory management page
- Display hospital info in doctor profiles
- Display hospital info in booking flow

---

## Quick Test Scenarios

### **Scenario 1: Admin Creates Hospital**
1. Login as admin
2. POST to `/api/admin/hospitals` with hospital data
3. Verify hospital appears in GET `/api/admin/hospitals`

### **Scenario 2: Admin Adds Medicine**
1. Get hospital ID from hospitals list
2. POST to `/api/admin/inventory` with medicine data
3. Verify medicine appears in GET `/api/admin/inventory?hospitalId=xxx`

### **Scenario 3: Doctor Views Profile**
1. Login as doctor
2. GET `/api/doctors/profile`
3. Verify `hospitalId` is populated with hospital details

### **Scenario 4: Doctor Creates Prescription**
1. Doctor completes appointment
2. Creates prescription with medicines from hospital inventory
3. System uses hospital's inventory prices for billing

---

## Common Issues & Solutions

### **Issue: "No active hospital found"**
**Solution:** Run `node seedHospitals.js` first

### **Issue: "Doctor has no hospital assigned"**
**Solution:** Run `node seedDoctors.js` to update existing doctors

### **Issue: "Cannot delete hospital"**
**Solution:** This is expected if doctors or inventory exist. Reassign doctors first.

### **Issue: "Duplicate medicine error"**
**Solution:** Use PUT endpoint to update existing medicine instead

---

## Database Verification

### **Check Hospitals**
```javascript
// In MongoDB shell or Compass
db.hospitals.find().count()  // Should be 15
db.hospitals.find({ district: "Ernakulam" })  // Should show multiple hospitals
```

### **Check Doctor-Hospital Links**
```javascript
db.doctors.find({ hospitalId: { $exists: true } }).count()  // Should match total doctors
db.doctors.find({ hospitalId: null })  // Should be empty
```

### **Check Inventory**
```javascript
db.inventories.find().count()  // Check inventory count
db.inventories.find({ hospitalId: ObjectId("...") })  // Check specific hospital
```

---

## Next Development Steps

### **Priority 1: Admin Frontend**
1. Create `ManageHospitals.jsx` page
2. Create `ManageInventory.jsx` page
3. Add routes in `main.jsx`
4. Add navigation links in admin sidebar

### **Priority 2: Display Hospital Info**
1. Update doctor profile pages to show hospital
2. Update booking flow to show doctor's hospital
3. Update appointment cards to show hospital

### **Priority 3: Inventory Features**
1. Low stock alerts
2. Expiry date warnings
3. Stock history tracking
4. Bulk import/export

---

## API Endpoints Summary

### **Hospitals**
- `GET /api/admin/hospitals` - List all
- `POST /api/admin/hospitals` - Create
- `PUT /api/admin/hospitals/:id` - Update
- `DELETE /api/admin/hospitals/:id` - Delete

### **Inventory**
- `GET /api/admin/inventory` - List all (filter: ?hospitalId=xxx)
- `POST /api/admin/inventory` - Create
- `PUT /api/admin/inventory/:id` - Update
- `DELETE /api/admin/inventory/:id` - Delete

### **Doctors (Updated)**
- `GET /api/doctors/profile` - Now includes hospitalId
- `GET /api/admin/doctors` - Now includes hospitalId

---

## Success Criteria

✅ All hospitals seeded successfully  
✅ All doctors assigned to hospitals  
✅ Doctor profiles show hospital information  
✅ Admin can manage hospitals via API  
✅ Admin can manage inventory via API  
✅ Inventory is hospital-specific  
✅ Safety checks prevent data integrity issues  

---

**Ready to Use!** The backend is fully functional. You can now:
1. Test all API endpoints
2. Start building the frontend admin pages
3. Update existing pages to display hospital information

For detailed API documentation, see `HOSPITAL_INVENTORY_ADMIN_FEATURE.md`
