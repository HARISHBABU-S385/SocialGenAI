import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateImage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ImageGenerate.css';
import PageTransition from '../components/PageTransition';

const ImageGenerate = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedImage(null);
    try {
      const fullPrompt = `${prompt}, ${style} style, high quality, professional, social media ready`;
      const res = await generateImage({ prompt: fullPrompt });
      setGeneratedImage(res.data.image);
    } catch (err) {
      setError('Image generation failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <PageTransition>
      <div className="imagegen-page">
        <nav className="navbar">
          <span className="navbar-brand">⚡ SocialGenAI</span>
          <div className="navbar-links">
            <span className="navbar-user">Hi, {user?.name}</span>
          <button className="nav-link" onClick={() => navigate('/')}>Platforms</button>
          <button className="nav-link" onClick={() => navigate('/history')}>History</button>
          <button className="btn-outline" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="imagegen-container">
        <div className="imagegen-left">
          <div className="ig-badge">🎨 AI Image Generator</div>
          <h1 className="ig-title">Create Stunning Images</h1>
          <p className="ig-subtitle">Describe your vision and let AI bring it to life</p>

          <form onSubmit={handleGenerate} className="ig-form">
            <div className="ig-form-group">
              <label>Describe your image</label>
              <textarea
                placeholder="e.g. A cozy coffee shop in Chennai at golden hour, warm lighting, people enjoying coffee, cinematic look..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="ig-form-group">
              <label>Style</label>
              <select value={style} onChange={(e) => setStyle(e.target.value)}>
                <option value="photorealistic">Photorealistic</option>
                <option value="digital art">Digital Art</option>
                <option value="cinematic">Cinematic</option>
                <option value="minimalist">Minimalist</option>
                <option value="watercolor">Watercolor</option>
                <option value="3D render">3D Render</option>
              </select>
            </div>

            <button type="submit" className="ig-generate-btn" disabled={loading}>
              {loading ? '⏳ Generating...' : '🎨 Generate Image'}
            </button>
          </form>

          {error && <div className="ig-error">{error}</div>}
        </div>

        <div className="imagegen-right">
          {!generatedImage && !loading && (
            <div className="ig-empty">
              <div className="ig-empty-icon">🎨</div>
              <h3>Your image will appear here</h3>
              <p>Describe what you want and click Generate</p>
            </div>
          )}

          {loading && (
            <div className="ig-loading">
              <div className="ig-spinner"></div>
              <p>AI is creating your image...</p>
              <small>This may take 20-40 seconds</small>
            </div>
          )}

          {generatedImage && (
            <div className="ig-result">
              <img src={generatedImage} alt="AI Generated" className="ig-image" />
              <div className="ig-result-actions">
                <a href={generatedImage} download="socialgenai-image.png" className="ig-btn primary">
                  ⬇️ Download
                </a>
                <button className="ig-btn" onClick={() => setGeneratedImage(null)}>
                  🔄 Generate New
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default ImageGenerate;