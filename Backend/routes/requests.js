const router = require('express').Router();
const c = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');

router.post('/',                      protect, authorize('ngo', 'admin'), c.create);
router.get('/ngo',                    protect, authorize('ngo', 'admin'), c.getNgoRequests);
router.get('/all',                    protect, authorize('admin'), c.getAll);
router.get('/donation/:donationId',   protect, c.getDonationRequests);
router.put('/:id/status',             protect, authorize('donor', 'ngo', 'admin'), c.updateStatus);

module.exports = router;
