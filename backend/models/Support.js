const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  problem: { type: String, required: true },
  status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Support', supportSchema);
