const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const User = require('../models/User');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const { verifyAdmin, verifyToken } = require('./auth');
const multer = require('multer');
const path = require('path');

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Admin add product with file upload
router.post('/', verifyAdmin, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
  { name: 'digitalFile', maxCount: 1 }
]), async (req, res) => {
  const { title, description, originalPrice, realPrice, category, details, tags } = req.body;
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
    
    let image = "";
    if (req.files['thumbnail']) {
      image = baseUrl + req.files['thumbnail'][0].filename;
    }

    let images = [];
    if (req.files['gallery']) {
      images = req.files['gallery'].map(file => baseUrl + file.filename);
    }

    let fileUrl = "";
    if (req.files['digitalFile']) {
      fileUrl = baseUrl + req.files['digitalFile'][0].filename;
    }

    const product = new Product({
      title,
      description,
      details: typeof details === 'string' ? JSON.parse(details) : details,
      tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
      image,
      images,
      fileUrl,
      originalPrice: Number(originalPrice),
      realPrice: Number(realPrice),
      category
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a product (Admin only)
router.patch('/:id', verifyAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a product (Admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new review
router.post('/:id/reviews', verifyToken, async (req, res) => {
  const { rating, comment, name } = req.body;
  const productId = req.params.id;
  
  // Use a default valid ObjectId mapping for admins writing testing reviews
  const userId = req.user.userId || (req.user.admin ? '000000000000000000000abc' : null);
  
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!userId) {
       return res.status(401).json({ message: 'User ID missing in token' });
    }

    // VERIFY PURCHASE
    const user = await User.findById(userId);
    if (!user || !user.purchasedProducts.includes(productId)) {
       // Allow admins to review for testing
       if (!req.user.admin) {
         return res.status(403).json({ message: 'You must purchase this product to leave a review.' });
       }
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user && r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const { mediaUrl, mediaType } = req.body;

    const review = {
      name: name || user?.name || 'Anonymous User',
      rating: Number(rating),
      comment,
      user: userId,
      mediaUrl,
      mediaType
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
