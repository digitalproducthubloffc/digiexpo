const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const { verifyToken } = require('./auth');
const fs = require('fs/promises');
const { uploadFile } = require('../utils/cloudinary');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

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
router.post('/profile', verifyToken, verifySeller, upload.fields([
  { name: 'bannerFile', maxCount: 1 },
  { name: 'profileImageFile', maxCount: 1 }
]), async (req, res) => {
  const { bio, portfolioUrl, socialLinks } = req.body;
  let parsedSocialLinks;
  try {
    parsedSocialLinks = socialLinks ? JSON.parse(socialLinks) : undefined;
  } catch(e) {}

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.files && req.files.bannerFile && req.files.bannerFile[0]) {
      const bFile = req.files.bannerFile[0];
      const bannerUrl = await uploadFile(bFile.path, 'seller_profiles');
      user.sellerProfile.bannerUrl = bannerUrl;
      await fs.unlink(bFile.path).catch(console.error);
    }

    if (req.files && req.files.profileImageFile && req.files.profileImageFile[0]) {
      const pFile = req.files.profileImageFile[0];
      const profileImageUrl = await uploadFile(pFile.path, 'seller_profiles');
      user.sellerProfile.profileImage = profileImageUrl;
      await fs.unlink(pFile.path).catch(console.error);
    }

    if (bio !== undefined) user.sellerProfile.bio = bio;
    if (portfolioUrl !== undefined) user.sellerProfile.portfolioUrl = portfolioUrl;
    if (parsedSocialLinks) {
      if (parsedSocialLinks.instagram !== undefined) user.sellerProfile.socialLinks.instagram = parsedSocialLinks.instagram;
      if (parsedSocialLinks.facebook !== undefined) user.sellerProfile.socialLinks.facebook = parsedSocialLinks.facebook;
      if (parsedSocialLinks.twitter !== undefined) user.sellerProfile.socialLinks.twitter = parsedSocialLinks.twitter;
      if (parsedSocialLinks.website !== undefined) user.sellerProfile.socialLinks.website = parsedSocialLinks.website;
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
    const seller = await User.findById(sellerId).select('name role sellerProfile createdAt followers following');
    
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
        followersCount: seller.followers ? seller.followers.length : 0,
        followingCount: seller.following ? seller.following.length : 0,
        ...sellerObj
      },
      products
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
