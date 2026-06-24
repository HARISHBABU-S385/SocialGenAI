const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');

// Get all posts for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save a post
router.put('/save/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { isSaved: true },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get saved posts only
router.get('/saved', auth, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.id, isSaved: true }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;