const router = require('express').Router();
const ctrl = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { validateCustomer } = require('../validators/customerValidator');

router.use(protect);
router.get('/', ctrl.getCustomers);
router.get('/:id', ctrl.getCustomer);
router.post('/', authorize('ADMIN', 'MANAGER'), validate(validateCustomer), ctrl.createCustomer);
router.put('/:id', authorize('ADMIN', 'MANAGER'), ctrl.updateCustomer);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), ctrl.deleteCustomer);

module.exports = router;
