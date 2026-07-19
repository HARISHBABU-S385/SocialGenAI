import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { savePost } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Result.css';

const Result = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { result, postId, platform } = location.state || {};
  const [activeTab, setActiveTab] = useState('caption');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiImage, setAiImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  if (!result) {
    navigate('/');
    return null;
  }

  const handleSave = async () => {
    try {
      await savePost(postId);
      setSaved(true);
    } catch (err) {}
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${result.caption}\n\n${result.hashtags?.map(h => `#${h}`).join(' ')}\n\n${result.callToAction}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

    const handleGenerateImage = async () => {
    setImageLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://socialgenai-backend.onrender.com/api/imagegenerate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ prompt: `${result.caption}, ${platform}` })
      });
      const data = await res.json();
      if (data.image) {
        setAiImage(data.image);
      }
    } catch (err) {
      console.error('Image generation failed');
    }
    setImageLoading(false);
  };

  const tabs = [
    { id: 'caption', label: '📝 Caption' },
    { id: 'script', label: '🎬 Script' },
    { id: 'hooks', label: '🪝 Hooks' },
    { id: 'trending', label: '🔥 Trending' },
    { id: 'timing', label: '⏰ Timing' },
    { id: 'image', label: '🎨 AI Image' },
  ];

  return (
    <div className="result-page">
      <nav className="result-navbar">
        <span className="result-brand">⚡ SocialGenAI</span>
        <div className="result-nav-links">
          <span className="result-user">Hi, {user?.name}</span>
          <button className="result-nav-btn" onClick={() => navigate(-1)}>← Back</button>
          <button className="result-nav-btn" onClick={() => navigate('/')}>Platforms</button>
          <button className="result-nav-btn" onClick={() => navigate('/history')}>History</button>
          <button className="result-logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="result-container">
        <div className="result-header">
          {result.nicheOfDay && (
            <div className="result-niche">🎯 {result.nicheOfDay}</div>
          )}
          <h1>Your Generated Content</h1>
          <p>Platform: <span>{platform}</span></p>
          {location.state?.topic && (
  <p className="result-topic">Topic: <span>{location.state.topic}</span></p>
)}
        </div>

        <div className="result-tabs">
          {tabs.map(tab => (
            <button key={tab.id}
              className={`result-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}>
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
              <div className="result-section">
                <label>📝 Caption</label>
                <p className="result-text">{result.caption}</p>
              </div>
              <div className="result-section">
                <label>🏷️ Hashtags</label>
                <div className="result-hashtags">
                  {result.hashtags?.map((tag, i) => (
                    <span key={i} className="result-hashtag">#{tag}</span>
                  ))}
                </div>
              </div>
              <div className="result-section">
                <label>📣 Call to Action</label>
                <p className="result-cta">{result.callToAction}</p>
              </div>
              <div className="result-section">
                <label>💡 Post Ideas</label>
                <ul className="result-ideas">
                  {result.postIdeas?.map((idea, i) => (
                    <li key={i}>{idea}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="result-section">
              <label>🎬 Video Script</label>
              <p className="result-text">{result.script}</p>
            </div>
          )}

          {activeTab === 'hooks' && (
            <div className="result-section">
              <label>🪝 Trending Hooks</label>
              {result.hooks?.map((hook, i) => (
                <div key={i} className="result-hook">{hook}</div>
              ))}
            </div>
          )}

          {activeTab === 'trending' && (
            <div>
              <div className="result-section">
                <label>🔥 Trending Topics</label>
                {result.trendingTopics?.map((topic, i) => (
                  <div key={i} className="result-trending">#{topic}</div>
                ))}
              </div>
              <div className="result-section">
                <label>🚀 Viral Suggestions</label>
                {result.viralSuggestions?.map((idea, i) => (
                  <div key={i} className="result-viral">
                    <span className="result-dot"></span>{idea}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'timing' && result.postingTime && (
            <div className="result-timing">
              <div className="timing-row">
                <span>⏰ Best Time</span>
                <span>{result.postingTime.best}</span>
              </div>
              <div className="timing-row">
                <span>📈 Peak Traffic</span>
                <span>{result.postingTime.peak}</span>
              </div>
              <div className="timing-row">
                <span>📅 Best Days</span>
                <span>{result.postingTime.traffic}</span>
              </div>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="result-section">
              <label>🎨 AI Image Generator</label>
              <p style={{color:'#4a6a8a', fontSize:'0.85rem', marginBottom:'1rem'}}>
                Generate an AI image based on your content
              </p>
              <button className="result-img-btn" onClick={handleGenerateImage} disabled={imageLoading}>
                {imageLoading ? '⏳ Generating...' : '🎨 Generate Image'}
              </button>
              {aiImage && (
                <div style={{marginTop:'1rem'}}>
                  <img src={aiImage} alt="AI Generated" style={{width:'100%', borderRadius:'12px'}} />
                  <a href={aiImage} download="image.png" className="result-download">⬇️ Download</a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="result-actions">
          <button className="result-action-btn" onClick={handleCopy}>
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
          <button className="result-action-btn primary" onClick={handleSave} disabled={saved}>
            {saved ? '✅ Saved' : '💾 Save'}
          </button>
          <button className="result-action-btn" onClick={() => navigate(-1)}>
            ✨ Generate New
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;