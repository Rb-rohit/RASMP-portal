const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Requirement = require('../models/Requirement');
const Supplier = require('../models/Supplier');
const Quotation = require('../models/Quotation');
const Notification = require('../models/Notification');
const BusinessRule = require('../models/BusinessRule');
const Category = require('../models/Category');
const seed = require('../data/seed');

const insertMissingById = async (Model, items) => {
  const existingIds = new Set((await Model.find({}).select('id').lean()).map(item => item.id));
  const missing = items.filter(item => !existingIds.has(item.id));

  if (missing.length > 0) {
    await Model.insertMany(missing);
  }

  return missing.length;
};

const systemAdminUsers = () => [
  {
    id: 'system-admin-platform',
    name: process.env.PLATFORM_ADMIN_NAME || 'RASMP Platform Admin',
    email: String(process.env.PLATFORM_ADMIN_EMAIL || 'admin@gmail.com').toLowerCase(),
    password: process.env.PLATFORM_ADMIN_PASSWORD || '123456789',
    role: 'admin',
    adminClass: 'Platform Administration',
    verified: true,
    accountStatus: 'Active',
    joinedDate: new Date().toISOString().split('T')[0],
    initials: 'PA'
  },
  {
    id: 'system-admin-verification',
    name: process.env.VERIFICATION_ADMIN_NAME || 'RASMP Verification Team',
    email: String(process.env.VERIFICATION_ADMIN_EMAIL || 'verify@gmail.com').toLowerCase(),
    password: process.env.VERIFICATION_ADMIN_PASSWORD || '123456789',
    role: 'admin',
    adminClass: 'Verification Team',
    verified: true,
    accountStatus: 'Active',
    joinedDate: new Date().toISOString().split('T')[0],
    initials: 'VT'
  }
];

const deleteLegacyDemoRecords = async () => {
  const legacy = seed.legacyDemoIds || {};

  await Promise.all([
    User.deleteMany({ id: { $in: legacy.userIds || [] } }),
    Requirement.deleteMany({ id: { $in: legacy.requirementIds || [] } }),
    Supplier.deleteMany({ id: { $in: legacy.supplierIds || [] } }),
    Quotation.deleteMany({ id: { $in: legacy.quotationIds || [] } }),
    Notification.deleteMany({ id: { $in: legacy.notificationIds || [] } })
  ]);
};

const seedDatabase = async () => {
  await deleteLegacyDemoRecords();

  const users = await Promise.all([...systemAdminUsers(), ...seed.demoUsers].map(async (user) => {
    const { password, ...safeUser } = user;
    return {
      ...safeUser,
      email: safeUser.email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10)
    };
  }));

  const existingEmails = new Set((await User.find({}).select('email').lean()).map(user => user.email));
  const missingUsers = users.filter(user => !existingEmails.has(user.email));

  await Promise.all(systemAdminUsers().map(admin => User.updateOne(
    { email: admin.email },
    {
      id: admin.id,
      role: 'admin',
      adminClass: admin.adminClass,
      verified: true,
      accountStatus: 'Active',
      initials: admin.initials
    }
  )));

  const insertedCounts = await Promise.all([
    missingUsers.length > 0 ? User.insertMany(missingUsers).then(result => result.length) : 0,
    insertMissingById(Requirement, seed.requirements),
    insertMissingById(Supplier, seed.suppliers),
    insertMissingById(Quotation, seed.quotations),
    insertMissingById(Notification, seed.notifications),
    insertMissingById(BusinessRule, seed.businessRules),
    insertMissingById(Category, seed.categories || [])
  ]);

  const totalInserted = insertedCounts.reduce((sum, count) => sum + count, 0);
  if (totalInserted > 0) {
    console.log(`MongoDB seeded with ${totalInserted} missing RASMP configuration records`);
  }
};

module.exports = seedDatabase;
