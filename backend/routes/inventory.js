const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getHospitalInventory,
  getMyHospitalInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
  searchMedicines,
} = require('../controllers/inventory');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes for doctors and admins
router.get('/my-hospital', authorize('doctor', 'admin'), getMyHospitalInventory);
router.get('/low-stock', authorize('doctor', 'admin'), getLowStockItems);
router.get('/search', authorize('doctor'), searchMedicines);
router.post('/', authorize('doctor', 'admin'), addInventoryItem);
router.put('/:itemId', authorize('doctor', 'admin'), updateInventoryItem);
router.delete('/:itemId', authorize('doctor', 'admin'), deleteInventoryItem);

// Get inventory for specific hospital (admin only)
router.get('/:hospitalId', authorize('admin'), getHospitalInventory);

module.exports = router;
