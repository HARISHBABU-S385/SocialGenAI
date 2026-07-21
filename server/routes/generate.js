const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const postingTimes = {
  Instagram: { best: '7 PM - 9 PM', peak: '8 PM', traffic: 'Highest on Wed & Fri' },
  Twitter: { best: '8 AM - 10 AM', peak: '9 AM', traffic: 'Highest on Tue & Wed' },
  LinkedIn: { best: '9 AM - 11 AM', peak: '10 AM', traffic: 'Highest on Tue & Thu' },
  Facebook: { best: '1 PM - 4 PM', peak: '3 PM', traffic: 'Highest on Thu & Fri' }
};

function extractJSON(text) {
  // 1. Remove markdown formatting
  let cleaned = text.replace(/```json|```/g, '').trim();
  
  // 2. Isolate the JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  try {
    // 3. Sanitize bad control characters (raw newlines, carriage returns, tabs)
    // Replacing them with spaces prevents words from mashing together while keeping JSON valid
    cleaned = cleaned.replace(/[\n\r\t]+/g, ' ');
    
    // Optional: Fix unescaped double quotes inside strings by escaping them, 
    // but ignoring structural quotes (a bit complex for regex, so sanitizing newlines usually fixes 99% of LLaMA errors)
    
    return JSON.parse(cleaned);
  } catch (err) {
    // 4. If it fails, log the EXACT raw text to Render so you know exactly what the AI did
    console.error("================ FAILED AI RAW OUTPUT ================");
    console.error(text);
    console.error("=======================================================");
    throw new Error('Failed to parse AI response into valid JSON.');
  }
}

async function queryCloudflare(prompt) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.CF_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ 
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096  // <-- ADDED THIS TO PREVENT CUTTING OFF
    })
  });
  
  const result = await response.json();
  
  if (!result.success) {
    console.error('Cloudflare API Error:', JSON.stringify(result.errors));
    throw new Error('Cloudflare API failed');
  }
  
  return result.result.response;
}

router.post('/', auth, async (req, res) => {
  try {
    const { topic, platform, tone } = req.body;
    const prompt = `You are a viral social media content creator. Create highly engaging content for:
- Topic: ${topic}
- Platform: ${platform}
- Tone: ${tone}

Respond ONLY in this exact JSON format with no extra text:
{
  "caption": "engaging human-like caption minimum 5 sentences",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
  "callToAction": "compelling CTA",
  "postIdeas": ["idea1", "idea2", "idea3", "idea4", "idea5"],
  "script": "complete natural video script minimum 300 words",
  "hooks": ["hook1", "hook2", "hook3", "hook4", "hook5"],
  "nicheOfDay": "specific niche category",
  "trendingTopics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "viralSuggestions": ["strategy1", "strategy2", "strategy3", "strategy4"]
}`;

    const text = await queryCloudflare(prompt);
   // Ensure arrays
if (typeof generated.hashtags === 'string') generated.hashtags = generated.hashtags.split(',').map(h => h.trim());
if (typeof generated.hooks === 'string') generated.hooks = [generated.hooks];
if (typeof generated.postIdeas === 'string') generated.postIdeas = [generated.postIdeas];
if (typeof generated.trendingTopics === 'string') generated.trendingTopics = [generated.trendingTopics];
if (typeof generated.viralSuggestions === 'string') generated.viralSuggestions = [generated.viralSuggestions];
    const timing = postingTimes[platform] || postingTimes['Instagram'];
    const post = new Post({
      userId: req.user.id, topic, platform, tone,
      caption: generated.caption, hashtags: generated.hashtags,
      callToAction: generated.callToAction, postIdeas: generated.postIdeas,
      script: generated.script || '', hooks: generated.hooks || [],
      trendingTopics: generated.trendingTopics || [], viralSuggestions: generated.viralSuggestions || [],
      nicheOfDay: generated.nicheOfDay || ''
    });

    await post.save();
    res.json({ success: true, data: { ...generated, postingTime: timing }, postId: post._id });
  } catch (err) {
    console.error('TEXT GENERATION ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    const { platform, tone, topic } = req.body;
    const imageFile = req.file;
    if (!imageFile) return res.status(400).json({ message: 'No image uploaded' });

    const prompt = `Create ${platform} social media content in ${tone} tone for this topic: ${topic || 'general lifestyle content'}.
Respond ONLY in valid JSON with these keys: imageDescription, caption, hashtags, callToAction, postIdeas, script, hooks, nicheOfDay, trendingTopics, viralSuggestions.`;

    const text = await queryCloudflare(prompt);
    const generated = extractJSON(text);
    if (fs.existsSync(imageFile.path)) fs.unlinkSync(imageFile.path);

    const post = new Post({
      userId: req.user.id, topic: generated.imageDescription || topic,
      platform, tone, caption: generated.caption, hashtags: generated.hashtags,
      callToAction: generated.callToAction, postIdeas: generated.postIdeas,
      script: generated.script || '', hooks: generated.hooks || [],
      trendingTopics: generated.trendingTopics || [], viralSuggestions: generated.viralSuggestions || [],
      nicheOfDay: generated.nicheOfDay || ''
    });

    await post.save();
    res.json({ success: true, data: { ...generated, postingTime: postingTimes[platform] }, postId: post._id });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;