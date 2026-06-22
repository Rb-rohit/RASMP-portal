const jwt = require('jsonwebtoken');

const signToken = (user) => jwt.sign(
  { id: user.id, role: user.role, email: user.email },
  process.env.JWT_SECRET || 'rasmp-dev-secret',
  { expiresIn: '7d' }
);

module.exports = signToken;
