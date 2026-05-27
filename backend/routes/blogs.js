const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const multer = require('multer');
const path = require('path');
const { verifyAdmin } = require('./auth');
const fs = require('fs/promises');
const { uploadFile } = require('../utils/cloudinary');

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// Create Blog (Admin Only)
router.post('/', verifyAdmin, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'media', maxCount: 10 }
]), async (req, res) => {
  try {
    const { title, subtitle, author, content } = req.body;
    
    let thumbnail = '';
    if (req.files?.thumbnail?.[0]?.path) {
      const uploaded = await uploadFile(req.files.thumbnail[0].path, { folder: 'digiexpo/blogs', resourceType: 'image' });
      thumbnail = uploaded.secure_url;
    }

    let media = [];
    if (req.files?.media?.length) {
      media = await Promise.all(
        req.files.media.map(async (file) => {
          const isVideo = file.mimetype?.startsWith('video/');
          const uploaded = await uploadFile(file.path, { folder: 'digiexpo/blogs', resourceType: isVideo ? 'video' : 'image' });
          return {
            url: uploaded.secure_url,
            type: isVideo ? 'video' : 'image'
          };
        })
      );
    }

    const newBlog = new Blog({
      title,
      subtitle,
      author,
      content,
      thumbnail,
      media
    });

    await newBlog.save();

    // Optional: cleanup local uploaded media files
    const mediaFiles = [
      ...(req.files?.thumbnail || []),
      ...(req.files?.media || [])
    ];
    await Promise.allSettled(
      mediaFiles
        .filter(f => f?.path)
        .map(f => fs.unlink(f.path))
    );

    res.status(201).json(newBlog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get All Blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Single Blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Blog (Admin Only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
