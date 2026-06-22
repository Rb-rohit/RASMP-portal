const Notification = require('../models/Notification');
const { nextId } = require('../utils/id');

const addNotification = async (notification) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await Notification.create({
        id: await nextId(Notification, 'notif'),
        time: 'Just now',
        read: false,
        ...notification
      });
    } catch (error) {
      if (error.code !== 11000 || attempt === 2) {
        throw error;
      }
    }
  }
};

module.exports = {
  addNotification
};
