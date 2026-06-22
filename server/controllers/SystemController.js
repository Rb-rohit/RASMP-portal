const User = require('../models/User');
const Requirement = require('../models/Requirement');
const Supplier = require('../models/Supplier');
const Quotation = require('../models/Quotation');
const buildBootstrap = require('../services/bootstrapService');

const health = async (req, res, next) => {
  try {
    const [users, requirements, suppliers, quotations] = await Promise.all([
      User.countDocuments(),
      Requirement.countDocuments(),
      Supplier.countDocuments(),
      Quotation.countDocuments()
    ]);

    res.json({
      ok: true,
      service: 'RASMP API',
      database: 'MongoDB',
      counts: {
        users,
        requirements,
        suppliers,
        quotations
      }
    });
  } catch (error) {
    next(error);
  }
};

const bootstrap = async (req, res, next) => {
  try {
    res.json(await buildBootstrap());
  } catch (error) {
    next(error);
  }
};

module.exports = {
  health,
  bootstrap
};
