const bcrypt = require('bcryptjs');
const User = require('../models/User');
const buildBootstrap = require('../services/bootstrapService');
const { initialsFor, publicUser } = require('../utils/user');

const updateProfile = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!req.body.name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const emailTaken = await User.exists({
      email,
      id: { $ne: req.user.id }
    });

    if (emailTaken) {
      return res.status(409).json({ message: 'That email is already linked to another RASMP account.' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { id: req.user.id },
      {
        ...req.body,
        email,
        initials: initialsFor(req.body.name)
      },
      { returnDocument: 'after', runValidators: true }
    );

    res.json({
      user: publicUser(updatedUser),
      ...(await buildBootstrap(updatedUser))
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters.' });
    }

    const matches = await bcrypt.compare(currentPassword || '', req.user.passwordHash);
    if (!matches) {
      return res.status(400).json({ message: 'Current password did not match this account.' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { id: req.user.id },
      { passwordHash: await bcrypt.hash(newPassword, 10) },
      { returnDocument: 'after' }
    );

    res.json({
      user: publicUser(updatedUser),
      ...(await buildBootstrap(updatedUser))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  changePassword
};
