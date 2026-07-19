const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');

router.post('/', auth, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt required' });
    
    const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;
    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${process.env.CF_API_TOKEN}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        prompt: prompt + ", high quality, professional, no text, no watermark" 
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudflare Error:', errorData);
      throw new Error('Cloudflare API failed');
    }
    
    // Use arrayBuffer() for Node.js native fetch
    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    
    res.json({ image: `data:image/png;base64,${base64Image}` });
  } catch (err) {
    console.error('Image Generation Error:', err.message);
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