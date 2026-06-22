const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['bank', 'upi'], required: true },
  details: { type: String, required: true }, // UPI ID or Bank Details (SWIFT/Account No.)
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  processedAt: { type: Date }
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
