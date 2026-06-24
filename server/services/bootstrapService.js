const Requirement = require('../models/Requirement');
const Supplier = require('../models/Supplier');
const Quotation = require('../models/Quotation');
const Notification = require('../models/Notification');
const BusinessRule = require('../models/BusinessRule');
const Category = require('../models/Category');
const User = require('../models/User');

const sortByNewestMongoDoc = { createdAt: -1 };

const publicRequirementStatuses = ['Open', 'Under review'];

const buildBootstrap = async (user = null) => {
  const role = user?.role;

  if (!role) {
    const [businessRules, categories] = await Promise.all([
      BusinessRule.find().sort({ id: 1 }).lean(),
      Category.find({ status: 'Active' }).sort({ name: 1 }).lean()
    ]);
    return {
      currentData: {
        requirements: [],
        suppliers: [],
        quotations: [],
        notifications: [],
        businessRules,
        categories,
        users: []
      }
    };
  }

  const supplierProfile = role === 'supplier'
    ? await Supplier.findOne({ userId: user.id }).lean()
    : null;

  const requirementFilter = role === 'customer'
    ? { customerId: user.id }
    : role === 'supplier'
      ? { status: { $in: publicRequirementStatuses } }
      : {};

  const quotationFilter = role === 'customer'
    ? { requirementId: { $in: (await Requirement.find({ customerId: user.id }).distinct('id')) } }
    : role === 'supplier'
      ? { supplierId: supplierProfile?.id || '__none__' }
      : {};

  const supplierFilter = role === 'supplier'
    ? { id: supplierProfile?.id || '__none__' }
    : {};

  const notificationFilter = role
    ? { role }
    : {};

  const [requirements, suppliers, quotations, notifications, businessRules, categories, users] = await Promise.all([
    Requirement.find(requirementFilter).sort(sortByNewestMongoDoc).lean(),
    Supplier.find(supplierFilter).sort({ id: 1 }).lean(),
    Quotation.find(quotationFilter).sort(sortByNewestMongoDoc).lean(),
    Notification.find(notificationFilter).sort(sortByNewestMongoDoc).lean(),
    BusinessRule.find().sort({ id: 1 }).lean(),
    Category.find(role === 'admin' ? {} : { status: 'Active' }).sort({ name: 1 }).lean(),
    role === 'admin'
      ? User.find().select('-passwordHash').sort({ role: 1, name: 1 }).lean()
      : []
  ]);

  return {
    currentData: {
      requirements,
      suppliers,
      quotations,
      notifications,
      businessRules,
      categories,
      users
    }
  };
};

module.exports = buildBootstrap;
