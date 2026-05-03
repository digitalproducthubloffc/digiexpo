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
  image: { type: String, required: true }, // Main image URL
  images: [{ type: String }], // Optional gallery
  originalPrice: { type: Number, required: true }, 
  realPrice: { type: Number, required: true }, // Discounted price
  category: { type: String, required: true },
  fileUrl: { type: String }, // For digital downloads
  fileType: { type: String, default: 'PDF' },
  fileSize: { type: String, default: '5.2 MB' },
  rating: { type: Number, default: 5 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  tags: [String],
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
