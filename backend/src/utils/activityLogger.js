const prisma = require('../config/prisma');

// Records an audit trail entry. Never throws - logging must not break the main flow.
const logActivity = async ({ userId, action, entity, entityId, description }) => {
  try {
    await prisma.activityLog.create({
      data: { userId: userId || null, action, entity, entityId: entityId || null, description },
    });
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
};

module.exports = { logActivity };
