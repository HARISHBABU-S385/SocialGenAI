const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Groq = require('groq-sdk');
const Post = require('../models/Post');
const multer = require('multer');
const fs = require('fs');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
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

    const prompt = `
You are a world-class social media strategist, viral content expert, and professional copywriter with 10+ years of experience growing brands on ${platform}.

Generate EXTREMELY detailed, creative, and high-quality social media content for:
- Topic: ${topic}
- Platform: ${platform}
- Tone: ${tone}

Respond ONLY in this exact JSON format with no extra text:
{
  "caption": "Write a long, powerful, emotionally engaging caption (minimum 5-7 sentences). Use storytelling, emojis, line breaks shown as \\n, and a strong narrative that connects with the audience deeply. Make it platform-optimized for ${platform}.",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5", "hashtag6", "hashtag7", "hashtag8", "hashtag9", "hashtag10"],
  "callToAction": "Write a compelling, creative and urgent call to action that makes people want to act immediately. Make it specific and exciting, not generic.",
  "postIdeas": [
    "Detailed creative post idea 1 with full explanation of concept, visual description and why it will go viral",
    "Detailed creative post idea 2 with full explanation",
    "Detailed creative post idea 3 with full explanation",
    "Detailed creative post idea 4 with full explanation",
    "Detailed creative post idea 5 with full explanation"
  ],
  "script": "Write a complete, detailed 60-90 second video script with:\\n\\nHOOK (0-5 sec): An attention-grabbing opening line that stops the scroll\\n\\nINTRO (5-15 sec): Introduce the topic with energy and excitement\\n\\nMAIN CONTENT (15-50 sec): Deliver 3-4 key points with examples, stories or facts\\n\\nCTA (50-60 sec): Strong closing with clear next steps\\n\\nMake it natural, conversational and engaging for ${platform}.",
  "hooks": [
    "Viral hook 1 - a scroll-stopping opening line using curiosity or shock",
    "Viral hook 2 - a hook using a bold controversial statement or surprising fact",
    "Viral hook 3 - a hook using a relatable pain point or emotion",
    "Viral hook 4 - a hook using a strong question that demands attention",
    "Viral hook 5 - a hook using a story or personal experience angle"
  ],
  "nicheOfDay": "Specific niche category with sub-niche (e.g. Food & Lifestyle > Street Food Culture)",
  "trendingTopics": [
    "Trending topic 1 with explanation of why it is trending right now",
    "Trending topic 2 with explanation",
    "Trending topic 3 with explanation",
    "Trending topic 4 with explanation",
    "Trending topic 5 with explanation"
  ],
  "viralSuggestions": [
    "Detailed viral content strategy 1 - explain the format, why it works, and how to execute it perfectly on ${platform}",
    "Detailed viral content strategy 2 - with execution tips",
    "Detailed viral content strategy 3 - with execution tips",
    "Detailed viral content strategy 4 - with execution tips"
  ]
}
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;
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
      postIdeas: generated.postIdeas
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

    const prompt = `
You are a professional social media content creator.
A user has uploaded an image and wants to create ${platform} content in a ${tone} tone based on it.
Since you cannot see the image directly, generate versatile and creative content that would work well for a ${platform} post with ${tone} tone.

Respond ONLY in this exact JSON format with no extra text:
{
  "imageDescription": "Creative description assuming this is a lifestyle/product/event photo perfect for ${platform}",
  "caption": "engaging caption for ${platform}",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "callToAction": "strong call to action",
  "postIdeas": ["idea 1", "idea 2", "idea 3"],
  "script": "30-60 second video script for this content",
  "hooks": ["hook 1", "hook 2", "hook 3"],
  "nicheOfDay": "relevant niche category",
  "trendingTopics": ["trending topic 1", "trending topic 2", "trending topic 3"],
  "viralSuggestions": ["viral idea 1", "viral idea 2", "viral idea 3"]
}
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;
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
      postIdeas: generated.postIdeas
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