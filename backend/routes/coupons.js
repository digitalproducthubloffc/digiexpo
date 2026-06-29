const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { verifyToken, verifyAdmin, optionalVerifyToken } = require('./auth');

// Create a new coupon (Admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryHours, maxUses } = req.body;
    
    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + Number(expiryHours));

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists.' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      expiryDate,
      maxUses: maxUses ? Number(maxUses) : null,
      createdBy: req.user.userId
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all coupons (Admin only)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a coupon (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Validate a coupon (Public/Checkout)
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required.' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code.' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'This coupon is no longer active.' });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'This coupon has expired.' });
    }

    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      return res.status(400).json({ message: 'This coupon has reached its usage limit.' });
    }

    res.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
