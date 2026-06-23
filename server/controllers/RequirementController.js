const Requirement = require('../models/Requirement');
const Quotation = require('../models/Quotation');
const Supplier = require('../models/Supplier');
const buildBootstrap = require('../services/bootstrapService');
const { addNotification } = require('../services/notificationService');
const { nextId } = require('../utils/id');
const { getMatchedSuppliers } = require('../utils/matching');

const createRequirement = async (req, res, next) => {
  try {
    const newReq = req.body;

    if (!newReq.title || !newReq.subcategory || !newReq.quantity) {
      return res.status(400).json({ message: 'Title, subcategory, and quantity are required.' });
    }

    const suppliers = await Supplier.find({ verified: { $in: ['Approved', 'Verified'] } }).lean();
    const matchedSuppliers = getMatchedSuppliers(newReq, suppliers);

    const added = await Requirement.create({
      ...newReq,
      id: await nextId(Requirement, 'req'),
      createdAt: new Date().toISOString().split('T')[0],
      quotationsCount: 0,
      matchPercentage: matchedSuppliers[0]?.match.score || 0,
      matchedSupplierIds: matchedSuppliers.map(item => item.supplier.id),
      status: newReq.status || 'Open',
      customerId: req.user.id
    });

    await addNotification({
      title: 'Requirement Matches Generated!',
      description: `New request "${added.title}" matched with ${matchedSuppliers.length} relevant suppliers by category, location, industry, and supplier type.`,
      type: 'success',
      role: 'customer'
    });
    await addNotification({
      title: 'New live requirement matched!',
      description: `New request matching category uploaded: "${added.title}". Submit proposal bids.`,
      type: 'info',
      role: 'supplier'
    });
    await addNotification({
      title: 'New requirement audit review',
      description: `Customer ${req.user.name} uploaded a requirement RFP of size ${added.quantity}.`,
      type: 'neutral',
      role: 'admin'
    });

    res.status(201).json(await buildBootstrap(req.user));
  } catch (error) {
    next(error);
  }
};

const updateRequirement = async (req, res, next) => {
  try {
    const requirement = await Requirement.findOne({ id: req.params.id });

    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found.' });
    }

    if (req.user.role === 'customer' && requirement.customerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own requirements.' });
    }

    const allowedFields = [
      'title',
      'category',
      'industry',
      'preferredSupplierType',
      'subcategory',
      'quantity',
      'budgetRange',
      'requiredBy',
      'priority',
      'location',
      'specifications',
      'status'
    ];
    const allowedStatuses = ['Open', 'Under review', 'Supplier selected', 'Cancelled', 'Closed'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        requirement[field] = req.body[field];
      }
    });

    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid requirement status.' });
    }

    if (!requirement.title || !requirement.subcategory || !requirement.quantity) {
      return res.status(400).json({ message: 'Title, subcategory, and quantity are required.' });
    }

    await requirement.save();

    await addNotification({
      title: 'Requirement updated',
      description: `"${requirement.title}" is now marked ${requirement.status}.`,
      type: requirement.status === 'Cancelled' ? 'warning' : 'info',
      role: 'customer'
    });

    res.json(await buildBootstrap(req.user));
  } catch (error) {
    next(error);
  }
};

const deleteRequirement = async (req, res, next) => {
  try {
    const requirement = await Requirement.findOne({ id: req.params.id });

    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found.' });
    }

    if (req.user.role === 'customer' && requirement.customerId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own requirements.' });
    }

    await Promise.all([
      Requirement.deleteOne({ id: req.params.id }),
      Quotation.deleteMany({ requirementId: req.params.id })
    ]);

    res.json(await buildBootstrap(req.user));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequirement,
  updateRequirement,
  deleteRequirement
};
