# System Architecture - Advanced Clinical & Billing

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Patient    │  │    Doctor    │  │    Admin     │         │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  Patient Features:      Doctor Features:      Admin Features:   │
│  • View Prescriptions   • Smart Prescription  • Manage Inventory│
│  • View Bills          • Patient File View   • Manage Hospitals │
│  • Make Payments       • Inventory Search    • Approve Doctors  │
│  • Book Appointments   • View Appointments   • View Analytics   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js/Express)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Controllers                        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • doctors.js      - Prescription & Appointment Logic     │  │
│  │ • patients.js     - Patient File & Search                │  │
│  │ • inventory.js    - Inventory Management                 │  │
│  │ • bills.js        - Bill Creation & Management           │  │
│  │ • mockPayments.js - Payment Processing & Stock Reduction │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Business Logic                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • Two-Step Inventory Check                               │  │
│  │ • One-Time Action Enforcement                            │  │
│  │ • Auto-Bill Generation                                   │  │
│  │ • Stock Reduction on Payment                             │  │
│  │ • Role-Based Access Control                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose ODM
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE (MongoDB)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Collections:                                                    │
│  • users          - Patient/Doctor/Admin accounts               │
│  • doctors        - Doctor profiles (with hospitalId)           │
│  • hospitals      - Hospital information                        │
│  • inventory      - Medicine stock (linked to hospitals)        │
│  • appointments   - Appointments (with flags)                   │
│  • prescriptions  - Prescriptions (billed + prescribed-only)    │
│  • bills          - Bills (with inventory references)           │
│  • payments       - Payment records                             │
│  • medicalhistory - Patient medical history                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. Smart Prescription Creation Flow

```
┌─────────────┐
│   Doctor    │
│  Completes  │
│ Appointment │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│         Navigate to "Create Prescription"               │
│         (Appointment auto-selected)                     │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Search Hospital Inventory (Real-time)                  │
│  • Type medicine name                                   │
│  • See stock status (In Stock / Out of Stock)          │
│  • View price per unit                                  │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Add to "Billed Items"                                  │
│  • Medicine from inventory                              │
│  • Dosage, Frequency, Duration, Quantity               │
│  • CHECK 1: Verify stock availability ✓                │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Optionally Add "Prescribed-Only Items"                 │
│  • Free-form medicine entry                             │
│  • Not included in billing                              │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Enter Additional Details                               │
│  • Diagnosis                                            │
│  • Notes                                                │
│  • Consultation Fee (or use default)                   │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Click "Create Prescription & Generate Bill"            │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Backend Processing:                                    │
│  1. Validate appointment eligibility                    │
│  2. Check prescriptionGenerated flag                    │
│  3. Create Prescription document                        │
│  4. Set prescriptionGenerated = true                    │
│  5. Generate Bill (if billed items exist)              │
│  6. Set finalBillGenerated = true                       │
│  7. Send notifications                                  │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Result:                                                │
│  ✓ Prescription created                                 │
│  ✓ Bill generated (if applicable)                       │
│  ✓ Patient notified                                     │
│  ✓ Button disabled (one-time action)                    │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Two-Step Inventory Check & Payment Flow

```
┌─────────────────────────────────────────────────────────┐
│  Prescription Created with Billed Medicines             │
│  • Stock: 100 units                                     │
│  • Quantity prescribed: 10 units                        │
│  • CHECK 1: Stock available ✓                           │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Bill Generated                                         │
│  • Line items with inventoryItemId stored               │
│  • Status: unpaid                                       │
│  • Stock NOT reduced yet                                │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Patient Views Bill                                     │
│  • Sees medicines + consultation fee                    │
│  • Total amount displayed                               │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Patient Clicks "Pay Now"                               │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Backend: CHECK 2 (Re-verify Stock)                     │
│  • Fetch current inventory stock                        │
│  • Verify: stockQuantity >= quantity needed             │
│  • If insufficient → Return error                       │
│  • If sufficient → Create payment order                 │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Payment Gateway (Mock)                                 │
│  • Patient completes payment                            │
│  • Payment status: completed                            │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Payment Webhook Triggered                              │
│  1. Verify payment success                              │
│  2. Fetch bill with inventory references                │
│  3. For each billed item:                               │
│     • Fetch inventory item                              │
│     • Reduce stock: stockQuantity -= quantity           │
│     • Save inventory                                    │
│  4. Update bill status: paid                            │
│  5. Send notifications                                  │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Result:                                                │
│  ✓ Payment completed                                    │
│  ✓ Stock reduced: 100 → 90 units                        │
│  ✓ Bill marked as paid                                  │
│  ✓ Notifications sent                                   │
└─────────────────────────────────────────────────────────┘
```

---

### 3. Patient File View Flow

```
┌─────────────┐
│   Doctor    │
│  Navigates  │
│   to Page   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Search Patient                                         │
│  • Enter name or email                                  │
│  • Real-time search                                     │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Backend: Search Patients                               │
│  • Find patients with appointments with this doctor     │
│  • Filter by search query                               │
│  • Return matching patients                             │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Display Search Results                                 │
│  • Patient name, email, district                        │
│  • Click to view full file                              │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Backend: Fetch Patient File                            │
│  • Patient details (User model)                         │
│  • Medical history (MedicalHistory model)               │
│  • All appointments (Appointment model)                 │
│  • All prescriptions (Prescription model)               │
│  • All bills (Bill model)                               │
│  • Calculate statistics                                 │
└──────┬──────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│  Display Patient File                                   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Patient Header                                  │   │
│  │ • Name, Email, District                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Statistics Cards                                │   │
│  │ • Total Appointments: 10                        │   │
│  │ • Completed: 7                                  │   │
│  │ • Prescriptions: 5                              │   │
│  │ • Unpaid Bills: 1                               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Tabs:                                           │   │
│  │ [Overview] [Appointments] [Prescriptions] [Bills]│  │
│  │                                                 │   │
│  │ Content based on selected tab                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Relationships

```
┌──────────────┐
│    Users     │
│──────────────│
│ _id          │◄─────┐
│ name         │      │
│ email        │      │
│ role         │      │
└──────────────┘      │
                      │
                      │
┌──────────────┐      │
│   Doctors    │      │
│──────────────│      │
│ _id          │      │
│ userId       │──────┘
│ hospitalId   │──────┐
│ consultationFee│     │
└──────────────┘      │
                      │
                      │
┌──────────────┐      │
│  Hospitals   │      │
│──────────────│      │
│ _id          │◄─────┤
│ name         │      │
│ address      │      │
└──────────────┘      │
       ▲              │
       │              │
       │              │
┌──────────────┐      │
│  Inventory   │      │
│──────────────│      │
│ _id          │      │
│ hospitalId   │──────┘
│ medicineName │
│ stockQuantity│
│ price        │
└──────────────┘
       ▲
       │
       │ (inventoryItemId)
       │
┌──────────────┐
│Prescriptions │
│──────────────│
│ _id          │
│ appointmentId│──────┐
│ medicines[]  │      │
│  - inventoryItemId  │
│  - purchaseFromHospital
│ consultationFee│    │
└──────────────┘      │
                      │
                      │
┌──────────────┐      │
│ Appointments │      │
│──────────────│      │
│ _id          │◄─────┤
│ patientId    │      │
│ doctorId     │      │
│ prescriptionGenerated│
│ finalBillGenerated  │
└──────────────┘      │
       ▲              │
       │              │
       │              │
┌──────────────┐      │
│    Bills     │      │
│──────────────│      │
│ _id          │      │
│ appointmentId│──────┘
│ items[]      │
│  - inventoryItemId
│ totalAmount  │
│ status       │
└──────────────┘
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Authentication                        │
├─────────────────────────────────────────────────────────┤
│ • JWT Token-based                                       │
│ • Stored in localStorage                                │
│ • Sent in Authorization header                          │
│ • Verified by middleware                                │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   Authorization                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Patient Routes:                                        │
│  • View own appointments                                │
│  • View own prescriptions                               │
│  • View own bills                                       │
│  • Make payments                                        │
│                                                         │
│  Doctor Routes:                                         │
│  • View own appointments                                │
│  • Create prescriptions                                 │
│  • View patient files (only with appointment history)   │
│  • Search inventory                                     │
│                                                         │
│  Admin Routes:                                          │
│  • Manage inventory                                     │
│  • Manage hospitals                                     │
│  • Approve doctors                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Data Validation                         │
├─────────────────────────────────────────────────────────┤
│ • Input sanitization                                    │
│ • Type checking                                         │
│ • Range validation                                      │
│ • Business rule enforcement                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Design Patterns

### 1. One-Time Action Pattern
```
┌─────────────────────────────────────────────────────────┐
│  Database Flag Pattern                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Before Action:                                         │
│  1. Check flag (prescriptionGenerated)                  │
│  2. If true → Return error                              │
│  3. If false → Proceed                                  │
│                                                         │
│  After Action:                                          │
│  1. Set flag to true                                    │
│  2. Save to database                                    │
│                                                         │
│  Frontend:                                              │
│  1. Check flag                                          │
│  2. Disable button if true                              │
│  3. Show "Already created" message                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. Two-Step Verification Pattern
```
┌─────────────────────────────────────────────────────────┐
│  Optimistic Check + Pessimistic Verification            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Step 1 (Optimistic):                                   │
│  • Check availability at action time                    │
│  • Provide immediate feedback                           │
│  • Store reference for later                            │
│                                                         │
│  Step 2 (Pessimistic):                                  │
│  • Re-check availability at commit time                 │
│  • Handle race conditions                               │
│  • Fail safely if unavailable                           │
│                                                         │
│  Benefits:                                              │
│  • Better UX (immediate feedback)                       │
│  • Data integrity (final verification)                  │
│  • Race condition handling                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3. Aggregation Pattern
```
┌─────────────────────────────────────────────────────────┐
│  Patient File Aggregation                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Single API Call Returns:                               │
│  • Patient details                                      │
│  • Medical history                                      │
│  • All appointments                                     │
│  • All prescriptions                                    │
│  • All bills                                            │
│  • Calculated statistics                                │
│                                                         │
│  Benefits:                                              │
│  • Reduced API calls                                    │
│  • Consistent data view                                 │
│  • Better performance                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Performance Optimizations

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend Optimizations                  │
├─────────────────────────────────────────────────────────┤
│ • Debounced search (300ms)                              │
│ • Limited results (20 items)                            │
│ • Lazy loading components                               │
│ • Memoized calculations                                 │
│ • Optimistic UI updates                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Backend Optimizations                   │
├─────────────────────────────────────────────────────────┤
│ • Database indexes on frequently queried fields         │
│ • Aggregation pipelines for complex queries             │
│ • Selective field population                            │
│ • Efficient query patterns                              │
│ • Minimal data transfer                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 Database Optimizations                   │
├─────────────────────────────────────────────────────────┤
│ • Compound indexes                                      │
│ • Indexed foreign keys                                  │
│ • Efficient schema design                               │
│ • Denormalization where appropriate                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 State Management

```
┌─────────────────────────────────────────────────────────┐
│              Component State Flow                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CreatePrescriptionNew Component:                       │
│  • appointments (from API)                              │
│  • selectedAppointment (user selection)                 │
│  • billedMedicines (user input)                         │
│  • prescribedOnlyMedicines (user input)                 │
│  • searchQuery (user input)                             │
│  • searchResults (from API)                             │
│  • diagnosis, notes, consultationFee (user input)       │
│                                                         │
│  PatientFile Component:                                 │
│  • searchQuery (user input)                             │
│  • searchResults (from API)                             │
│  • selectedPatient (user selection)                     │
│  • patientFile (from API)                               │
│  • activeTab (user selection)                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

This architecture provides a solid foundation for a scalable, maintainable, and secure healthcare management system.
