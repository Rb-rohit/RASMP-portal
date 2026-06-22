const Notification = require('../models/Notification');
const buildBootstrap = require('../services/bootstrapService');

const clearByRole = async (req, res, next) => {
  try {
    const role = req.params.role;

    if (req.user.role !== 'admin' && req.user.role !== role) {
      return res.status(403).json({ message: 'You cannot clear another role notification stream.' });
    }

    await Notification.deleteMany({ role });
    res.json(await buildBootstrap());
  } catch (error) {
    next(error);
  }
};

module.exports = {
  clearByRole
};
