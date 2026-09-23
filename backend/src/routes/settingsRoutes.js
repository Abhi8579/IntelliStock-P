const router = require('express').Router();
const ctrl = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.get('/', ctrl.getSettings);
router.put('/', authorize('ADMIN'), ctrl.updateSettings);
router.put('/profile', ctrl.updateProfile);
router.put('/password', ctrl.changePassword);

module.exports = router;
