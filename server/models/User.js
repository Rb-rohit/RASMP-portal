const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['customer', 'supplier', 'admin'],
            required: true
        },
        adminClass: {
            type: String,
            enum: ['Platform Administration', 'Verification Team'],
            default: undefined
        },
        verified: {
            type: Boolean,
            default: false
        },
        accountStatus: {
            type: String,
            enum: ['Active', 'Suspended'],
            default: 'Active'
        },
        suspensionReason: String,
        joinedDate: {
            type: String
        },
        initials: {
            type: String,
            default: 'US'
        },
        location: String,
        address: String,
        buyerType: String,
        organization: String,
        preferredContact: String,
        companyName: String,
        gstin: String,
        primaryCategories: String
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('User', userSchema);
