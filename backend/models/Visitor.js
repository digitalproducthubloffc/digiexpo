const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip: { type: String },
  country: { type: String, default: 'Unknown' },
  userAgent: { type: String },
  path: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Visitor', visitorSchema);
