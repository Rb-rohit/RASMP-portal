const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Requirement = require('../models/Requirement');
const Supplier = require('../models/Supplier');
const Quotation = require('../models/Quotation');
const Notification = require('../models/Notification');
const BusinessRule = require('../models/BusinessRule');
const seed = require('../data/seed');

const insertMissingById = async (Model, items) => {
  const existingIds = new Set((await Model.find({}).select('id').lean()).map(item => item.id));
  const missing = items.filter(item => !existingIds.has(item.id));

  if (missing.length > 0) {
    await Model.insertMany(missing);
  }

  return missing.length;
};

const seedDatabase = async () => {
  const users = await Promise.all(seed.demoUsers.map(async (user) => {
    const { password, ...safeUser } = user;
    return {
      ...safeUser,
      email: safeUser.email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10)
    };
  }));

  const existingEmails = new Set((await User.find({}).select('email').lean()).map(user => user.email));
  const missingUsers = users.filter(user => !existingEmails.has(user.email));

  const insertedCounts = await Promise.all([
    missingUsers.length > 0 ? User.insertMany(missingUsers).then(result => result.length) : 0,
    insertMissingById(Requirement, seed.requirements),
    insertMissingById(Supplier, seed.suppliers),
    insertMissingById(Quotation, seed.quotations),
    insertMissingById(Notification, seed.notifications),
    insertMissingById(BusinessRule, seed.businessRules)
  ]);

  const totalInserted = insertedCounts.reduce((sum, count) => sum + count, 0);
  if (totalInserted > 0) {
    console.log(`MongoDB seeded with ${totalInserted} missing RASMP demo records`);
  }
};

module.exports = seedDatabase;
