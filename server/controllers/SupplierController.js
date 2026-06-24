const Supplier = require('../models/Supplier');
const User = require('../models/User');
const buildBootstrap = require('../services/bootstrapService');
const { addNotification } = require('../services/notificationService');

const updateVerification = async (req, res, next) => {
  try {
    if (!['Platform Administration', 'Verification Team'].includes(req.user.adminClass)) {
      return res.status(403).json({ message: 'Only Verification Team or Platform Administration can verify suppliers.' });
    }

    const status = req.body.status === 'Approved' ? 'Approved' : 'Rejected';
    const supplier = await Supplier.findOne({ id: req.params.id });

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found.' });
    }

    await Supplier.updateOne(
      { id: req.params.id },
      {
        verified: status,
        documents: (supplier.documents || []).map(doc => ({
          ...(doc.toObject?.() || doc),
          status
        }))
      }
    );
    if (supplier.userId) {
      await User.updateOne(
        { id: supplier.userId },
        { verified: status === 'Approved' }
      );
    }
    await addNotification({
      title: status === 'Approved' ? 'Supplier documents approved!' : 'Supplier documents rejected',
      description: `${supplier.name} status changed to ${status}.`,
      type: status === 'Approved' ? 'success' : 'warning',
      role: 'admin'
    });

    res.json(await buildBootstrap(req.user));
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const ownedSupplier = await Supplier.findOne({ userId: req.user.id });
    if (req.user.role === 'supplier' && ownedSupplier?.verified !== 'Approved' && ownedSupplier?.verified !== 'Verified') {
      return res.status(403).json({ message: `Supplier functions are locked while verification status is ${ownedSupplier?.verified || 'Pending'}.` });
    }

    const supplierId = req.user.role === 'supplier'
      ? ownedSupplier?.id
      : req.body.id || ownedSupplier?.id || 'sup-2';

    if (!supplierId) {
      return res.status(404).json({ message: 'Supplier profile not found.' });
    }

    const { id, userId, verified, documents, ...profileUpdates } = req.body;
    const updates = req.user.role === 'admin'
      ? { ...req.body }
      : profileUpdates;

    await Supplier.updateOne({ id: supplierId }, updates);
    res.json(await buildBootstrap(req.user));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateVerification,
  updateProfile
};
