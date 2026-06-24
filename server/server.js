const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: ['https://social-gen-ai.vercel.app', 'http://localhost:3000', 'http://localhost:3001']
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const generateRoutes = require('./routes/generate');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/generate', generateRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log('MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));