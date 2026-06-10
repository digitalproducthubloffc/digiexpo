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
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payments');
const { authRouter } = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const supportRoutes = require('./routes/support');
const blogRoutes = require('./routes/blogs');
const userRoutes = require('./routes/user');
const affiliateRoutes = require('./routes/affiliates');
const chatRoutes = require('./routes/chat');

app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRouter);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/user', userRoutes);
app.use('/api/affiliates', affiliateRoutes);
app.use('/api/chat', chatRoutes);

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
