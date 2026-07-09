const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Anthropic = require('@anthropic-ai/sdk');
const Post = require('../models/Post');
const multer = require('multer');
const fs = require('fs');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].text;
    const cleaned = text.replace(/```json|```/g, '').trim();
    const generated = JSON.parse(cleaned);
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

router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    const { platform, tone } = req.body;
    const imageFile = req.file;

    if (!imageFile) return res.status(400).json({ message: 'No image uploaded' });

    const prompt = `You are a viral social media content creator. A user uploaded an image described as: "${req.body.topic || 'no description provided'}". Create ${platform} content in ${tone} tone.

Respond ONLY in this exact JSON format:
{
  "imageDescription": "describe the image based on user description",
  "caption": "engaging human caption",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
  "callToAction": "natural conversational CTA",
  "postIdeas": ["idea 1", "idea 2", "idea 3"],
  "script": "natural video script minimum 300 words",
  "hooks": ["hook 1", "hook 2", "hook 3"],
  "nicheOfDay": "relevant niche",
  "trendingTopics": ["topic 1", "topic 2", "topic 3"],
  "viralSuggestions": ["strategy 1", "strategy 2", "strategy 3"]
}`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].text;
    const cleaned = text.replace(/```json|```/g, '').trim();
    const generated = JSON.parse(cleaned);
    const timing = postingTimes[platform] || postingTimes['Instagram'];

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
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;