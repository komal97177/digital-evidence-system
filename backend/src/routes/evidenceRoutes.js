const express = require('express');
const router = express.Router();
const evidenceController = require('../controllers/evidenceController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// All routes require authentication
router.use(authenticate);

// Evidence CRUD
router.post('/register', authorize('admin', 'investigator'), evidenceController.registerEvidence);
router.post('/upload', authorize('admin', 'investigator', 'custodian'), uploadSingle, evidenceController.uploadEvidence);
router.get('/', evidenceController.getEvidence);
router.get('/:id', evidenceController.getEvidenceById);
router.post('/:id/verify', evidenceController.verifyIntegrity);

module.exports = router;