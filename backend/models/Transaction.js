const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  paymentId: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'flagged'], default: 'pending' },
  amount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  sellerEarnings: { type: Number, default: 0 },
  affiliateEarnings: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  country: { type: String },
  ip: { type: String },
  method: { type: String }, // e.g., 'upi', 'card', 'netbanking'
  logs: [{
    timestamp: { type: Date, default: Date.now },
    event: String,
    metadata: mongoose.Schema.Types.Mixed
  }],
  signature: String,
  attempts: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
