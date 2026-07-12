import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ImageGen.css';

const ImageGenerate = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('photorealistic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [refPreview, setRefPreview] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedImage(null);
    setSaved(false);
    try {
      let finalPrompt = refPreview ? `recreate this style: ${prompt}, same mood` : prompt;
      finalPrompt += `, ${style} style, ultra realistic, 8k resolution, professional photography, cinematic lighting, highly detailed, award winning, masterpiece, sharp focus, no watermark, no text, no watermark`;
      const encodedPrompt = encodeURIComponent(finalPrompt);
      setGeneratedImage(`https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Date.now()}`);
    } catch (err) {
      setError('Generation failed. Try again.');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('https://socialgenai-backend.onrender.com/api/imagegenerate/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ imageUrl: generatedImage, prompt })
      });
      setSaved(true);
    } catch (err) { setError('Save failed.'); }
  };

  return (
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
          <p className="ig-subtitle">Describe your vision or upload an image to recreate</p>

          <form onSubmit={handleGenerate} className="ig-form">
            <div className="ig-form-group">
              <label>Describe your image</label>
              <textarea placeholder="e.g. A cozy coffee shop at golden hour..." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} required />
            </div>

            <div className="ig-form-group">
              <label>Upload image to recreate (optional)</label>
              <div className="ig-upload-area" onClick={() => document.getElementById('refImg').click()}>
                {refPreview ? (
                  <div className="ig-upload-preview">
                    <img src={refPreview} alt="ref" className="ig-ref-image" />
                    <button type="button" className="ig-remove-btn" onClick={(e) => { e.stopPropagation(); setRefPreview(null); }}>✕ Remove</button>
                  </div>
                ) : (
                  <div className="ig-upload-placeholder">
                    <span>🖼️</span>
                    <p>Click to upload reference image</p>
                    <small>JPG, PNG supported</small>
                  </div>
                )}
              </div>
              <input id="refImg" type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if(f) setRefPreview(URL.createObjectURL(f)); }} style={{ display: 'none' }} />
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
              {refPreview && (
                <div className="ig-compare">
                  <div><p className="ig-compare-label">📷 Original</p><img src={refPreview} alt="Original" className="ig-image" /></div>
                  <div><p className="ig-compare-label">✨ AI Recreated</p><img src={generatedImage} alt="Generated" className="ig-image" /></div>
                </div>
              )}
              {!refPreview && <img src={generatedImage} alt="AI Generated" className="ig-image" />}
              <div className="ig-result-actions">
                <a href={generatedImage} download="image.png" className="ig-btn primary">⬇️ Download</a>
                <button className="ig-btn" onClick={handleSave} disabled={saved}>{saved ? '✅ Saved' : '💾 Save'}</button>
                <button className="ig-btn" onClick={() => { setGeneratedImage(null); setRefPreview(null); setSaved(false); }}>🔄 New</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerate;