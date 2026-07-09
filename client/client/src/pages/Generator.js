import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { generatePost, generateFromImage } from '../services/api';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');



  
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
      navigate('/result', {
        state: {
          result: res.data.data,
          postId: res.data.postId,
          platform
        }
      });
    } catch (err) {
      setError('Generation failed. Please try again.');
    }
    setLoading(false);
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
            <button className={`mode-btn ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>
              ✏️ Text Topic
            </button>
            <button className={`mode-btn ${mode === 'image' ? 'active' : ''}`} onClick={() => setMode('image')}>
              🖼️ Upload Image
            </button>
          </div>

          <form onSubmit={handleGenerate} className="generator-form">
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
                  <input id="imageInput" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                </div>
                <div className="form-group">
                  <label>Describe your image or add extra instructions</label>
                  <textarea
                    placeholder="e.g. This is a photo of my new cafe interior, focus on the cozy atmosphere..."
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
          {!loading && (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <h3>Your content will appear on next page</h3>
              <p>Fill in the form and click Generate</p>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>AI is crafting your content...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generator;