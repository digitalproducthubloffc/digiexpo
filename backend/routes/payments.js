const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const requestIp = require('request-ip');
const rateLimit = require('express-rate-limit');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const { verifyToken, optionalVerifyToken } = require('./auth');
const User = require('../models/User');
const sendEmail = require('../utils/mailer');

// Init Razorpay (keys should be in .env)
const razorpay = new Razorpay({
  key_id: (process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_123').trim().replace(/['"]/g, ''),
  key_secret: (process.env.RAZORPAY_KEY_SECRET || 'mock_secret_abc').trim().replace(/['"]/g, '')
});

router.get('/test-keys', (req, res) => {
  const kid = process.env.RAZORPAY_KEY_ID || '';
  const ksec = process.env.RAZORPAY_KEY_SECRET || '';
  res.json({
    message: "Key Check",
    key_id: kid ? `${kid.substring(0, 15)}... length:${kid.length}` : 'MISSING',
    key_secret: ksec ? `${ksec.substring(0, 3)}... length:${ksec.length}` : 'MISSING'
  });
});

// Rate limiting for payment attempts (Security: Prevent abuse)
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased for testing and active buyers
  message: { message: 'Too many payment attempts from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 1. CREATE ORDER (Initiation)
 */
router.post('/orders', optionalVerifyToken, paymentLimiter, async (req, res) => {
  const { productId, currency = 'INR', guestInfo } = req.body;
  const clientIp = requestIp.getClientIp(req);
  let userId = req.user ? req.user.userId : null;

  try {
    // 1. SECURE AMOUNT CALCULATION
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    
    // Calculate final price strictly on backend
    let finalAmount = 0;
    if (currency === 'INR') {
      finalAmount = product.priceINR > 0 ? product.priceINR : product.realPrice * 85;
    } else {
      finalAmount = product.realPrice; // USD
    }

    // If guest and no userId, check if email already exists or create temp account
    if (!userId && guestInfo) {
      let user = await User.findOne({ email: guestInfo.email });
      if (!user) {
        // Create new user (verified immediately since OTP is disabled)
        user = new User({
          name: guestInfo.name,
          email: guestInfo.email,
          password: guestInfo.password || 'TemporaryPassword123!', // Should be changed or set by guest
          phone: guestInfo.phone,
          isVerified: true
        });
        await user.save();
      }
      userId = user._id;
    }

    if (!userId) return res.status(400).json({ message: 'User ID or Guest Info required.' });

    // Handle 0 cost product
    if (finalAmount === 0) {
      const transaction = new Transaction({
        orderId: `free_${Date.now()}`,
        userId,
        productId,
        amount: 0,
        status: 'completed',
        ip: clientIp,
        logs: [{ event: 'Free Purchase Completed' }]
      });
      await transaction.save();
      
      // Add product to user's purchased list
      await User.findByIdAndUpdate(userId, { $addToSet: { purchasedProducts: productId } });

      return res.json({ id: transaction.orderId, free: true });
    }


    const options = {
      amount: Math.round(finalAmount * 100), // convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: { productId, userId, ip: clientIp }
    };

    const order = await razorpay.orders.create(options);

    // Initial log entry (Audit Trail)
    const transaction = new Transaction({
      orderId: order.id,
      userId,
      productId,
      amount: finalAmount,
      currency,
      ip: clientIp,
      logs: [{ event: 'Created Razorpay Order', metadata: { orderId: order.id, notes: options.notes } }]
    });

    await transaction.save();

    res.json(order);
  } catch (err) {
    console.error('Payment order creation failed:', err);
    const errorMessage = err.message || err.description || err.error?.description || 'Order initiation failed. Check keys/network.';
    res.status(500).json({ message: errorMessage });
  }
});

/**
 * 2. VERIFY SIGNATURE (Client Side confirmation)
 */
router.post('/verify', optionalVerifyToken, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const clientIp = requestIp.getClientIp(req);

  try {


    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", (process.env.RAZORPAY_KEY_SECRET || 'mock_secret_abc').trim())
      .update(sign.toString())
      .digest("hex");

    const transaction = await Transaction.findOne({ orderId: razorpay_order_id });

    if (razorpay_signature === expectedSign) {
      // SUCCESS (Auto delivery logic should be triggered here)
      if (transaction) {
        transaction.status = 'completed';
        transaction.paymentId = razorpay_payment_id;
        transaction.signature = razorpay_signature;
        transaction.logs.push({ event: 'Signature Verified - Success', metadata: { ip: clientIp } });
        await transaction.save();

        // RECORD PURCHASE & SEND EMAIL
        if (transaction.userId && transaction.productId) {
          const user = await User.findById(transaction.userId);
          const product = await Product.findById(transaction.productId);

          if (user && product) {
            await User.findByIdAndUpdate(transaction.userId, { 
              $addToSet: { purchasedProducts: transaction.productId } 
            });

            // SEND DOWNLOAD EMAIL
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const downloadUrl = product.fileUrl.startsWith('http') ? product.fileUrl : `${frontendUrl}/dashboard`;
            await sendEmail(user.email, `Order Confirmed: ${product.title}`, `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                <div style="background: #7c3aed; padding: 40px; text-align: center; color: white;">
                  <h1 style="margin: 0; font-size: 24px;">Order Confirmed!</h1>
                  <p style="opacity: 0.9;">Your digital archive is ready for download.</p>
                </div>
                <div style="padding: 40px;">
                  <h2 style="color: #0f172a; margin-top: 0;">Hi ${user.name},</h2>
                  <p style="color: #64748b; line-height: 1.6;">Thank you for your purchase from <strong>DigiExpo</strong>. Your payment was successful, and your professional digital assets are now available.</p>
                  
                  <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 30px 0;">
                    <strong style="color: #1e293b; display: block; margin-bottom: 5px;">${product.title}</strong>
                    <span style="color: #94a3b8; font-size: 0.9rem;">Order ID: ${transaction.orderId}</span>
                  </div>

                  <a href="${downloadUrl}" style="display: block; background: #7c3aed; color: white; text-align: center; padding: 18px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 1.1rem; box-shadow: 0 10px 20px rgba(124, 58, 237, 0.2);">Download Files Now</a>
                  
                  <p style="margin-top: 30px; font-size: 0.85rem; color: #94a3b8; text-align: center;">You can also access this file anytime from your <a href="${frontendUrl}/dashboard" style="color: #7c3aed;">User Dashboard</a>.</p>
                </div>
              </div>
            `);
          }
        }
      }
      return res.status(200).json({ message: "Transaction successful" });
    } else {
      // FAILED/TAMPERED
      if (transaction) {
        transaction.status = 'failed';
        transaction.logs.push({ event: 'Signature Mismatch - Possible tampering', metadata: { ip: clientIp } });
        await transaction.save();
      }
      return res.status(400).json({ message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error during verification" });
  }
});

/**
 * 3. WEBHOOK (Auto payment confirmation - server to server)
 */
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_mock_secret';
  const signature = req.headers['x-razorpay-signature'];

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature === expectedSignature) {
      const event = req.body.event;
      if (event === 'payment.captured' || event === 'order.paid') {
        const orderId = req.body.payload.payment? req.body.payload.payment.entity.order_id : req.body.payload.order.entity.id;
        await Transaction.findOneAndUpdate(
          { orderId },
          { status: 'completed', signature: 'webhook_confirmed' },
          { new: true }
        );
        // Dispatch fulfillment (email download link etc.) in real production apps
      }
      res.json({ status: 'ok' });
    } else {
      res.status(403).json({ status: 'unauthorized' });
    }
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).end();
  }
});

module.exports = router;
