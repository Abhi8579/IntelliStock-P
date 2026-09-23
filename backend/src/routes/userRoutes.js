const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { validateCreateUser } = require('../validators/authValidator');

router.use(protect, authorize('ADMIN'));

router.get('/', ctrl.getUsers);
router.post('/', validate(validateCreateUser), ctrl.createUser);
router.put('/:id/status', ctrl.setUserStatus);

module.exports = router;
