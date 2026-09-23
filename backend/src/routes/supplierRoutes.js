const router = require('express').Router();
const ctrl = require('../controllers/supplierController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { validateSupplier } = require('../validators/supplierValidator');

router.use(protect);
router.get('/', ctrl.getSuppliers);
router.get('/:id', ctrl.getSupplier);
router.post('/', authorize('ADMIN', 'MANAGER'), validate(validateSupplier), ctrl.createSupplier);
router.put('/:id', authorize('ADMIN', 'MANAGER'), ctrl.updateSupplier);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), ctrl.deleteSupplier);

module.exports = router;
