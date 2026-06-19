const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'admin', 'seller'], required: true },
  text: { type: String },
  mediaUrl: { type: String },   // URL to uploaded image/video
  mediaType: { type: String, enum: ['image', 'video'] },
  readByAdmin: { type: Boolean, default: false },
  readByUser: { type: Boolean, default: false },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If chatting with a specific seller
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  messages: [messageSchema],
  status: { type: String, enum: ['open', 'closed'], default: 'open' },
  lastMessage: { type: String },
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
