const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');

router.post('/', auth, async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await axios({
      method: 'post',
      url: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: { inputs: prompt },
      responseType: 'arraybuffer',
      timeout: 60000
    });

    const base64 = Buffer.from(response.data).toString('base64');
    res.json({ image: `data:image/png;base64,${base64}` });
  } catch (err) {
    console.error('Image gen error:', err.message);
    res.status(500).json({ message: 'Image generation failed. Try again in 30 seconds.' });
  }
});

module.exports = router;