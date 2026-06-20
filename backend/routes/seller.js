const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const { verifyToken } = require('./auth');

// Middleware to ensure user is a seller
const verifySeller = async (req, res, next) => {
  if (req.user.admin) return next(); // Admins can bypass
  if (req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }
  next();
};

// 1. Get Seller Dashboard Analytics
router.get('/analytics', verifyToken, verifySeller, async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const { timeRange } = req.query; // '24h', '28d', '3m', 'all'

    let dateFilter = {};
    if (timeRange === '24h') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } };
    } else if (timeRange === '28d') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) } };
    } else if (timeRange === '3m') {
      dateFilter = { createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } };
    }

    // Get all transactions for this seller
    const transactions = await Transaction.find({ sellerId, status: 'completed', ...dateFilter })
      .populate('productId', 'title type');

    const totalRevenue = transactions.reduce((sum, t) => sum + (t.sellerEarnings || 0), 0);
    const totalSales = transactions.length;

    // Group by country
    const countryStats = {};
    transactions.forEach(t => {
      const country = t.country || 'Unknown';
      countryStats[country] = (countryStats[country] || 0) + 1;
    });

    const salesByCountry = Object.keys(countryStats).map(name => ({
      name,
      sales: countryStats[name]
    })).sort((a, b) => b.sales - a.sales);

    res.json({
      totalRevenue,
      totalSales,
      salesByCountry,
      transactions: transactions.slice(0, 50) // Return last 50 for table
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Add/Edit Payment Method
router.post('/payment-methods', verifyToken, verifySeller, async (req, res) => {
  const { type, details } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.sellerProfile.paymentMethods.push({ type, details, isDefault: true });
    await user.save();
    res.json({ message: 'Payment method added successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Purchase Verification (Simulated for now, Razorpay integration happens on frontend)
router.post('/verify', verifyToken, verifySeller, async (req, res) => {
  const { tier, paymentId } = req.body; 
  // tier can be 'tier1', 'tier2', 'tier3'
  try {
    // In a real scenario, you'd verify the Razorpay paymentId here.
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.sellerProfile.verificationTier = tier;
    await user.save();
    res.json({ message: `Successfully upgraded to ${tier}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Update Profile Banner / DP
router.post('/profile', verifyToken, verifySeller, async (req, res) => {
  const { bannerUrl, profileImage, bio, socialLinks } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (bannerUrl) user.sellerProfile.bannerUrl = bannerUrl;
    if (profileImage) user.sellerProfile.profileImage = profileImage;
    if (bio) user.sellerProfile.bio = bio;
    if (socialLinks) {
      if (socialLinks.instagram !== undefined) user.sellerProfile.socialLinks.instagram = socialLinks.instagram;
      if (socialLinks.facebook !== undefined) user.sellerProfile.socialLinks.facebook = socialLinks.facebook;
      if (socialLinks.twitter !== undefined) user.sellerProfile.socialLinks.twitter = socialLinks.twitter;
      if (socialLinks.website !== undefined) user.sellerProfile.socialLinks.website = socialLinks.website;
    }

    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Public Shop Profile
router.get('/shop/:id', async (req, res) => {
  try {
    const sellerId = req.params.id;
    const seller = await User.findById(sellerId).select('name role sellerProfile createdAt');
    
    if (!seller || (seller.role !== 'seller' && seller.role !== 'admin')) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const products = await Product.find({ sellerId: seller._id, inStock: true }).sort({ createdAt: -1 });
    const sellerObj = seller.sellerProfile ? seller.sellerProfile.toObject() : {};

    res.json({
      seller: {
        _id: seller._id,
        name: seller.name,
        joinedDate: seller.createdAt,
        ...sellerObj
      },
      products
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
