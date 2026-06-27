import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ImageGen.css';

const ImageGen = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refPreview, setRefPreview] = useState(null);

const handleGenerate = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setImage(null);
  try {
    let finalPrompt = prompt;
    if (refPreview) {
      finalPrompt = `recreate this image style: ${prompt}, same composition and mood`;
    }
   finalPrompt += ', ultra realistic, 8k, professional photography, clean background, no watermark';
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;
    setImage(imageUrl);
  } catch (err) {
    setError('Generation failed. Try again.');
  }
  setLoading(false);
};
  return (
    <div className="imagegen-page">
      <nav className="ig-navbar">
        <span className="ig-brand">⚡ SocialGenAI</span>
        <div className="ig-nav-links">
          <span className="ig-user">Hi, {user?.name}</span>
          <button className="ig-nav-btn" onClick={() => navigate('/')}>Platforms</button>
          <button className="ig-nav-btn" onClick={() => navigate('/history')}>History</button>
          <button className="ig-logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="ig-container">
        <div className="ig-header">
          <div className="ig-badge">🎨 AI Image Generator</div>
          <h1>Generate AI Images</h1>
          <p>Describe your image and AI will create it for your social media posts</p>
        </div>

        <div className="ig-layout">
          <div className="ig-left">
            <form onSubmit={handleGenerate} className="ig-form">
              <div className="ig-form-group">
                <label>Describe your image</label>
                <textarea
                  placeholder="e.g. A stunning coffee shop interior with warm lighting..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="ig-form-group">
                <label>Or upload an image to recreate</label>
                <div className="ig-upload-area" onClick={() => document.getElementById('refImg').click()}>
                  {refPreview ? (
                    <img src={refPreview} alt="ref" style={{maxHeight:'120px', borderRadius:'8px'}} />
                  ) : (
                    <div>
                      <span style={{fontSize:'2rem'}}>🖼️</span>
                      <p>Click to upload reference image</p>
                    </div>
                  )}
                </div>
                <input
                  id="refImg"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if(file) setRefPreview(URL.createObjectURL(file));
                  }}
                  style={{display:'none'}}
                />
              </div>

              <div className="ig-tips">
                <p>💡 Tips for better results:</p>
                <ul>
                  <li>Be specific about colors, style, mood</li>
                  <li>Add "professional photography" for realistic images</li>
                  <li>Mention the platform (Instagram post, LinkedIn banner)</li>
                </ul>
              </div>

              <button type="submit" className="ig-btn" disabled={loading}>
                {loading ? '⏳ Generating...' : '🎨 Generate Image'}
              </button>
            </form>

            {error && <div className="ig-error">{error}</div>}
          </div>

          <div className="ig-right">
            {!image && !loading && (
              <div className="ig-empty">
                <div className="ig-empty-icon">🎨</div>
                <h3>Your image will appear here</h3>
                <p>Describe your image and click Generate</p>
              </div>
            )}

            {loading && (
              <div className="ig-loading">
                <div className="ig-spinner"></div>
                <h3>AI is creating your image...</h3>
                <p>This takes 30-60 seconds</p>
              </div>
            )}

            {image && (
  <div className="ig-result">
    {refPreview && (
      <div className="ig-compare">
        <div>
          <p className="ig-compare-label">Original</p>
          <img src={refPreview} alt="Original" className="ig-image" />
        </div>
        <div>
          <p className="ig-compare-label">AI Recreated</p>
          <img src={image} alt="AI Generated" className="ig-image" />
        </div>
      </div>
    )}
    {!refPreview && <img src={image} alt="AI Generated" className="ig-image" />}
    <div className="ig-result-actions">
      <a href={image} download="socialgenai-image.png" className="ig-download-btn">⬇️ Download</a>
      <button className="ig-regen-btn" onClick={() => { setImage(null); setRefPreview(null); }}>🔄 Generate Another</button>
      <button className="ig-save-btn" onClick={handleSave} disabled={saved}>
        {saved ? '✅ Saved' : '💾 Save Image'}
      </button>
    </div>
  </div>
)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGen;
