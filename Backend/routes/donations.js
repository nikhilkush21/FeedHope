const router = require('express').Router();
const c = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/',       protect, authorize('donor', 'admin'), c.create);
router.get('/my',      protect, authorize('donor', 'admin'), c.getMyDonations);
router.get('/nearby',  protect, c.getNearby);
router.get('/all',     protect, authorize('admin'), c.getAll);
router.get('/:id',     protect, c.getOne);
router.put('/:id',     protect, c.update);
router.delete('/:id',  protect, c.remove);

module.exports = router;
