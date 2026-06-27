const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// --- IMAGE GENERATION ROUTE (Using Pollinations AI URL) ---
router.post('/', auth, async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Safely encode the prompt so spaces and special characters don't break the URL
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
    
    // Returns the direct link to the frontend
    res.json({ image: imageUrl });
  } catch (err) {
    console.error('Generation failed:', err.message);
    res.status(500).json({ message: 'Generation failed' });
  }
});

module.exports = router;