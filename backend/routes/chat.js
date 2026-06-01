const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('./auth');
const multer = require('multer');
const path = require('path');

const fs = require('fs');

// Multer storage for chat media — stored locally in uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads/')) {
      fs.mkdirSync('uploads/', { recursive: true });
    }
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => cb(null, 'chat-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max

// ───── USER ENDPOINTS ─────

// Get or create chat for logged-in user
router.get('/my-chat', verifyToken, async (req, res) => {
  try {
    let chat = await Chat.findOne({ userId: req.user.userId });
    if (!chat) {
      const user = await User.findById(req.user.userId);
      chat = await Chat.create({
        userId: req.user.userId,
        userName: user?.name || 'User',
        userEmail: user?.email || '',
        messages: []
      });
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User sends a message (text or media)
router.post('/my-chat/send', verifyToken, upload.single('media'), async (req, res) => {
  try {
    let chat = await Chat.findOne({ userId: req.user.userId });
    if (!chat) {
      const user = await User.findById(req.user.userId);
      chat = await Chat.create({
        userId: req.user.userId,
        userName: user?.name || 'User',
        userEmail: user?.email || '',
        messages: []
      });
    }

    let productName;
    if (req.body.productId) {
      const Product = require('../models/Product');
      const product = await Product.findById(req.body.productId);
      if (product) productName = product.title;
    }

    const message = {
      sender: 'user',
      text: req.body.text || '',
      readByAdmin: false,
      readByUser: true,
      productId: req.body.productId || undefined,
      productName
    };

    // Handle media upload
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
      message.mediaUrl = baseUrl + req.file.filename;
      message.mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    chat.messages.push(message);
    chat.lastMessage = message.text || (message.mediaType === 'image' ? '📷 Image' : '🎥 Video');
    chat.lastMessageAt = new Date();
    chat.status = 'open';
    await chat.save();

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User marks messages as read
router.post('/my-chat/read', verifyToken, async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user.userId });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    chat.messages.forEach(msg => {
      if (msg.sender === 'admin') msg.readByUser = true;
    });
    await chat.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ───── ADMIN ENDPOINTS ─────

// Get all chats (admin)
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const chats = await Chat.find().sort({ lastMessageAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single chat by ID (admin)
router.get('/:chatId', verifyAdmin, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin sends a message to a chat
router.post('/:chatId/reply', verifyAdmin, upload.single('media'), async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const message = {
      sender: 'admin',
      text: req.body.text || '',
      readByAdmin: true,
      readByUser: false
    };

    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
      message.mediaUrl = baseUrl + req.file.filename;
      message.mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    chat.messages.push(message);
    chat.lastMessage = message.text || (message.mediaType === 'image' ? '📷 Image' : '🎥 Video');
    chat.lastMessageAt = new Date();
    await chat.save();

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin marks messages as read
router.post('/:chatId/read', verifyAdmin, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    chat.messages.forEach(msg => {
      if (msg.sender === 'user') msg.readByAdmin = true;
    });
    await chat.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Close a chat (admin)
router.post('/:chatId/close', verifyAdmin, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    chat.status = 'closed';
    await chat.save();
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
