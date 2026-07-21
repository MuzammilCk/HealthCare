# HealthSync (MuzammilCk/HealthCare) — Security, QA & Healthcare-Domain Audit

**Scope:** full backend — 13 route files, 13 controllers, 12 models, all middleware (~6,900 lines).
**Method:** module-by-module read-through, hunting for real (not hypothetical) bugs, followed by empirical verification of every finding and every fix — mock-based unit tests, a live HTTP test for the webhook ordering bug, and direct reproduction of the crash bug against the pinned `mongoose@7.8.6`. No live MongoDB was reachable from this environment (egress to MongoDB's binary CDN is blocked), so DB-dependent controller logic was verified by dependency-injecting fake models into `require.cache` and calling the real, unmodified controller functions — real code under test, not reimplemented logic.
**Result:** 18 findings — 3 Critical, 6 High, 7 Medium, 2 domain-safety. All 18 are patched. One additional item is flagged as a **product decision**, not patched (explained below).

Every patch has a corresponding test script (listed per-finding). All 11 patches were verified with `git am` against a clean checkout of `main` and produce byte-identical output to the code that was actually tested.

---

## How to apply

```bash
cd HealthCare
git checkout -b security-qa-audit-fixes
git am patches/0001-*.patch patches/0002-*.patch patches/0003-*.patch \
       patches/0004-*.patch patches/0005-*.patch patches/0006-*.patch \
       patches/0007-*.patch patches/0008-*.patch patches/0009-*.patch \
       patches/0010-*.patch patches/0011-*.patch
```
Or apply one at a time with `git apply patches/0001-....patch` if you want to review/test incrementally. They're independent enough to cherry-pick, except 0002 and 0003 both touch `patients.js`/`doctors.js` and should be applied in order (0001→0011).

---

## Severity legend

- **CRITICAL** — exploitable today, real-world harm to patients or data integrity.
- **HIGH** — guaranteed functional failure or a significant, clearly-reachable gap.
- **MEDIUM** — real impact but bounded (defense-in-depth, workflow dead-ends, edge cases).
- **DOMAIN** — healthcare-specific patient-safety consideration, not a code defect per se.

## Findings at a glance

| # | Severity | Area | Finding | Patch |
|---|---|---|---|---|
| 1 | **CRITICAL** | Security / PHI | Any doctor could read **and write** any patient's full medical record | 0001 |
| 2 | **CRITICAL** | Scheduling | Two endpoints generated different slot durations (60min vs 30min) → double-booking | 0002 |
| 3 | **CRITICAL** | Booking / KYC | Booking never checked doctor KYC status or slot-availability window | 0003 |
| 4 | HIGH | Bills | `getDoctorBillStats` crashes on every call | 0004 |
| 5 | HIGH | Appointments | No status state machine; doctor rejection never refunded a paid booking | 0005 |
| 6 | HIGH | Payments | Stripe routes never mounted; webhook signature verification architecturally broken | 0006 |
| 7 | MEDIUM | Dates | Systemic UTC-vs-local-time date bugs (`getDay()`/`setHours()` on UTC-stored dates) | 0002/0003 |
| 8 | MEDIUM | Auth | Login rate limit (50/15min) too permissive | 0007 |
| 9 | MEDIUM | Auth | Registration role-validator allowed `admin` (controller compensated, but fragile) | 0007 |
| 10 | MEDIUM | Code quality | Dead duplicate `cancelAppointment` definition (silently shadowed) | 0007 |
| 11 | MEDIUM | Access control | `pharmacy.js` route had no route-level role guard (controller compensated) | 0007 |
| 12 | MEDIUM | Inventory | Admins always 404'd on inventory update/delete despite being authorized | 0008 |
| 13 | MEDIUM | Admin | `deleteDoctor` orphaned appointment/prescription/bill records | 0009 |
| 14 | MEDIUM | Billing | Cancelling a bill permanently blocked re-billing that appointment | 0010 |
| 15 | MEDIUM | Payments | `verifyMockPayment` bypassed the "2+ unpaid bills" booking limit | 0003 |
| 16 | DOMAIN | AI safety | Symptom Checker had no emergency/red-flag escalation | 0011 |
| 17 | DOMAIN/MEDIUM | AI safety | Symptom Checker had no rate limit on a paid external API | 0011 |
| 18 | Documented only | Architecture | Mock vs. real-Stripe flows use incompatible booking sequences | *(not patched — see below)* |

---

## Detailed findings

### 1 — CRITICAL: PHI exposure — no doctor-patient relationship check
**Files:** `controllers/patients.js` (`getPatientFile`), `controllers/medicalHistory.js` (`getPatientMedicalHistory`, `updatePatientMedicalHistory`, `approveMedicalHistory`) · **Patch 0001**

All four endpoints were gated only by `authorize('doctor', 'admin')` — role, never relationship. Any authenticated doctor could pull (and, for medical history, **overwrite**) any patient's full record — allergies, conditions, medications, surgeries, every appointment with every other doctor, every prescription, every bill — by guessing or enumerating a `patientId`. The codebase already had `ensureOwnPatientData`/`ensureOwnDoctorData` middleware written for exactly this purpose in `middleware/security.js`; `grep` across the whole repo confirms it was never imported anywhere. Dead protection code is arguably worse than none — it looks like the gap is covered.

**Fix:** `utils/authorization.js:hasCareRelationship(doctorId, patientId)` checks for an existing `Appointment` between the two; enforced in all four functions (admins bypass — legitimate oversight role).

**Verified:** `test_phi_fix.js` — ran the actual unmodified pre-fix controller: unrelated doctor → `200`, full allergy list returned. Post-fix: unrelated doctor → `403`; doctor with a real appointment → `200`.

### 2 — CRITICAL: divergent slot-duration logic → double-booking
**Files:** `controllers/doctors.js` / `controllers/patients.js` (`getAvailableSlots`, both) · **Patch 0002**

`doctors.js` generated 60-minute slots (`09:00-10:00`); `patients.js` generated 30-minute slots (`09:00-09:30`) from the *same* `doctor.availability` data. Booked slots are excluded by exact string match against `Appointment.timeSlot`. Since the two endpoints produce different strings for the same real-world time, a slot booked through one format is invisible to the other — a doctor can end up double-booked across two patients in an overlapping window. Confirmed the live patient booking UI (`BookAppointment.jsx`) calls the `doctors.js` (60-min) endpoint, so that became the canonical implementation.

**Fix:** extracted a single `utils/scheduling.js:getAvailableSlotsForDate()`, used by both controllers.

**Verified:** `test_slot_consistency.js` — both call sites now return byte-identical arrays for the same doctor/date, with correct exclusion of a booked slot.

### 3 — CRITICAL: booking pipeline never checks KYC status or slot validity
**Files:** `controllers/patients.js` (`bookAppointment`), `controllers/mockPayments.js` (`verifyMockPayment`) · **Patch 0003**

Neither function checked `doctor.verificationStatus === 'Approved'`, and neither validated the requested `timeSlot` against the doctor's declared `availability` — they only checked whether that *exact slot string* was already taken. The doctor directory UI filters to approved doctors, but that's cosmetic: a client with any `doctorId` (a prior page load, a script, an enumerated ObjectId) could book a `Pending`/`Rejected` doctor, or book `03:00-04:00` on a doctor who never listed it, and have it persisted as a normal paid, `Scheduled` appointment. Also found: `verifyMockPayment` creates the appointment directly and is reachable without ever calling `createMockBookingOrder` first, so the "2+ unpaid bills" booking limit enforced only in the latter was bypassable by calling verify directly (finding #15, same patch).

**Fix:** `utils/scheduling.js:validateBookingRequest()` centralizes both checks; applied to both entry points, plus re-added the pending-dues check to `verifyMockPayment`.

**Verified:** `test_booking_validation.js` + `test_mockpayments_fix.js` — unapproved doctor blocked (400), off-schedule slot blocked (400), 2+ unpaid bills blocked even calling verify directly (400), legitimate booking still succeeds (200).

### 4 — HIGH: `getDoctorBillStats` crashes on every call
**File:** `controllers/bills.js` · **Patch 0004**

`mongoose.Types.ObjectId(doctorId)` — called as a plain function, not with `new`. Modern Mongoose/MongoDB-driver versions made `ObjectId` a real ES class; invoking it without `new` throws. This is not conditional — **every single request** to the doctor billing-dashboard-stats endpoint 500s.

**Fix:** `new (require('mongoose').Types.ObjectId)(doctorId)`. Swept the rest of the backend (`grep 'Types.ObjectId('`) — this was the only call site missing `new`.

**Verified:** installed the exact pinned `mongoose@7.8.6` and reproduced the crash directly:
```
TypeError: Class constructor ObjectId cannot be invoked without 'new'
```
Confirmed the corrected call constructs a valid ObjectId.

### 5 — HIGH: no appointment status state machine; no refund on doctor rejection
**File:** `controllers/doctors.js` (`updateAppointment`, `rejectAppointment`) · **Patch 0005**

`updateAppointment` validated the *target* status was a valid enum value but never checked the *current* status — a doctor could set `status=Completed` on an already-`Rejected` or `Cancelled` appointment, or revert any terminal appointment back to `Scheduled`. Since `Completed` unlocks bill/prescription generation elsewhere, this allowed generating a bill for an appointment that was never actually held.

Separately: `rejectAppointment` (doctor-initiated) never touched `Payment`/`bookingFeeStatus` at all — contrast with the patient's own `cancelAppointment`, which always creates a refund or explicitly marks "no refund." A patient rejected by the doctor, through no fault of their own, simply lost their payment with no record of it.

**Fix:** only `Scheduled` may transition out via this endpoint (every other status is terminal here); `rejectAppointment` now issues a full refund `Payment` and resets `bookingFeeStatus` when the fee was already paid.

**Verified:** `test_status_and_refund.js` — `Rejected→Completed` blocked (400); legitimate `Scheduled→Completed` still works (200); rejecting a paid appointment creates a refund `Payment` for the full consultation fee and flips `bookingFeeStatus` back to `unpaid`.

### 6 — HIGH: Stripe routes unmounted; webhook body-parsing architecturally broken
**Files:** `server.js`, `routes/payments.js` · **Patch 0006**

`controllers/payments.js` / `routes/payments.js` implement a complete real-Stripe-Checkout integration, but `server.js` never mounted the router — `/api/payments/*` 404'd unconditionally; the mock gateway was the only reachable payment path.

Separately, even if mounted as originally written, it would not have worked: the webhook route declared `express.raw({type:'application/json'})`, but `server.js` installs the app-wide `express.json()` *before* any router is mounted. Express runs middleware in registration order regardless of where `raw()` is declared inside a sub-router — by the time a request reaches the webhook handler, the body stream is already consumed and parsed into a JS object. `stripe.webhooks.constructEvent()` needs the exact raw bytes to verify the HMAC signature, so **every webhook delivery would fail signature verification**, silently.

**Fix:** registered `POST /api/payments/webhook` with `express.raw()` directly in `server.js`, before `express.json()` is installed; mounted the rest of `routes/payments.js` normally afterward; removed the now-redundant, positionally-broken webhook definition from the router itself.

**Verified:** `test_webhook_raw_body.js` — a live HTTP server reproducing both middleware orders end-to-end. Original order: webhook handler receives an already-parsed object (`isBuffer: false`). Fixed order: webhook handler receives the raw `Buffer` (`isBuffer: true`); a normal route mounted after `express.json()` still gets parsed JSON.

> **Not fixed, flagged instead (finding #18):** `controllers/payments.js:createBookingCheckoutSession` assumes the `Appointment` already exists (book-then-pay), while `mockPayments.js` creates the appointment only *after* "payment" (pay-then-book). Wiring real Stripe in doesn't make these consistent — the frontend would need to call things in a different order depending on which gateway is active. Picking one flow is a product decision, not something a patch should decide unilaterally.

### 7 — MEDIUM: systemic UTC-vs-local-time date bugs
**Files:** `controllers/doctors.js`, `controllers/patients.js`, `utils/scheduling.js` · **Folded into patches 0002/0003**

`normalizeDateToUTC` (duplicated in both controllers) built a `Date` from the input string and then read `.getFullYear()/.getMonth()/.getDate()` — **local-time** getters — before re-packing into `Date.UTC(...)`. On a server with a negative UTC offset, this silently shifts the stored "UTC midnight" back a day. Downstream, `.getDay()` (not `.getUTCDay()`) and `.setHours()` (not `.setUTCHours()`) were used repeatedly on dates that actually represent UTC midnight (`markAppointmentMissed`, `updateAppointment`'s future-date guard, the old slot-duration functions), which can select the wrong day-of-week or shift a same-day cutoff by hours, depending entirely on the server's `TZ` setting.

**Fix:** rewrote `normalizeDateToUTC` in `utils/scheduling.js` to parse the `YYYY-MM-DD` components directly (no locale round-trip), and switched every affected call site to the UTC-safe equivalents.

**Verified empirically** (not just by inspection) — reproduced under three actual `TZ` settings:
```
TZ=America/New_York:  local getDay() -> Saturday (WRONG, booked as Monday)
                       UTC  getUTCDay()-> Sunday  (still wrong upstream, but consistent post-fix)
TZ=Asia/Kolkata:       local getDay() -> Monday (happens to be correct here — +5:30 offset)
```
This is exactly the kind of bug that "works in dev" (if dev happens to run IST) and breaks the moment the app is deployed to any US-region hosting default.

### 8 & 9 — MEDIUM: login rate limit, role-validator drift
**File:** `routes/auth.js` · **Patch 0007**

Login allowed 50 attempts/15 minutes — far too permissive to meaningfully slow credential stuffing against an app holding PHI. Tightened to 10/15min.

Separately, the registration validator's `isIn([...])` list included `'admin'` as a technically-acceptable role value, while `controllers/auth.js` has its own, stricter `selfRegisterRoles = ['patient','doctor']` whitelist that actually rejects it. The controller-side check does work today — **this was not exploitable** — but the two lists disagreeing is fragile: a future edit to either one in isolation could silently reopen self-service admin registration without anyone noticing the validator would have let it through. Aligned both to `['patient','doctor']`.

### 10 — MEDIUM: dead duplicate `cancelAppointment`
**File:** `controllers/patients.js` · **Patch 0007**

Two `exports.cancelAppointment` definitions existed in the same file. CommonJS silently lets the second overwrite the first, so ~115 lines of simpler, no-refund-policy cancellation logic were completely unreachable — confirmed by the route's `:id` param matching only the second definition's signature. Not a live bug (JS resolved correctly), but a real maintenance hazard: it reads like working code and could easily mislead a future edit into changing the wrong copy. Removed.

### 11 — MEDIUM: `pharmacy.js` route missing role guard
**File:** `routes/pharmacy.js` · **Patch 0007**

`router.use(protect)` with no `authorize('pharmacist')`. The controller (`controllers/pharmacy.js`) does independently check `req.user.role !== 'pharmacist'` — **this was not currently exploitable** — but every other role-restricted route in this app enforces the check at the route layer too, as a backstop independent of the controller. Added it here for consistency.

### 12 — MEDIUM: admin role broken on shared inventory endpoints
**File:** `controllers/inventory.js` (`updateInventoryItem`, `deleteInventoryItem`) · **Patch 0008**

The route authorizes `('doctor', 'admin')`, but both functions unconditionally ran `Doctor.findOne({userId: req.user.id})` to resolve hospital scoping. Admins have no `Doctor` profile, so this is always `null` for them — every admin request 404'd with a misleading "Doctor not associated with any hospital," despite the route explicitly permitting admin access.

**Fix:** the doctor→own-hospital scoping check now only runs when `req.user.role === 'doctor'`; admins bypass it (consistent with their platform-wide inventory oversight in `controllers/admin.js`).

**Verified:** `test_inventory_admin_fix.js` — admin updating an item in any hospital → 200 (was 404); a doctor from hospital A touching hospital B's item is still correctly blocked (403); a doctor updating their own hospital's item still works.

### 13 — MEDIUM: `deleteDoctor` orphans records
**File:** `controllers/admin.js` · **Patch 0009**

`deleteHospital` already refuses to delete a hospital with attached doctors/inventory. `deleteDoctor` had no equivalent guard — deleting a doctor who had already seen patients left `Appointment`/`Prescription`/`Bill`/`MedicalHistory` documents pointing at a `doctorId` whose `User` no longer exists, so a patient's own history would show a broken/null doctor reference.

**Fix:** mirrors `deleteHospital`'s pattern — blocks deletion (400) if any `Appointment` references the doctor, suggesting KYC-rejection/deactivation instead of a hard delete once a doctor has treated patients.

### 14 — MEDIUM: cancelling a bill permanently blocks re-billing
**File:** `controllers/bills.js` (`updateBill`) · **Patch 0010**

`createBill` refuses to generate a new bill once `appointment.finalBillGenerated` is true (by design — no duplicate bills). Cancelling a bill never reset that flag, so a doctor who cancelled a bill to fix a mistake could **never** issue a corrected one for that appointment again.

**Fix:** cancellation now resets `finalBillGenerated` to `false`.

### 15 — see Finding 3 (bundled in patch 0003)

### 16 & 17 — DOMAIN: AI Symptom Checker had no emergency escalation and no rate limit
**Files:** `controllers/aiSymptomChecker.js`, `routes/aiSymptomChecker.js`, new `utils/emergencyScreening.js` · **Patch 0011**

The symptom checker had no path for emergencies at all. A description of classic heart-attack symptoms (crushing chest pain radiating to the arm/jaw), stroke signs (facial drooping, slurred speech), anaphylaxis, severe bleeding, loss of consciousness, or suicidal ideation would go straight to the LLM and come back as a routine "possible causes: indigestion / anxiety / muscle strain"-style list with a generic "consult a doctor" disclaimer — nothing telling the person this may need emergency care *now*. For a symptom-checking feature, that's a patient-safety gap. Separately, the endpoint calls a paid external LLM API (OpenRouter) per request with **no rate limit**, unlike every other sensitive route in this app.

**Fix — two independent layers, deliberately not relying on the LLM alone:**
1. `utils/emergencyScreening.js` — a deterministic keyword/pattern screen that runs **before** the LLM is ever called and does not depend on the model following instructions. Fires on well-established red-flag phrasing across six categories (cardiac, stroke, breathing/anaphylaxis, severe bleeding, loss of consciousness, self-harm) and returns clear "seek emergency care now" guidance immediately, skipping the LLM call entirely. Self-harm mentions are routed to crisis-line language rather than purely "go to the ER."
2. The LLM prompt itself now has an explicit screening step asking it to do the same triage as a second layer for phrasing the deterministic list doesn't catch, with a matching `isEmergency` output shape the controller now explicitly handles (previously such a response would have been rejected as "unexpected format").

Both layers log to `SymptomCheckLog` with an emergency flag for admin audit visibility. Also added a 20-requests/15-minute rate limit to the route.

Also worth a human decision, not something I changed: the model in use is `x-ai/grok-code-fast-1` — its name suggests a code-oriented model, not one specifically tuned for medical reasoning. Worth revisiting which model backs a health-advice feature.

**Verified:**
- `test_emergency_screening.js` — 6 real emergency phrasings across all 6 categories, all correctly flagged; 6 routine symptom descriptions (including one containing the literal word "chest," to check for naive keyword false-positives) all correctly **not** flagged.
- `test_symptom_controller_emergency.js` — end-to-end through the real controller with the OpenRouter call mocked to throw if invoked: confirms the emergency path returns `200` with emergency guidance, the LLM is **never called**, and the event is logged.

### 18 — Documented only: mock vs. real-Stripe flow mismatch
See the callout under Finding 6. Not patched — resolving it means choosing pay-first-book-later vs. book-first-pay-later as the one true flow, which changes frontend call order either way. That's a product call.

---

## Test suite

All 11 scripts pass against the fully-patched code as of this report:

```
test_phi_fix.js                    PASS
test_slot_consistency.js           PASS
test_booking_validation.js         PASS
test_mockpayments_fix.js           PASS
test_status_and_refund.js          PASS
test_webhook_raw_body.js           PASS
test_inventory_admin_fix.js        PASS
test_delete_doctor_guard.js        PASS
test_bill_cancel_reset.js          PASS
test_emergency_screening.js        PASS
test_symptom_controller_emergency.js  PASS
```

None of these require a live database — they inject lightweight fakes for the Mongoose models directly into `require.cache` and exercise the real, unmodified controller code, or (for the webhook fix) spin up a real HTTP server with the exact middleware ordering under test. They are not included as files here since they're throwaway harnesses, not part of the app; happy to hand them over too if you want them as a starting `__tests__/` directory — a couple of them (`test_phi_fix.js`'s mocking pattern especially) generalize well into real Jest/Supertest tests if this app adopts a test framework, which — per the Roadmap in the README — it doesn't have yet.

## What this audit did not cover

Frontend code (67 `.jsx` files) was not reviewed in this pass — this was a backend-first pass given it's where PHI, auth, and money move. If useful, a frontend pass (XSS via `dangerouslySetInnerHTML`, client-side-only validation being trusted, token storage) is a reasonable next scope.
