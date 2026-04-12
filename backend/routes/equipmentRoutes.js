const express = require('express');
const { getEquipments, getEquipmentById, createEquipment, updateEquipmentStatus, deleteEquipment, updateEquipment, getDashboardStats, bulkCreateEquipments, createMaintenanceLog, getMaintenanceLogs, getAnalyticsStats, bulkDeleteEquipments, bulkUpdateEquipmentStatus } = require('../controllers/equipmentController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getEquipments).post(protect, admin, createEquipment);
router.route('/bulk').post(protect, admin, bulkCreateEquipments).delete(protect, admin, bulkDeleteEquipments);
router.route('/bulk-status').put(protect, admin, bulkUpdateEquipmentStatus);
router.route('/dashboard').get(protect, admin, getDashboardStats);
router.route('/analytics').get(protect, admin, getAnalyticsStats);
router.route('/:id').get(protect, getEquipmentById).delete(protect, admin, deleteEquipment).put(protect, admin, updateEquipment);
router.route('/:id/status').put(protect, admin, updateEquipmentStatus);
router.route('/:id/maintenance').post(protect, admin, createMaintenanceLog).get(protect, admin, getMaintenanceLogs);

module.exports = router;
