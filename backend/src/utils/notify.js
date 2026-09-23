const prisma = require('../config/prisma');

const createNotification = async ({ type, title, message, link, audienceRole }) => {
  try {
    return await prisma.notification.create({ data: { type, title, message, link: link || null, audienceRole: audienceRole || null } });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
};

module.exports = { createNotification };
