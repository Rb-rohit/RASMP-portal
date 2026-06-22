const mongoose = require('mongoose');

const businessRuleSchema = new mongoose.Schema(
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
    icon: String
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.model('BusinessRule', businessRuleSchema);
