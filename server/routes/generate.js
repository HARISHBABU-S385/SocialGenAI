const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenAI } = require('@google/genai');
const Post = require('../models/Post');
const multer = require('multer');
const fs = require('fs');

// Initialize Gemini using your API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer({ dest: 'uploads/' });

const postingTimes = {
  Instagram: { best: '7 PM - 9 PM', peak: '8 PM', traffic: 'Highest on Wed & Fri' },
  Twitter: { best: '8 AM - 10 AM', peak: '9 AM', traffic: 'Highest on Tue & Wed' },
  LinkedIn: { best: '9 AM - 11 AM', peak: '10 AM', traffic: 'Highest on Tue & Thu' },
  Facebook: { best: '1 PM - 4 PM', peak: '3 PM', traffic: 'Highest on Thu & Fri' }
};

// 1. Text Content Generation Route
router.post('/', auth, async (req, res) => {
  try {
    const { topic, platform, tone } = req.body;

    const prompt = `You are a viral social media content creator who has grown multiple accounts to over 1 million followers. You write content that feels 100% human, relatable, and emotionally engaging.

Create highly engaging social media content for:
- Topic: ${topic}
- Platform: ${platform}
- Tone: ${tone}

STRICT RULES:
- Write like a real human being, not an AI
- Use natural language and conversational style
- Add personality, emotion, and storytelling
- Never use corporate buzzwords

Respond ONLY in this exact JSON format with no extra text outside the JSON:
{
  "caption": "engaging caption with natural language, use newlines between thoughts",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8", "hashtag9", "hashtag10"],
  "callToAction": "conversational and specific CTA",
  "postIdeas": [
    "Post idea 1 with full execution details",
    "Post idea 2 with full execution details",
    "Post idea 3 with full execution details",
    "Post idea 4 with full execution details",
    "Post idea 5 with full execution details"
  ],
  "script": "Complete natural video script minimum 400 words, write every word to be spoken, no section labels",
  "hooks": [
    "Hook using shocking fact about ${topic}",
    "Hook using relatable pain point",
    "Hook starting with Nobody talks about or I wish someone told me",
    "Hook using controversial opinion",
    "Hook using personal failure or vulnerable moment"
  ],
  "nicheOfDay": "Specific niche with sub-niche and why it is trending",
  "trendingTopics": [
    "Trending topic 1 with explanation and content angle",
    "Trending topic 2 with content angle",
    "Trending topic 3 with viral post example",
    "Trending topic 4 with emotion it triggers",
    "Trending topic 5 with best format to use"
  ],
  "viralSuggestions": [
    "Viral strategy 1 with step by step execution",
    "Viral strategy 2 collaboration idea with execution plan",
    "Viral strategy 3 series concept with content calendar",
    "Viral strategy 4 emotional angle with safety tips"
  ]
}`;

    // Call Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        // Enforces JSON response format
        responseMimeType: "application/json", 
      }
    });

    const text = response.text;
    const generated = JSON.parse(text);
    const timing = postingTimes[platform] || postingTimes['Instagram'];

    const post = new Post({
      userId: req.user.id,
      topic,
      platform,
      tone,
      caption: generated.caption,
      hashtags: generated.hashtags,
      callToAction: generated.callToAction,
      postIdeas: generated.postIdeas,
      script: generated.script || '',
      hooks: generated.hooks || [],
      trendingTopics: generated.trendingTopics || [],
      viralSuggestions: generated.viralSuggestions || [],
      nicheOfDay: generated.nicheOfDay || ''
    });

    await post.save();

    res.json({
      success: true,
      data: { ...generated, postingTime: timing },
      postId: post._id
    });
  } catch (err) {
    console.error('FULL ERROR:', err);
    res.status(500).json({ message: err.message });
  }
});

// 2. Image Upload & Content Generation Route
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    const { platform, tone } = req.body;
    const imageFile = req.file;

    if (!imageFile) return res.status(400).json({ message: 'No image uploaded' });

    const prompt = `You are a viral social media content creator. Analyze the uploaded image and consider this user context if provided: "${req.body.topic || 'no description provided'}". Create ${platform} content in ${tone} tone based on what you see in the image.

Respond ONLY in this exact JSON format:
{
  "imageDescription": "Detailed visual description of the image",
  "caption": "engaging human caption tailored to the image",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
  "callToAction": "natural conversational CTA",
  "postIdeas": ["idea 1", "idea 2", "idea 3"],
  "script": "natural video script minimum 300 words relating to the image",
  "hooks": ["hook 1", "hook 2", "hook 3"],
  "nicheOfDay": "relevant niche",
  "trendingTopics": ["topic 1", "topic 2", "topic 3"],
  "viralSuggestions": ["strategy 1", "strategy 2", "strategy 3"]
}`;

    // Convert the uploaded multer file to base64 for Gemini to read
    const imageBase64 = Buffer.from(fs.readFileSync(imageFile.path)).toString("base64");
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: imageFile.mimetype
      }
    };

    // Pass BOTH the text prompt and the actual image to Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [prompt, imagePart],
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    const generated = JSON.parse(text);
    const timing = postingTimes[platform] || postingTimes['Instagram'];

    // Clean up the uploaded file from the server
    fs.unlinkSync(imageFile.path);

    const post = new Post({
      userId: req.user.id,
      topic: generated.imageDescription,
      platform,
      tone,
      caption: generated.caption,
      hashtags: generated.hashtags,
      callToAction: generated.callToAction,
      postIdeas: generated.postIdeas,
      script: generated.script || '',
      hooks: generated.hooks || [],
      trendingTopics: generated.trendingTopics || [],
      viralSuggestions: generated.viralSuggestions || [],
      nicheOfDay: generated.nicheOfDay || ''
    });

    await post.save();

    res.json({
      success: true,
      data: { ...generated, postingTime: timing },
      postId: post._id
    });
  } catch (err) {
    console.error('FULL ERROR:', err);
    // Ensure file is deleted even if the API call fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;