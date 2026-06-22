const initialsFor = (name = '') => (
  name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'US'
);

const publicUser = (user) => {
  if (!user) return null;
  const source = user.toObject ? user.toObject() : user;
  const { passwordHash, password, _id, ...safeUser } = source;
  return safeUser;
};

module.exports = {
  initialsFor,
  publicUser
};
