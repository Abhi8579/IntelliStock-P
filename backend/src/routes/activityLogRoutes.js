const router = require('express').Router();
const ctrl = require('../controllers/activityLogController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);
router.get('/', authorize('ADMIN', 'MANAGER'), ctrl.getActivityLogs);

module.exports = router;
