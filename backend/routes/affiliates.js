const express = require('express');
const router = express.Router();
const AffiliateApplication = require('../models/AffiliateApplication');
const User = require('../models/User');

// Submit new affiliate application
router.post('/apply', async (req, res) => {
  try {
    const { name, email, password, website, audienceSize } = req.body;
    
    // Check if an application already exists
    const existing = await AffiliateApplication.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Application already submitted for this email.' });
    }

    const application = new AffiliateApplication({ name, email, password, website, audienceSize });
    await application.save();

    res.status(201).json({ message: 'Application submitted successfully', application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

// Admin: Get all applications
router.get('/applications', async (req, res) => {
  try {
    // In a real app, verify admin token here
    const applications = await AffiliateApplication.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Admin: Approve application
router.post('/approve/:id', async (req, res) => {
  try {
    // In a real app, verify admin token here
    const application = await AffiliateApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = 'approved';
    await application.save();

    // Create or update the user profile for the affiliate
    // Using updateOne to avoid triggering the pre-save double hash since password is ALREADY hashed
    await User.updateOne(
      { email: application.email },
      { 
        $set: { 
          name: application.name,
          email: application.email,
          password: application.password, // Already hashed in AffiliateApplication
          role: 'affiliate',
          isVerified: true // Automatically verify approved affiliates
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    res.json({ message: 'Application approved successfully', application });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to approve application' });
  }
});

module.exports = router;
