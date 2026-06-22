const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust Render's proxy for accurate IP tracking & rate limiting

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Visitor Tracking Middleware
const Visitor = require('./models/Visitor');
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && !req.path.includes('/analytics')) {
    try {
      const country = req.headers['cf-ipcountry'] || req.headers['x-country'] || 'Unknown';
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      
      await Visitor.create({
        ip,
        country,
        userAgent: req.headers['user-agent'],
        path: req.path
      });
    } catch (err) {
      console.error('Visitor logging error:', err);
    }
  }
  next();
});

// Routes
const { authRouter } = require('./routes/auth');
const productRouter = require('./routes/products');
const paymentRouter = require('./routes/payments');
const analyticsRouter = require('./routes/analytics');
const blogRouter = require('./routes/blogs');
const affiliateRouter = require('./routes/affiliates');
const chatRouter = require('./routes/chat');
const supportRouter = require('./routes/support');
const transactionRouter = require('./routes/transactions');
const sellerRouter = require('./routes/seller');
const userRoutes = require('./routes/user');

app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/blogs', blogRouter);
app.use('/api/affiliates', affiliateRouter);
app.use('/api/chat', chatRouter);
app.use('/api/support', supportRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/user', userRoutes);
const adminRouter = require('./routes/admin');
app.use('/api/admin', adminRouter);

// Basic Route
app.get('/', (req, res) => {
  res.send('DigiExpo E-commerce API');
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digiexpo')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
