const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Requirement = require('../models/Requirement');
const Quotation = require('../models/Quotation');
const Category = require('../models/Category');
const buildBootstrap = require('../services/bootstrapService');
const { addNotification } = require('../services/notificationService');
const { nextId } = require('../utils/id');

const isPlatformAdmin = (user) => user.role === 'admin' && user.adminClass === 'Platform Administration';
const isVerificationAdmin = (user) => user.role === 'admin' && user.adminClass === 'Verification Team';
const canVerifyUsers = (user) => isPlatformAdmin(user) || isVerificationAdmin(user);

const requirePlatformAdmin = (req, res) => {
  if (!isPlatformAdmin(req.user)) {
    res.status(403).json({ message: 'Only Platform Administration can perform this action.' });
    return false;
  }
  return true;
};

const verifyUser = async (req, res, next) => {
  try {
    if (!canVerifyUsers(req.user)) {
      return res.status(403).json({ message: 'Only Verification Team or Platform Administration can verify users.' });
    }

    const user = await User.findOneAndUpdate(
      {
        id: req.params.id,
        role: { $in: ['customer', 'supplier'] }
      },
      { verified: req.body.verified !== false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Customer or supplier user not found.' });
    }

    await addNotification({
      title: user.verified ? 'User verified' : 'User verification removed',
      description: `${user.name} (${user.role}) verification is now ${user.verified ? 'approved' : 'pending'}.`,
      type: user.verified ? 'success' : 'warning',
      role: 'admin'
    });

    res.json(await buildBootstrap(req.user));
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    if (!requirePlatformAdmin(req, res)) return;

    const status = req.body.status === 'Suspended' ? 'Suspended' : 'Active';
    const reason = String(req.body.reason || '').trim();

    const user = await User.findOneAndUpdate(
      { id: req.params.id },
      {
        accountStatus: status,
        suspensionReason: status === 'Suspended' ? reason || 'Fraud risk flagged by admin.' : ''
      },
      { returnDocument: 'after' }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'supplier') {
      await Supplier.updateOne(
        { userId: user.id },
        { verified: status === 'Suspended' ? 'Rejected' : 'Pending' }
      );
    }

    await addNotification({
      title: status === 'Suspended' ? 'User suspended' : 'User reactivated',
      description: `${user.name} was marked ${status}${reason ? `: ${reason}` : '.'}`,
      type: status === 'Suspended' ? 'alert' : 'success',
      role: 'admin'
    });

    res.json(await buildBootstrap(req.user));
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    if (!requirePlatformAdmin(req, res)) return;

    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const exists = await Category.exists({ name: new RegExp(`^${name}$`, 'i') });
    if (exists) {
      return res.status(409).json({ message: 'Category already exists.' });
    }

    await Category.create({
      id: await nextId(Category, 'cat'),
      name,
      description: req.body.description || '',
      status: req.body.status === 'Suspended' ? 'Suspended' : 'Active'
    });

    res.status(201).json(await buildBootstrap(req.user));
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    if (!requirePlatformAdmin(req, res)) return;

    const category = await Category.findOneAndUpdate(
      { id: req.params.id },
      {
        ...(req.body.name !== undefined ? { name: req.body.name } : {}),
        ...(req.body.description !== undefined ? { description: req.body.description } : {}),
        ...(req.body.status !== undefined ? { status: req.body.status === 'Suspended' ? 'Suspended' : 'Active' } : {})
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.json(await buildBootstrap(req.user));
  } catch (error) {
    next(error);
  }
};

const generateReport = async (req, res, next) => {
  try {
    if (!requirePlatformAdmin(req, res)) return;

    const [users, suspendedUsers, suppliers, pendingSuppliers, requirements, openRequirements, quotations, categories] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ accountStatus: 'Suspended' }),
      Supplier.countDocuments(),
      Supplier.countDocuments({ verified: { $in: ['Pending', 'Re-verify', 'Overdue'] } }),
      Requirement.countDocuments(),
      Requirement.countDocuments({ status: { $in: ['Open', 'Under review'] } }),
      Quotation.countDocuments(),
      Category.countDocuments({ status: 'Active' })
    ]);

    const report = {
      generatedAt: new Date().toISOString(),
      totalUsers: users,
      suspendedUsers,
      totalSuppliers: suppliers,
      pendingSuppliers,
      totalRequirements: requirements,
      openRequirements,
      totalQuotations: quotations,
      activeCategories: categories
    };

    res.json({
      report,
      ...(await buildBootstrap(req.user))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyUser,
  updateUserStatus,
  createCategory,
  updateCategory,
  generateReport
};
