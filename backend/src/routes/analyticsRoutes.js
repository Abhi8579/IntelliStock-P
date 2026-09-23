const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', ctrl.getDashboard);
router.get('/sales', ctrl.getSalesAnalytics);
router.get('/inventory', ctrl.getInventoryAnalytics);
router.get('/business', ctrl.getBusinessAnalytics);

module.exports = router;
