const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// Admins see everything; everyone else only sees notifications with no
// specific audience (audienceRole = null) or ones targeted at their own role.
const visibilityFilter = (role) =>
  role === 'ADMIN' ? {} : { OR: [{ audienceRole: null }, { audienceRole: role }] };

const getNotifications = asyncHandler(async (req, res) => {
  const where = visibilityFilter(req.user.role);
  const notifications = await prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });
  const unreadCount = await prisma.notification.count({ where: { ...where, isRead: false } });
  sendSuccess(res, 200, 'Notifications fetched.', notifications, { unreadCount });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
  sendSuccess(res, 200, 'Notification marked as read.', notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const where = { ...visibilityFilter(req.user.role), isRead: false };
  await prisma.notification.updateMany({ where, data: { isRead: true } });
  sendSuccess(res, 200, 'All notifications marked as read.');
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
