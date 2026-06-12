const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { verifyAdmin } = require('./auth');

// Get all transactions (Admin only)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'name email') // Populate user details
      .populate('productId', 'title type') // Populate product details
      .sort({ createdAt: -1 }); // Newest first

    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ message: 'Internal server error while fetching transactions.' });
  }
});

module.exports = router;
