const router = require('express').Router();
const ctrl = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getNotifications);
router.put('/:id/read', ctrl.markAsRead);
router.put('/read-all', ctrl.markAllAsRead);

module.exports = router;
