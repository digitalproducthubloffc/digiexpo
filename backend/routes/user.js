const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const { verifyToken } = require('./auth');

// Get User Profile + Stats
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password -otp -otpExpires')
      .populate('purchasedProducts');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const stats = {
      totalBought: user.purchasedProducts.length,
      joinedDate: user.createdAt
    };

    res.json({ user, stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get User Orders (Transaction History)
router.get('/orders', verifyToken, async (req, res) => {
  try {
    const orders = await Transaction.find({ userId: req.user.userId })
      .populate('productId', 'title image fileUrl')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upgrade to Seller Role
router.post('/become-seller', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.role !== 'admin') {
      user.role = 'seller';
    }
    
    await user.save();
    
    // We should issue a new token ideally, but we can just tell the client to re-login or update its state
    // Let's sign a new token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: user._id, role: user.role, admin: user.role === 'admin' }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '24h' });

    res.json({ message: 'Successfully upgraded to Seller', token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
