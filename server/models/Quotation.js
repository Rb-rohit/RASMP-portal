const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema(
  {
    id: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },
    requirementId: { 
      type: String, 
      required: true 
    },
    requirementTitle: String,
    supplierId: { 
      type: String, 
      required: true 
    },
    supplierName: String,
    supplierInitials: String,
    price: { 
      type: String, 
      required: true 
    },
    deliveryTime: { 
      type: String, 
      required: true 
    },
    specifications: String,
    matchScore: {
      type: Number,
      default: 0
    },
    supplierDeclarationAccepted: {
      type: Boolean,
      default: false
    },
    attachments: [
      {
        attachmentType: {
          type: String,
          enum: ['catalog', 'brochure', 'image', 'quotationPdf'],
          required: true
        },
        label: String,
        fileName: String,
        mimeType: String,
        size: Number,
        dataUrl: String,
        uploadedAt: String
      }
    ],
    messages: [
      {
        senderRole: {
          type: String,
          enum: ['customer', 'supplier', 'admin'],
          required: true
        },
        senderId: {
          type: String,
          required: true
        },
        senderName: String,
        text: {
          type: String,
          required: true,
          trim: true
        },
        sentAt: String
      }
    ],
    status: { 
      type: String, 
      default: 'New' 
    },
    submittedAt: String
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('Quotation', quotationSchema);
