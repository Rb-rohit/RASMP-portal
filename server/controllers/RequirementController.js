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
      status: matchedSuppliers.length > 0 ? 'Matched' : (newReq.status || 'Open'),
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

    res.status(201).json(await buildBootstrap());
  } catch (error) {
    next(error);
  }
};

const deleteRequirement = async (req, res, next) => {
  try {
    await Promise.all([
      Requirement.deleteOne({ id: req.params.id }),
      Quotation.deleteMany({ requirementId: req.params.id })
    ]);

    res.json(await buildBootstrap());
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequirement,
  deleteRequirement
};
