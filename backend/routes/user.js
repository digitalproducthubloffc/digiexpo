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

// Toggle Follow / Unfollow
router.post('/toggle-follow/:id', verifyToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) return res.status(404).json({ message: 'User to follow not found' });

    const isFollowing = currentUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(targetUserId);
      targetUser.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
    }

    await currentUser.save();
    await targetUser.save();

    res.json({ message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully', isFollowing: !isFollowing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Followers
router.get('/followers/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'name sellerProfile.profileImage');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Following
router.get('/following/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'name sellerProfile.profileImage');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
