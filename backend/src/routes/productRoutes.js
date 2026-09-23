const router = require('express').Router();
const ctrl = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { validateProduct } = require('../validators/productValidator');

router.use(protect);
router.get('/', ctrl.getProducts);
router.get('/:id', ctrl.getProduct);
router.post('/', authorize('ADMIN', 'MANAGER'), validate(validateProduct), ctrl.createProduct);
router.put('/:id', authorize('ADMIN', 'MANAGER'), ctrl.updateProduct);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), ctrl.deleteProduct);

module.exports = router;
