const express = require('express');
const router = express.Router();
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const { verifyToken } = require('./auth');
const axios = require('axios'); // For RazorpayX API call

// Middleware to ensure user is an admin
const verifyAdmin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

// Get all withdrawals
router.get('/withdrawals', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().populate('sellerId', 'name email').sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve withdrawal
router.post('/withdrawals/:id/approve', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
    if (withdrawal.status !== 'pending') return res.status(400).json({ message: 'Withdrawal is already processed' });

    // Handle automated payout for UPI
    if (withdrawal.method === 'upi') {
      try {
        const RAZORPAY_X_KEY = process.env.RAZORPAY_KEY_ID;
        const RAZORPAY_X_SECRET = process.env.RAZORPAY_KEY_SECRET;
        const authHeader = `Basic ${Buffer.from(`${RAZORPAY_X_KEY}:${RAZORPAY_X_SECRET}`).toString('base64')}`;

        // Create a contact first (simplified for MVP, ideally should check if contact exists)
        const contactRes = await axios.post('https://api.razorpay.com/v1/contacts', {
          name: req.user.userId, // use seller ID as contact name
          type: 'vendor',
          reference_id: withdrawal.sellerId.toString()
        }, { headers: { Authorization: authHeader } });

        const contactId = contactRes.data.id;

        // Create a fund account for the contact
        const fundRes = await axios.post('https://api.razorpay.com/v1/fund_accounts', {
          contact_id: contactId,
          account_type: 'vpa',
          vpa: { address: withdrawal.details }
        }, { headers: { Authorization: authHeader } });

        const fundAccountId = fundRes.data.id;

        // Create payout
        const payoutRes = await axios.post('https://api.razorpay.com/v1/payouts', {
          account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER || '2323230058866173', // Must set this in .env
          fund_account_id: fundAccountId,
          amount: Math.round(withdrawal.amount * 100), // amount in paise
          currency: 'INR',
          mode: 'UPI',
          purpose: 'payout',
          reference_id: withdrawal._id.toString()
        }, { headers: { Authorization: authHeader } });

      } catch (payoutErr) {
        console.error('RazorpayX Payout Error:', payoutErr.response ? payoutErr.response.data : payoutErr.message);
        return res.status(500).json({ message: 'Failed to process automated payout via RazorpayX. Please check your Razorpay balance and credentials.', error: payoutErr.response ? payoutErr.response.data : payoutErr.message });
      }
    }

    // For Bank Transfer (international), or if UPI payout succeeds
    withdrawal.status = 'approved';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    res.json({ message: 'Withdrawal approved successfully', withdrawal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reject withdrawal
router.post('/withdrawals/:id/reject', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
    if (withdrawal.status !== 'pending') return res.status(400).json({ message: 'Withdrawal is already processed' });

    // Refund the amount to seller's balance
    const user = await User.findById(withdrawal.sellerId);
    if (user) {
      user.sellerProfile.balance += withdrawal.amount;
      await user.save();
    }

    withdrawal.status = 'rejected';
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    res.json({ message: 'Withdrawal rejected and balance refunded', withdrawal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
