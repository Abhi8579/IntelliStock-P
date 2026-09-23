const router = require('express').Router();
const ctrl = require('../controllers/purchaseController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { validatePurchase } = require('../validators/purchaseValidator');

router.use(protect);
router.get('/', ctrl.getPurchases);
router.get('/:id', ctrl.getPurchase);
router.post('/', authorize('ADMIN', 'MANAGER'), validate(validatePurchase), ctrl.createPurchase);
router.post('/:id/receive', authorize('ADMIN', 'MANAGER'), ctrl.receivePurchase);
router.post('/:id/cancel', authorize('ADMIN', 'MANAGER'), ctrl.cancelPurchase);

module.exports = router;
