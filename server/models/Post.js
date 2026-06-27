const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  platform: { type: String, required: true },
  tone: { type: String, required: true },
  caption: { type: String, required: true },
  hashtags: { type: [String], default: [] },
  callToAction: { type: String, default: '' },
  postIdeas: { type: [String], default: [] },
  isSaved: { type: Boolean, default: false },
  imageUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);