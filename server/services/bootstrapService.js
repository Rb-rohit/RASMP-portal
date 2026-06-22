const Requirement = require('../models/Requirement');
const Supplier = require('../models/Supplier');
const Quotation = require('../models/Quotation');
const Notification = require('../models/Notification');
const BusinessRule = require('../models/BusinessRule');

const sortByNewestMongoDoc = { createdAt: -1 };

const buildBootstrap = async () => {
  const [requirements, suppliers, quotations, notifications, businessRules] = await Promise.all([
    Requirement.find().sort(sortByNewestMongoDoc).lean(),
    Supplier.find().sort({ id: 1 }).lean(),
    Quotation.find().sort(sortByNewestMongoDoc).lean(),
    Notification.find().sort(sortByNewestMongoDoc).lean(),
    BusinessRule.find().sort({ id: 1 }).lean()
  ]);

  return {
    currentData: {
      requirements,
      suppliers,
      quotations,
      notifications,
      businessRules
    }
  };
};

module.exports = buildBootstrap;
