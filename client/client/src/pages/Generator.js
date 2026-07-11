import React, { useState } from 'react';
import './Generator.css';

const Generator = () => {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('Conversational');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const platforms = ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok'];
  const tones = ['Conversational', 'Professional', 'Humorous', 'Inspirational', 'Controversial', 'Educational'];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Ensure this endpoint matches your backend route (e.g., /api/posts or /api/generate)
      const response = await fetch('https://socialgenai-backend.onrender.com/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ topic, platform, tone })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to generate content. Please try again.');
      }
    } catch (err) {
      console.error('Generation Error:', err);
      setError('A network error occurred. Please check your connection to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generator-container">
      <h2>Viral Content Generator</h2>
      
      <form onSubmit={handleGenerate} className="generator-form">
        <div className="form-group">
          <label>What is your post about?</label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 5 ways to stay productive while working from home..."
            rows="3"
            disabled={loading}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} disabled={loading}>
              {platforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} disabled={loading}>
              {tones.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" className="generate-btn" disabled={loading}>
          {loading ? 'Analyzing Trends & Generating...' : 'Generate Viral Content'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {/* Render the structured JSON response */}
      {result && !loading && (
        <div className="results-dashboard">
          
          <div className="result-card main-caption">
            <h3>Caption</h3>
            <p className="whitespace-pre-wrap">{result.caption}</p>
            
            <div className="hashtags">
              {result.hashtags?.map((tag, i) => (
                <span key={i} className="hashtag">#{tag.replace('#', '')}</span>
              ))}
            </div>
            
            <div className="cta-box">
              <strong>Call to Action:</strong> {result.callToAction}
            </div>
            
            {result.postingTime && (
              <div className="timing-box">
                <strong>Best Time to Post:</strong> {result.postingTime.best} 
                (Peak: {result.postingTime.peak}) - <em>{result.postingTime.traffic}</em>
              </div>
            )}
          </div>

          <div className="result-card video-script">
            <h3>Video / Audio Script</h3>
            <p className="whitespace-pre-wrap">{result.script}</p>
          </div>

          <div className="result-grid">
            <div className="result-list hooks">
              <h3>Viral Hooks</h3>
              <ul>
                {result.hooks?.map((hook, i) => <li key={i}>{hook}</li>)}
              </ul>
            </div>

            <div className="result-list ideas">
              <h3>Follow-up Post Ideas</h3>
              <ul>
                {result.postIdeas?.map((idea, i) => <li key={i}>{idea}</li>)}
              </ul>
            </div>

            <div className="result-list trends">
              <h3>Trending Topics in this Niche</h3>
              <ul>
                {result.trendingTopics?.map((trend, i) => <li key={i}>{trend}</li>)}
              </ul>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default Generator;