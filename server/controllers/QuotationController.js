const Supplier = require('../models/Supplier');
const Quotation = require('../models/Quotation');
const Requirement = require('../models/Requirement');
const buildBootstrap = require('../services/bootstrapService');
const { addNotification } = require('../services/notificationService');
const { nextId } = require('../utils/id');
const { calculateSupplierMatch } = require('../utils/matching');

const createQuotation = async (req, res, next) => {
  try {
    const { requirementId, requirementTitle, price, deliveryTime, specifications } = req.body;
    const attachments = Array.isArray(req.body.attachments) ? req.body.attachments : [];

    if (!requirementId || !price || !deliveryTime) {
      return res.status(400).json({ message: 'Requirement, price, and delivery time are required.' });
    }

    if (!attachments.some(file => file.attachmentType === 'quotationPdf')) {
      return res.status(400).json({ message: 'Quotation PDF attachment is required.' });
    }

    const supplier = (
      await Supplier.findOne({ userId: req.user?.id }) ||
      await Supplier.findOne({ id: 'sup-2' }) ||
      await Supplier.findOne()
    );

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier profile not found.' });
    }

    if (req.user.role === 'supplier' && supplier.verified !== 'Approved' && supplier.verified !== 'Verified') {
      return res.status(403).json({ message: `Supplier quotation access is locked while verification status is ${supplier.verified || 'Pending'}.` });
    }

    const requirement = await Requirement.findOne({ id: requirementId });
    const match = requirement ? calculateSupplierMatch(requirement, supplier) : { score: supplier.matchPercent || 0 };

    await Quotation.create({
      id: await nextId(Quotation, 'q'),
      requirementId,
      requirementTitle,
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierInitials: supplier.initials,
      price,
      deliveryTime,
      specifications: specifications || 'As per baseline specifications requested.',
      matchScore: match.score,
      attachments: attachments.map(file => ({
        attachmentType: file.attachmentType,
        label: file.label,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        dataUrl: file.dataUrl,
        uploadedAt: file.uploadedAt || new Date().toISOString()
      })),
      status: 'New',
      submittedAt: new Date().toISOString().split('T')[0]
    });

    if (requirement) {
      requirement.quotationsCount = (requirement.quotationsCount || 0) + 1;

      if (requirement.status === 'Open' || requirement.status === 'Matched') {
        requirement.status = 'In review';
      }

      if (!requirement.matchedSupplierIds?.includes(supplier.id)) {
        requirement.matchedSupplierIds = [...(requirement.matchedSupplierIds || []), supplier.id];
      }

      await requirement.save();
    }

    await addNotification({
      title: `Quotation Received from ${supplier.name}!`,
      description: `${supplier.name} offered a proposal of ${price} with ${deliveryTime} delivery.`,
      type: 'info',
      role: 'customer'
    });

    res.status(201).json(await buildBootstrap());
    
  } catch (error) {
    next(error);
    console.log(error);
  }
};

const shortlistQuotation = async (req, res, next) => {
  try {
    const quote = await Quotation.findOne({ id: req.params.id });

    if (!quote) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    await Promise.all([
      Quotation.updateOne({ id: quote.id }, { status: 'Shortlisted' }),
      addNotification({
        title: 'Supplier shortlisted',
        description: `${quote.supplierName} has been shortlisted for "${quote.requirementTitle}".`,
        type: 'success',
        role: 'customer'
      })
    ]);

    res.json(await buildBootstrap());
  } catch (error) {
    next(error);
  }
};

const selectQuotation = async (req, res, next) => {
  try {
    const selectedQuote = await Quotation.findOne({ id: req.params.id });

    if (!selectedQuote) {
      return res.status(404).json({ message: 'Quotation not found.' });
    }

    await Promise.all([
      Quotation.updateOne({ id: selectedQuote.id }, { status: 'Awarded' }),
      Quotation.updateMany(
        { requirementId: selectedQuote.requirementId, id: { $ne: selectedQuote.id } },
        { status: 'Not selected' }
      ),
      Requirement.updateOne(
        { id: selectedQuote.requirementId },
        {
          status: 'Supplier selected',
          selectedSupplierId: selectedQuote.supplierId,
          selectedSupplierName: selectedQuote.supplierName
        }
      ),
      addNotification({
        title: 'Contract Bid Awarded!',
        description: `Your bid on "${selectedQuote.requirementTitle}" has been approved.`,
        type: 'success',
        role: 'supplier'
      })
    ]);

    res.json(await buildBootstrap());
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuotation,
  shortlistQuotation,
  selectQuotation
};
