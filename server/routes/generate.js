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

// --- MAIN GENERATE ROUTE ---
router.post('/', auth, async (req, res) => {
  try {
    const { topic, platform, tone } = req.body;

    // === NEW UPGRADED PROMPT STARTS HERE ===
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
  Caption instruction:
"caption": "Write like a real shop owner texting their friend about this exciting news. No corporate words. Short sentences. Real emotions. Start with something unexpected, not 'Hey everyone'. Use \\n between thoughts. Sound excited but natural."
  "hashtags": ["mix of niche hashtags", "trending hashtags", "branded hashtags", "community hashtags", "discovery hashtags", "viral hashtags", "location based if relevant", "topic specific", "audience specific", "platform specific"],
  
  "callToAction": "Write a CTA that feels like a friend asking a genuine question or making an exciting offer. Make it conversational and specific, not generic like 'click the link in bio'.",
  
  "postIdeas": [
    "Post idea 1: Give a specific, creative, detailed content concept with exact execution steps, what to film/photograph, what to say, and why this specific format will go viral on ${platform}",
    "Post idea 2: Another unique angle with full execution details",
    "Post idea 3: A trending format adapted to this topic with step by step guide",
    "Post idea 4: A controversial or surprising take that will spark comments and shares",
    "Post idea 5: A personal story format that makes the audience feel deeply connected"
  ],
  
  "script": "Write exactly what a real person would say on camera — nervous energy, natural pauses, genuine excitement. No 'Hey everyone welcome back'. Start mid-thought like you're already in a conversation. Include specific real details like prices, location, personal story of why this shop was started. Write every single word to be spoken. Minimum 400 words. No section labels like HOOK or INTRO in the final output."
  "hooks": [
    "A hook using a shocking statistic or fact nobody knows about ${topic}",
    "A hook using a deeply relatable pain point or frustration",
    "A hook starting with 'Nobody talks about...' or 'I wish someone told me...'",
    "A hook using a controversial opinion that sparks debate",
    "A hook using a personal failure or vulnerable moment related to ${topic}"
  ],
  
  "nicheOfDay": "Specific niche with sub-niche and brief explanation of why this niche is trending today (e.g. Food & Lifestyle > South Indian Street Food — trending because of recent viral reels showing authentic local experiences)",
  
  "trendingTopics": [
    "Trending topic 1 related to ${topic} — explain the trend, why it is viral right now, and how to ride this trend",
    "Trending topic 2 — with specific content angle to take advantage of it",
    "Trending topic 3 — with example of what type of post would go viral",
    "Trending topic 4 — with the emotion it triggers and why people share it",
    "Trending topic 5 — with the best format (reel, carousel, story, thread) to use"
  ],
  
  "viralSuggestions": [
    "Viral strategy 1: Describe the exact content format, why it works psychologically, step by step execution guide, and what result to expect on ${platform}",
    "Viral strategy 2: A collaboration or duet idea that doubles reach with full execution plan",
    "Viral strategy 3: A series concept that builds a loyal audience over time with content calendar outline",
    "Viral strategy 4: A controversial or emotional angle that triggers comments and shares with safety tips to avoid backlash"
  ]
}
`;
    // === NEW UPGRADED PROMPT ENDS HERE ===

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

// --- IMAGE GENERATE ROUTE ---
// --- IMAGE GENERATE ROUTE ---
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    const { platform, tone } = req.body;
    const imageFile = req.file;

    if (!imageFile) return res.status(400).json({ message: 'No image uploaded' });

    // === NEW UPGRADED IMAGE PROMPT STARTS HERE ===
    const prompt = `You are a viral social media content creator.A user uploaded an image and described it as: "${req.body.topic || 'no description provided'}"Create ${platform} content in ${tone} tone based on this description and image context.Respond ONLY in this exact JSON format:{  "imageDescription": "Describe what kind of image this likely is based on the user description",  "caption": "Write a deeply human, engaging caption based on the image description. Sound like a real person.",  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],  "callToAction": "Natural conversational CTA",  "postIdeas": ["idea 1", "idea 2", "idea 3"],  "script": "Full natural video script based on the image context. Minimum 300 words.",  "hooks": ["hook 1", "hook 2", "hook 3"],  "nicheOfDay": "relevant niche",  "trendingTopics": ["topic 1", "topic 2", "topic 3"],  "viralSuggestions": ["strategy 1", "strategy 2", "strategy 3"]}`;
    // === NEW UPGRADED IMAGE PROMPT ENDS HERE ===

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, '').trim();
    const generated = JSON.parse(cleaned);
    const timing = postingTimes[platform] || postingTimes['Instagram'];

    // Clean up the uploaded image from the server
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