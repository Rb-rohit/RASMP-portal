const Notification = require('../models/Notification');
const { nextId } = require('../utils/id');

const addNotification = async (notification) => {
  if (!notification || (!notification.role && !notification.roles)) {
    throw new Error('Notification must include a role or roles array.');
  }

  const notifications = Array.isArray(notification.roles)
    ? notification.roles.map(role => ({
        ...notification,
        role,
        roles: undefined
      }))
    : [notification];

  const createdNotifications = [];

  for (const item of notifications) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        createdNotifications.push(await Notification.create({
          id: await nextId(Notification, 'notif'),
          time: 'Just now',
          read: false,
          ...item
        }));
        break;
      } catch (error) {
        if (error.code !== 11000 || attempt === 2) {
          throw error;
        }
      }
    }
  }

  return createdNotifications.length === 1 ? createdNotifications[0] : createdNotifications;
};

module.exports = {
  addNotification
};
