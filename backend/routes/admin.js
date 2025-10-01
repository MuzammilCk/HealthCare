const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getKycRequests,
  updateKycStatus,
  getAllDoctors,
  deleteDoctor,
  getAllHospitals,
  createHospital,
  updateHospital,
  deleteHospital,
  getAllInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = require('../controllers/admin');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// KYC Management
router.get('/kyc-requests', getKycRequests);
router.put('/kyc-requests/:doctorId', updateKycStatus);

// Doctor Management
router.get('/doctors', getAllDoctors);
router.delete('/doctors/:userId', deleteDoctor);

// Hospital Management
router.get('/hospitals', getAllHospitals);
router.post('/hospitals', createHospital);
router.put('/hospitals/:id', updateHospital);
router.delete('/hospitals/:id', deleteHospital);

// Inventory Management
router.get('/inventory', getAllInventory);
router.post('/inventory', createInventoryItem);
router.put('/inventory/:id', updateInventoryItem);
router.delete('/inventory/:id', deleteInventoryItem);

module.exports = router;
