const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = (roles = []) => async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'rasmp-dev-secret');
    const user = await User.findOne({ id: payload.id });

    if (!user) {
      return res.status(401).json({ message: 'Session user no longer exists.' });
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
      return res.status(403).json({ message: 'This role cannot perform that action.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired session token.' });
  }
};

module.exports = auth;
