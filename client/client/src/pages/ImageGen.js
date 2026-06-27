import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateImage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ImageGen.css';

const ImageGen = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  
  // Existing state
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // NEW: State for the reference image upload
  const [refPreview, setRefPreview] = useState(null);
  const [refFile, setRefFile] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setImage(null);
    try {
      // Note: If your backend needs the image, you'll want to send refFile as FormData here later
      const res = await generateImage({ prompt });
      setImage(res.data.image);
    } catch (err) {
      setError('Generation failed. Try again in 30 seconds.');
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
                  placeholder="e.g. A stunning coffee shop interior with warm lighting, wooden decor, cozy atmosphere, professional photography style..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              {/* === NEW IMAGE UPLOAD SNIPPET ADDED HERE === */}
              <div className="ig-form-group">
                <label>Or upload an image to recreate</label>
                <div 
                  className="ig-upload-area" 
                  onClick={() => document.getElementById('refImg').click()}
                  style={{ cursor: 'pointer', border: '2px dashed #ccc', padding: '20px', textAlign: 'center', borderRadius: '8px' }} // Added some inline styles to make it look clickable, remove if you have CSS for .ig-upload-area
                >
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
                    if(file) {
                      setRefPreview(URL.createObjectURL(file));
                      setRefFile(file); // Saves the actual file to state so you can send it to your backend
                    }
                  }} 
                  style={{display:'none'}} 
                />
              </div>
              {/* === END NEW IMAGE UPLOAD SNIPPET === */}

              <div className="ig-tips">
                <p>💡 Tips for better results:</p>
                <ul>
                  <li>Be specific about colors, style, mood</li>
                  <li>Add "professional photography" for realistic images</li>
                  <li>Mention the platform (Instagram post, LinkedIn banner)</li>
                </ul>
              </div>

              <button type="submit" className="ig-btn" disabled={loading}>
                {loading ? '⏳ Generating... (30-60 sec)' : '🎨 Generate Image'}
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
                <img src={image} alt="AI Generated" className="ig-image" />
                <div className="ig-result-actions">
                  <a href={image} download="socialgenai-image.png" className="ig-download-btn">
                    ⬇️ Download Image
                  </a>
                  <button className="ig-regen-btn" onClick={() => setImage(null)}>
                    🔄 Generate Another
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