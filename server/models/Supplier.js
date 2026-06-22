const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    id: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },
    userId: { 
      type: String, 
      trim: true 
    },
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    initials: { 
      type: String, 
      default: 'SP' 
    },
    location: String,
    rating: { 
      type: Number, 
      default: 4.5 
    },
    qualityRating: { 
      type: Number, 
      default: 4.5 
    },
    priceLevel: String,
    matchPercent: { 
      type: Number, 
      default: 85 
    },
    tags: [{ type: String }],
    experienceYears: { 
      type: Number, 
      default: 1 
    },
    deliveryDays: { 
      type: Number, 
      default: 14 
    },
    type: { 
      type: String, 
      default: 'Manufacturer' 
    },
    verified: {
      type: String,
      enum: ['Approved', 'Pending', 'Rejected', 'Verified', 'Re-verify', 'Overdue'],
      default: 'Pending'
    },
    documents: [
      {
        documentType: {
          type: String,
          enum: ['businessLicense', 'identityProof'],
          required: true
        },
        label: String,
        fileName: String,
        mimeType: String,
        size: Number,
        dataUrl: String,
        uploadedAt: String,
        status: {
          type: String,
          enum: ['Pending', 'Approved', 'Rejected'],
          default: 'Pending'
        }
      }
    ],
    joinedDate: String,
    gstin: String,
    primaryCategories: String,
    certifications: String
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('Supplier', supplierSchema);
