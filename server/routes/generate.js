const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Post = require('../models/Post');
const multer = require('multer');
const fs = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a viral social media content creator. Create highly engaging content for:
- Topic: ${topic}
- Platform: ${platform}
- Tone: ${tone}

Respond ONLY in this exact JSON format with no extra text:
{
  "caption": "engaging caption",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "callToAction": "CTA",
  "postIdeas": ["idea1", "idea2", "idea3"],
  "script": "full video script minimum 200 words",
  "hooks": ["hook1", "hook2", "hook3"],
  "nicheOfDay": "niche category",
  "trendingTopics": ["topic1", "topic2", "topic3"],
  "viralSuggestions": ["strategy1", "strategy2", "strategy3"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, '').trim();
    const generated = JSON.parse(cleaned);
    const timing = postingTimes[platform] || postingTimes['Instagram'];

    const post = new Post({
      userId: req.user.id,
      topic, platform, tone,
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

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze this image and create ${platform} content in ${tone} tone. Respond ONLY in valid JSON with keys: imageDescription, caption, hashtags, callToAction, postIdeas, script, hooks, nicheOfDay, trendingTopics, viralSuggestions.`;

    const imageData = {
      inlineData: {
        data: Buffer.from(fs.readFileSync(imageFile.path)).toString('base64'),
        mimeType: imageFile.mimetype
      }
    };

    const result = await model.generateContent([prompt, imageData]);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, '').trim();
    const generated = JSON.parse(cleaned);
    fs.unlinkSync(imageFile.path);

    const post = new Post({
      userId: req.user.id,
      topic: generated.imageDescription || topic,
      platform, tone,
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