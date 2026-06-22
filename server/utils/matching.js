const normalize = (value = '') => String(value).toLowerCase().trim();

const includesAny = (source, target) => {
  const cleanSource = normalize(source);
  const cleanTarget = normalize(target);
  if (!cleanSource || !cleanTarget) return false;
  return cleanSource.includes(cleanTarget) || cleanTarget.includes(cleanSource);
};

const cityToken = (location = '') => normalize(location).split(',')[0].trim();

const calculateSupplierMatch = (requirement = {}, supplier = {}) => {
  let score = 0;
  const reasons = [];

  if (includesAny(supplier.primaryCategories, requirement.category)) {
    score += 35;
    reasons.push('category');
  }

  if (includesAny(supplier.primaryCategories, requirement.industry || requirement.category)) {
    score += 25;
    reasons.push('industry');
  }

  if (cityToken(requirement.location) && cityToken(supplier.location) && cityToken(requirement.location) === cityToken(supplier.location)) {
    score += 20;
    reasons.push('location');
  }

  if (requirement.preferredSupplierType && includesAny(supplier.type, requirement.preferredSupplierType)) {
    score += 20;
    reasons.push('supplier type');
  } else if (!requirement.preferredSupplierType) {
    score += 10;
  }

  if (supplier.verified === 'Approved' || supplier.verified === 'Verified') {
    score += 10;
  }

  return {
    score: Math.min(score, 100),
    reasons
  };
};

const getMatchedSuppliers = (requirement, suppliers, minimumScore = 45) => (
  suppliers
    .map(supplier => ({
      supplier,
      match: calculateSupplierMatch(requirement, supplier)
    }))
    .filter(item => item.match.score >= minimumScore)
    .sort((a, b) => b.match.score - a.match.score)
);

module.exports = {
  calculateSupplierMatch,
  getMatchedSuppliers
};
