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
        prompt: prompt + ", ultra-realistic, 8k resolution, cinematic lighting, photorealistic, highly detailed, no text, no watermark" 
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudflare Error:', errorData);
      throw new Error('Cloudflare API failed');
    }
    
    // Convert arrayBuffer to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString('base64');
    const formattedImageUrl = `data:image/png;base64,${base64String}`;
    
    // Save the generated image directly to MongoDB History
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
      imageUrl: formattedImageUrl // Save the base64 image here
    });
    
    await post.save();
    
    // Return both the image and the new database ID to the frontend
    res.json({ image: formattedImageUrl, postId: post._id });
    
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