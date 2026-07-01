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
You are a viral social media content creator who has grown multiple accounts to over 1 million followers. You write content that feels 100% human, relatable, and emotionally engaging. You never sound robotic or AI-generated.

Create highly engaging social media content for:
- Topic: ${topic}
- Platform: ${platform}
- Tone: ${tone}

STRICT RULES:
- Write like a real human being, not an AI
- Use natural language, slang, and conversational style
- Add personality, emotion, and storytelling
- Never use corporate buzzwords like "delve", "leverage", "utilize"
- Make people stop scrolling and actually read
- Write for real people not for algorithms

Respond ONLY in this exact JSON format with no extra text:
{
  "caption": "Write like a real person texting their friend about this. No corporate words. Short sentences. Real emotions. Start with something unexpected. Use \\n between thoughts. Sound excited but natural.",
  "hashtags": ["mix of niche hashtags", "trending hashtags", "branded hashtags", "community hashtags", "discovery hashtags", "viral hashtags", "location based if relevant", "topic specific", "audience specific", "platform specific"],
  "callToAction": "Write a CTA that feels like a friend asking a genuine question or making an exciting offer. Make it conversational and specific.",
  "postIdeas": [
    "Post idea 1: specific creative concept with exact execution steps",
    "Post idea 2: another unique angle with full execution details",
    "Post idea 3: a trending format adapted to this topic",
    "Post idea 4: a controversial or surprising take that sparks comments",
    "Post idea 5: a personal story format that deeply connects with audience"
  ],
  "script": "Write exactly what a real person would say on camera. Start mid-thought. Include specific real details. Write every single word to be spoken. Minimum 400 words. No section labels.",
  "hooks": [
    "A hook using a shocking statistic or fact nobody knows about ${topic}",
    "A hook using a deeply relatable pain point or frustration",
    "A hook starting with Nobody talks about or I wish someone told me",
    "A hook using a controversial opinion that sparks debate",
    "A hook using a personal failure or vulnerable moment related to ${topic}"
  ],
  "nicheOfDay": "Specific niche with sub-niche and brief explanation of why this niche is trending today",
  "trendingTopics": [
    "Trending topic 1 related to ${topic} with explanation and content angle",
    "Trending topic 2 with specific content angle",
    "Trending topic 3 with example of viral post",
    "Trending topic 4 with emotion it triggers",
    "Trending topic 5 with best format to use"
  ],
  "viralSuggestions": [
    "Viral strategy 1: exact content format, why it works, step by step execution",
    "Viral strategy 2: collaboration or duet idea with full execution plan",
    "Viral strategy 3: series concept that builds loyal audience",
    "Viral strategy 4: controversial or emotional angle with safety tips"
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
  postIdeas: generated.postIdeas,
  script: generated.script || '',
  hooks: generated.hooks || [],
  nicheOfDay: generated.nicheOfDay || '',
  trendingTopics: generated.trendingTopics || [],
  viralSuggestions: generated.viralSuggestions || []
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

    const prompt = `You are a viral social media content creator. A user uploaded an image and described it as: "${req.body.topic || 'no description provided'}" Create ${platform} content in ${tone} tone based on this description and image context. Respond ONLY in this exact JSON format: { "imageDescription": "Describe what kind of image this likely is based on the user description", "caption": "Write a deeply human engaging caption based on the image description. Sound like a real person.", "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"], "callToAction": "Natural conversational CTA", "postIdeas": ["idea 1", "idea 2", "idea 3"], "script": "Full natural video script based on the image context. Minimum 300 words.", "hooks": ["hook 1", "hook 2", "hook 3"], "nicheOfDay": "relevant niche", "trendingTopics": ["topic 1", "topic 2", "topic 3"], "viralSuggestions": ["strategy 1", "strategy 2", "strategy 3"] }`;

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