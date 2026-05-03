const express = require('express');
const router = express.Router();
const Support = require('../models/Support');
const { optionalVerifyToken } = require('./auth');

// Create support ticket
router.post('/', optionalVerifyToken, async (req, res) => {
  const { name, email, problem } = req.body;
  const userId = req.user ? req.user.userId : null;

  try {
    const ticket = new Support({
      user: userId,
      name,
      email,
      problem
    });
    await ticket.save();
    res.status(201).json({ message: 'Support request received. We will get back to you soon.', ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
