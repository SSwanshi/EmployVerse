const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  subscriptionPlan: {
    type: String,
    enum: ['Monthly Premium Plan', 'Annual Premium Plan'],
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'Stripe'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Completed'
  },
  twoFactorAuth: {
    type: String,
    default: 'Completed (OTP / Bank Verification)'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Receipt', receiptSchema);
