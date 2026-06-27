import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { generatePost, generateFromImage, savePost, generateImage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Generator.css';

const Generator = () => {
  const { user, logout } = useAuth();
  const { platform } = useParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState('text');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('casual');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [postId, setPostId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('caption');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imageGenLoading, setImageGenLoading] = useState(false);
  const [imageGenError, setImageGenError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);
    setActiveTab('caption');

    try {
      let res;
      if (mode === 'image' && image) {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('platform', platform);
        formData.append('tone', tone);
        formData.append('topic', topic);
        res = await generateFromImage(formData);
      } else {
        res = await generatePost({ topic, platform, tone });
      }
      setResult(res.data.data);
      setPostId(res.data.postId);
    } catch (err) {
      setError('Generation failed. Please try again.');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      await savePost(postId);
      setSaved(true);
    } catch (err) {
      setError('Failed to save post.');
    }
  };

  const handleCopy = () => {
    const text = `${result.caption}\n\n${result.hashtags.map(h => `#${h}`).join(' ')}\n\n${result.callToAction}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

const tabs = [
  { id: 'caption', label: '📝 Caption' },
  { id: 'script', label: '🎬 Script' },
  { id: 'hooks', label: '🪝 Hooks' },
  { id: 'trending', label: '🔥 Trending' },
  { id: 'timing', label: '⏰ Timing' },
  { id: 'imagegen', label: '🎨 AI Image' },
];

  const handleImageGenerate = async () => {
  setImageGenLoading(true);
  setImageGenError('');
  setGeneratedImage(null);
  try {
    const imagePrompt = result?.caption
      ? `${topic}, ${platform} post, ${tone} style, high quality, professional photography`
      : topic;
    const res = await generateImage({ prompt: imagePrompt });
    setGeneratedImage(res.data.image);
  } catch (err) {
    setImageGenError('Image generation failed. Try again.');
  }
  setImageGenLoading(false);
};

  return (
    <div className="generator-page">
      <nav className="navbar">
        <span className="navbar-brand">⚡ SocialGenAI</span>
        <div className="navbar-links">
          <span className="navbar-user">Hi, {user?.name}</span>
          <button className="nav-link" onClick={() => navigate('/')}>Platforms</button>
          <button className="nav-link" onClick={() => navigate('/history')}>History</button>
          <button className="btn btn-outline" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="generator-container">
        <div className="generator-left">
          <div className="platform-badge">{platform}</div>
          <h1 className="generator-title">Generate Content</h1>
          <p className="generator-subtitle">Create AI-powered content for {platform}</p>

          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'text' ? 'active' : ''}`}
              onClick={() => setMode('text')}
            >
              ✏️ Text Topic
            </button>
            <button
              className={`mode-btn ${mode === 'image' ? 'active' : ''}`}
              onClick={() => setMode('image')}
            >
              🖼️ Upload Image
            </button>
          </div>

          {mode === 'image' ? (
  <div>
    <div className="form-group">
      <label>Upload Image</label>
      <div className="image-upload-area" onClick={() => document.getElementById('imageInput').click()}>
        {imagePreview ? (
          <img src={imagePreview} alt="preview" className="image-preview" />
        ) : (
          <div className="upload-placeholder">
            <span>🖼️</span>
            <p>Click to upload image</p>
            <small>JPG, PNG supported</small>
          </div>
        )}
      </div>
      <input
        id="imageInput"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />
    </div>

    <div className="form-group">
      <label>Describe your image or add extra instructions</label>
      <textarea
        placeholder="e.g. This is a photo of my new cafe interior, focus on the cozy atmosphere and wooden decor..."
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        rows={3}
      />
    </div>
  </div>
) : (
  <div className="form-group">
    <label>Topic / Keywords</label>
    <textarea
      placeholder={`e.g. Launching a new product on ${platform}...`}
      value={topic}
      onChange={(e) => setTopic(e.target.value)}
      rows={4}
      required
    />
  </div>
)}

            <div className="form-group">
              <label>Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)}>
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
                <option value="humorous">Humorous</option>
                <option value="inspirational">Inspirational</option>
                <option value="promotional">Promotional</option>
              </select>
            </div>

            <button type="submit" className="generate-btn" disabled={loading}>
              {loading ? '⏳ Generating...' : '✨ Generate Content'}
            </button>
          </form>

          {error && <div className="gen-error">{error}</div>}
        </div>

        <div className="generator-right">
          {!result && !loading && (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <h3>Your content will appear here</h3>
              <p>Fill in the form and click Generate</p>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>AI is crafting your content...</p>
            </div>
          )}

          {result && (
            <div className="result-wrapper">
              {result.nicheOfDay && (
                <div className="niche-badge">🎯 Niche of the Day: {result.nicheOfDay}</div>
              )}

              <div className="result-tabs">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="result-content">
                {activeTab === 'caption' && (
                  <div>
                    {result.imageDescription && (
                      <div className="result-section">
                        <label>🖼️ Image Description</label>
                        <p className="result-text">{result.imageDescription}</p>
                      </div>
                    )}
                    {activeTab === 'imagegen' && (
              <div className="imagegen-section">
                <div className="result-section">
                  <label>🎨 AI Image Generator</label>
                  <p className="imagegen-hint">
                    Generate a custom image based on your content topic for {platform}
                  </p>
                </div>

                <div className="imagegen-prompt">
                  <p className="prompt-preview">
                    Prompt: <span>{topic}, {platform} post, {tone} style</span>
                  </p>
                </div>

                <button
                  className="generate-btn"
                  onClick={handleImageGenerate}
                  disabled={imageGenLoading}
                  style={{ marginBottom: '1rem' }}
                >
                  {imageGenLoading ? '⏳ Generating Image...' : '🎨 Generate Image'}
                </button>

                {imageGenError && <div className="gen-error">{imageGenError}</div>}

                {imageGenLoading && (
                  <div className="imagegen-loading">
                    <div className="spinner"></div>
                    <p>AI is creating your image...</p>
                    <small>This may take 20-30 seconds</small>
                  </div>
                )}

                {generatedImage && (
                  <div className="imagegen-result">
                    <img src={generatedImage} alt="AI Generated" className="generated-image" />
                    <a href={generatedImage} download="socialgenai-image.png" className="action-btn primary" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', textDecoration: 'none', padding: '0.75rem', borderRadius: '8px' }}>
                      ⬇️ Download Image
                    </a>
                  </div>
                )}
              </div>
            )}
                    <div className="result-section">
                      <label>📝 Caption</label>
                      <p className="result-text">{result.caption}</p>
                    </div>
                    <div className="result-section">
                      <label>🏷️ Hashtags</label>
                      <div className="hashtag-list">
                        {result.hashtags.map((tag, i) => (
                          <span key={i} className="hashtag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="result-section">
                      <label>📣 Call to Action</label>
                      <p className="result-cta">{result.callToAction}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'script' && (
                  <div className="result-section">
                    <label>🎬 Video Script (30-60 sec)</label>
                    <p className="result-text script-text">{result.script}</p>
                  </div>
                )}

                {activeTab === 'hooks' && (
                  <div>
                    <div className="result-section">
                      <label>🪝 Trending Hooks</label>
                      {result.hooks?.map((hook, i) => (
                        <div key={i} className="hook-item">{hook}</div>
                      ))}
                    </div>
                    <div className="result-section">
                      <label>💡 Post Ideas</label>
                      <ul className="ideas-list">
                        {result.postIdeas?.map((idea, i) => (
                          <li key={i}>{idea}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'trending' && (
                  <div>
                    <div className="result-section">
                      <label>🔥 Trending Topics</label>
                      {result.trendingTopics?.map((topic, i) => (
                        <div key={i} className="trending-item">#{topic}</div>
                      ))}
                    </div>
                    <div className="result-section">
                      <label>🚀 Viral Suggestions</label>
                      {result.viralSuggestions?.map((idea, i) => (
                        <div key={i} className="viral-item">
                          <span className="viral-dot"></span>{idea}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'timing' && result.postingTime && (
                  <div>
                    <div className="timing-card">
                      <div className="timing-item">
                        <span className="timing-label">⏰ Best Time to Post</span>
                        <span className="timing-value">{result.postingTime.best}</span>
                      </div>
                      <div className="timing-item">
                        <span className="timing-label">📈 Peak Traffic Time</span>
                        <span className="timing-value">{result.postingTime.peak}</span>
                      </div>
                      <div className="timing-item">
                        <span className="timing-label">📅 Highest Traffic Days</span>
                        <span className="timing-value">{result.postingTime.traffic}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="result-actions">
                <button className="action-btn" onClick={handleCopy}>
                  {copied ? '✅ Copied!' : '📋 Copy'}
                </button>
                <button className="action-btn primary" onClick={handleSave} disabled={saved}>
                  {saved ? '✅ Saved' : '💾 Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generator;