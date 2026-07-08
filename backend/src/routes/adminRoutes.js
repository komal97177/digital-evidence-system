const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/stats', adminController.getSystemStats);

module.exports = router;