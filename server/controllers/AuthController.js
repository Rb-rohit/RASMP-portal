const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Supplier = require('../models/Supplier');
const buildBootstrap = require('../services/bootstrapService');
const signToken = require('../utils/token');
const { nextId, userId } = require('../utils/id');
const { initialsFor, publicUser } = require('../utils/user');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      user: publicUser(user),
      token: signToken(user),
      ...(await buildBootstrap(user))
    });
  } catch (error) {
    next(error);
  }
};

const checkEmail = async (req, res, next) => {
  try {
    const exists = await User.exists({ email: String(req.body.email || '').toLowerCase() });
    res.json({ exists: Boolean(exists) });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const incoming = req.body.user || req.body;
    const { name, email, phone, password, role } = incoming;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: 'Name, email, phone, password, and role are required.' });
    }

    if (!['customer', 'supplier'].includes(role)) {
      return res.status(400).json({ message: 'Only customer and supplier registration is allowed.' });
    }

    const normalizedEmail = String(email).toLowerCase();
    const exists = await User.exists({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }

    const supplierDocuments = Array.isArray(incoming.supplierDocuments)
      ? incoming.supplierDocuments
      : [];

    if (role === 'supplier') {
      const hasBusinessLicense = supplierDocuments.some(doc => doc.documentType === 'businessLicense');
      const hasIdentityProof = supplierDocuments.some(doc => doc.documentType === 'identityProof');

      if (!hasBusinessLicense || !hasIdentityProof) {
        return res.status(400).json({ message: 'Business license and identity proof are required for supplier registration.' });
      }
    }

    const user = await User.create({
      ...incoming,
      id: userId(),
      email: normalizedEmail,
      initials: incoming.initials || initialsFor(name),
      verified: true,
      joinedDate: incoming.joinedDate || new Date().toISOString().split('T')[0],
      passwordHash: await bcrypt.hash(password, 10)
    });

    if (role === 'supplier') {
      await Supplier.create({
        id: await nextId(Supplier, 'sup'),
        userId: user.id,
        name: incoming.companyName || name,
        initials: user.initials,
        location: incoming.location || 'Mumbai, MH',
        rating: 4.5,
        qualityRating: 4.6,
        priceLevel: 'INR INR',
        matchPercent: 85,
        tags: ['OEM Partner', 'New Enrolled'],
        experienceYears: 2,
        deliveryDays: 14,
        type: 'Manufacturer',
        verified: 'Pending',
        documents: supplierDocuments.map(doc => ({
          documentType: doc.documentType,
          label: doc.label,
          fileName: doc.fileName,
          mimeType: doc.mimeType,
          size: doc.size,
          dataUrl: doc.dataUrl,
          uploadedAt: doc.uploadedAt || new Date().toISOString(),
          status: 'Pending'
        })),
        joinedDate: user.joinedDate,
        gstin: incoming.gstin,
        primaryCategories: incoming.primaryCategories || 'Industrial parts',
        certifications: 'ISO 9001 registration submitted'
      });
    }

    res.status(201).json({
      user: publicUser(user),
      token: signToken(user),
      ...(await buildBootstrap(user))
    });
  } catch (error) {
    next(error);
  }
};

const session = async (req, res, next) => {
  try {
    res.json({
      user: publicUser(req.user),
      ...(await buildBootstrap(req.user))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  checkEmail,
  register,
  session
};
