const router = require('express').Router();
const ctrl = require('../controllers/saleController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { validateSale } = require('../validators/saleValidator');

router.use(protect);
router.get('/', ctrl.getSales);
router.get('/:id', ctrl.getSale);
router.post('/', validate(validateSale), ctrl.createSale);

module.exports = router;
