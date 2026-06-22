const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema(
  {
    id: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    category: { 
      type: String, 
      trim: true 
    },
    industry: {
      type: String,
      trim: true
    },
    preferredSupplierType: {
      type: String,
      trim: true
    },
    subcategory: { 
      type: String, 
      required: true, 
      trim: true 
    },
    quantity: { 
      type: String, 
      required: true, 
      trim: true 
    },
    budgetRange: { 
      type: String, 
      default: 'Negotiable' 
    },
    requiredBy: String,
    priority: { 
      type: String, 
      default: 'Normal' 
    },
    location: { 
      type: String, 
      default: 'Anywhere' 
    },
    specifications: { 
      type: String, 
      default: 'None specified.' 
    },
    status: { 
      type: String, 
      default: 'Open' 
    },
    createdAt: String,
    matchPercentage: { 
      type: Number, 
      default: 70 
    },
    quotationsCount: { 
      type: Number, 
      default: 0 
    },
    customerId: { 
      type: String, 
      required: true 
    },
    matchedSupplierIds: [{ type: String }],
    selectedSupplierId: String,
    selectedSupplierName: String
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('Requirement', requirementSchema);
