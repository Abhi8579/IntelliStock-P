const router = require('express').Router();
const ctrl = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.get('/', ctrl.getInventory);
router.get('/transactions', ctrl.getTransactions);
router.post('/adjust', authorize('ADMIN', 'MANAGER'), ctrl.adjustStock);

module.exports = router;
