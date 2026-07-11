const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');

router.post('/', auth, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt required' });
    
    const encodedPrompt = encodeURIComponent(prompt + ', high quality, professional, no text, no watermark');
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;
    
    res.json({ image: imageUrl });
  } catch (err) {
    res.status(500).json({ message: 'Generation failed' });
  }
});

router.post('/save', auth, async (req, res) => {
  try {
    const { imageUrl, prompt } = req.body;
    const post = new Post({
      userId: req.user.id,
      topic: prompt,
      platform: 'AI Image',
      tone: 'visual',
      caption: prompt,
      hashtags: [],
      callToAction: '',
      postIdeas: [],
      isSaved: true,
      imageUrl: imageUrl
    });
    await post.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Save failed' });
  }
});

module.exports = router;