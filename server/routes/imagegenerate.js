const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const { GoogleGenAI } = require('@google/genai');

// Initialize the SDK with your API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. Generate Image Route
router.post('/', auth, async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    // Call the Gemini high-fidelity image model
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image', // You can also use 'gemini-2.5-flash-image'
      contents: prompt,
      config: {
        // Force the model to output an image instead of text
        responseModalities: ["IMAGE"],
        // Default to a square aspect ratio; you can adjust this if needed
        imageConfig: { aspectRatio: "1:1" } 
      }
    });

    // Extract the base64 image data from the API response
    const imageBase64 = response.candidates[0].content.parts[0].inlineData.data;
    
    // Format as a data URI so the frontend <img> tag can render it directly
    const imageUrl = `data:image/jpeg;base64,${imageBase64}`;

    res.json({ image: imageUrl });
  } catch (err) {
    console.error('Image Generation Error:', err);
    res.status(500).json({ message: 'Generation failed' });
  }
});

// 2. Save Image Route
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
      imageUrl: imageUrl // This will now securely store the base64 string
    });
    
    await post.save();
    res.json({ success: true });
  } catch (err) {
    console.error('Save Error:', err);
    res.status(500).json({ message: 'Save failed' });
  }
});

module.exports = router;