const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.post('/', authorize('admin', 'investigator'), caseController.createCase);
router.get('/', caseController.getCases);
router.get('/:id', caseController.getCaseById);
router.put('/:id', authorize('admin', 'investigator'), caseController.updateCase);
router.post('/:id/close', authorize('admin', 'investigator'), caseController.closeCase);

module.exports = router;