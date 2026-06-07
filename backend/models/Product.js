const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  mediaUrl: { type: String },
  mediaType: { type: String, enum: ['image', 'video'] },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  details: { type: [String], default: [] }, // List of features/what's inside
  image: { type: String, default: 'https://via.placeholder.com/300x300?text=No+Image', }, // Main image URL (optional)

  images: [{ type: String }], // Optional gallery
  originalPrice: { type: Number, required: true }, 
  realPrice: { type: Number, required: true }, // Discounted price (USD)
  priceINR: { type: Number, default: 0 }, // Regional pricing for India
  category: { type: String, required: true },
  fileUrl: { type: String }, // For digital downloads
  fileType: { type: String, default: 'PDF' },
  fileSize: { type: String, default: '5.2 MB' },
  externalPurchaseLink: { type: String, default: '' }, // External platform link (Gumroad, etc.)
  postPurchase: {
    headline: { type: String },
    message: { type: String },
    linkUrl: { type: String },
    linkText: { type: String },
    imageUrl: { type: String }
  },
  rating: { type: Number, default: 5 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  tags: [String],
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
