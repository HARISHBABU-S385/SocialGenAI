const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenAI } = require('@google/genai');
const Post = require('../models/Post');
const multer = require('multer');
const fs = require('fs');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer({ dest: 'uploads/' });

const postingTimes = {
  Instagram: { best: '7 PM - 9 PM', peak: '8 PM', traffic: 'Highest on Wed & Fri' },
  Twitter: { best: '8 AM - 10 AM', peak: '9 AM', traffic: 'Highest on Tue & Wed' },
  LinkedIn: { best: '9 AM - 11 AM', peak: '10 AM', traffic: 'Highest on Tue & Thu' },
  Facebook: { best: '1 PM - 4 PM', peak: '3 PM', traffic: 'Highest on Thu & Fri' }
};

router.post('/', auth, async (req, res) => {
  try {
    const { topic, platform, tone } = req.body;
    const prompt = `You are a viral social media content creator. Create highly engaging content for:
    - Topic: ${topic}
    - Platform: ${platform}
    - Tone: ${tone}

    Respond ONLY in this exact JSON format:
    {
      "caption": "engaging caption",
      "hashtags": ["tag1", "tag2"],
      "callToAction": "CTA",
      "postIdeas": ["idea1", "idea2"],
      "script": "full video script",
      "hooks": ["hook1", "hook2"],
      "nicheOfDay": "niche",
      "trendingTopics": ["topic1"],
      "viralSuggestions": ["strategy1"]
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    const generated = JSON.parse(response.text);
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
    res.json({ success: true, data: { ...generated, postingTime: timing }, postId: post._id });
  } catch (err) {
    console.error('FULL ERROR:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    const { platform, tone, topic } = req.body;
    const imageFile = req.file;

    if (!imageFile) return res.status(400).json({ message: 'No image uploaded' });

    const prompt = `Analyze this image and create ${platform} content in ${tone} tone. Respond ONLY in valid JSON format with keys: imageDescription, caption, hashtags, callToAction, postIdeas, script, hooks, nicheOfDay, trendingTopics, viralSuggestions.`;

    const imageBase64 = Buffer.from(fs.readFileSync(imageFile.path)).toString("base64");
    const imagePart = {
      inlineData: { data: imageBase64, mimeType: imageFile.mimetype }
    };

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }],
      config: { responseMimeType: "application/json" }
    });

    const generated = JSON.parse(response.text);
    fs.unlinkSync(imageFile.path);

    const post = new Post({
      userId: req.user.id,
      topic: generated.imageDescription || topic,
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
    res.json({ success: true, data: { ...generated, postingTime: postingTimes[platform] }, postId: post._id });
  } catch (err) {
    console.error('FULL ERROR:', err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;