const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: ['https://social-gen-ai.vercel.app', 'https://social-gen-ai-neon.vercel.app', 'http://localhost:3000', 'http://localhost:3001']
}));
app.use(express.json());

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const generateRoutes = require('./routes/generate');
const imageGenerateRoutes = require('./routes/ImageGen');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/imagegenerate', imageGenerateRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));