const mongoose = require('mongoose');

const affiliateApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  website: { type: String, required: true },
  audienceSize: { type: String, required: true },
  commission: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

affiliateApplicationSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await require('bcryptjs').hash(this.password, 10);
  next();
});

module.exports = mongoose.model('AffiliateApplication', affiliateApplicationSchema);
