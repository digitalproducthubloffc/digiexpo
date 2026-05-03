const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const User = require('../models/User');
const Visitor = require('../models/Visitor');
const { verifyAdmin } = require('./auth');

// Get overview stats
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalSales = await Transaction.countDocuments({ status: 'completed' });
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalViews = await Visitor.countDocuments();

    res.json({
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalUsers,
      totalProducts,
      totalViews
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sales and Views by Country
router.get('/country-stats', verifyAdmin, async (req, res) => {
  try {
    const salesByCountry = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$country', sales: { $sum: 1 }, revenue: { $sum: '$amount' } } }
    ]);

    const viewsByCountry = await Visitor.aggregate([
      { $group: { _id: '$country', views: { $sum: 1 } } }
    ]);

    res.json({ salesByCountry, viewsByCountry });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
