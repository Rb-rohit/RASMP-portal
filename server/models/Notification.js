const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    id: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },
    title: { 
      type: String, 
      required: true 
    },
    description: String,
    time: { 
      type: String, 
      default: 'Just now' 
    },
    type: { 
      type: String, 
      default: 'info' 
    },
    read: { 
      type: Boolean, 
      default: false 
    },
    role: {
      type: String,
      enum: ['customer', 'supplier', 'admin'],
      required: true
    },
    userId: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
