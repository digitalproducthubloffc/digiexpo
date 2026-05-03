const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  author: { type: String, default: 'Admin' },
  content: { type: String, required: true },
  thumbnail: { type: String }, // Main image
  media: [{ 
    url: String, 
    type: { type: String, enum: ['image', 'video'] } 
  }], // Additional images/videos
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', BlogSchema);
