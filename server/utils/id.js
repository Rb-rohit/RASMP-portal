const nextId = async (Model, prefix) => {
  const items = await Model.find({ id: new RegExp(`^${prefix}-`) }).select('id').lean();
  const max = items.reduce((currentMax, item) => {
    const numeric = Number(String(item.id || '').replace(`${prefix}-`, ''));
    return Number.isFinite(numeric) ? Math.max(currentMax, numeric) : currentMax;
  }, 0);

  return `${prefix}-${max + 1}`;
};

const userId = () => `user-${Date.now()}`;

module.exports = {
  nextId,
  userId
};
