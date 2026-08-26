const router = require('express').Router();
const c = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const admin = [protect, authorize('admin')];

router.get('/stats',                   ...admin, c.getStats);
router.get('/users',                   ...admin, c.getAllUsers);
router.put('/users/:id/verify',        ...admin, c.verifyUser);
router.put('/users/:id/reject',        ...admin, c.rejectUser);
router.put('/users/:id/toggle-active', ...admin, c.toggleActive);
router.delete('/users/:id',            ...admin, c.deleteUser);
router.post('/assign-request',         ...admin, c.assignRequest);
router.delete('/requests/clear-all',   ...admin, c.clearAllRequests);

module.exports = router;
