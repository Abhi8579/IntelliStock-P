const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.get('/', ctrl.getCategories);
router.post('/', authorize('ADMIN', 'MANAGER'), ctrl.createCategory);

module.exports = router;
