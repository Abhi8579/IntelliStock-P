const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25 } = req.query;
  const take = Math.min(Number(limit) || 25, 100);
  const skip = (Math.max(Number(page), 1) - 1) * take;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.activityLog.count(),
  ]);

  sendSuccess(res, 200, 'Activity logs fetched.', logs, { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) });
});

module.exports = { getActivityLogs };
