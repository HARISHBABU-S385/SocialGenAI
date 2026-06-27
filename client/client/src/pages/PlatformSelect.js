import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PlatformSelect.css';
import PageTransition from '../components/PageTransition';

const platforms = [
  {
    id: 'Instagram',
    icon: '📸',
    name: 'Instagram',
    desc: 'Reels, Stories & Posts',
    color: '#e1306c',
    gradient: 'linear-gradient(135deg, #833ab4, #e1306c, #f77737)',
    bg: 'rgba(225, 48, 108, 0.08)',
    glow: 'rgba(225, 48, 108, 0.3)',
    users: '2B+ Users'
  },
  {
    id: 'Twitter',
    icon: '🐦',
    name: 'Twitter / X',
    desc: 'Tweets & Threads',
    color: '#1da1f2',
    gradient: 'linear-gradient(135deg, #1da1f2, #0d8bd9)',
    bg: 'rgba(29, 161, 242, 0.08)',
    glow: 'rgba(29, 161, 242, 0.3)',
    users: '450M+ Users'
  },
  {
    id: 'LinkedIn',
    icon: '💼',
    name: 'LinkedIn',
    desc: 'Professional Content',
    color: '#0077b5',
    gradient: 'linear-gradient(135deg, #0077b5, #005885)',
    bg: 'rgba(0, 119, 181, 0.08)',
    glow: 'rgba(0, 119, 181, 0.3)',
    users: '900M+ Users'
  },
  {
    id: 'Facebook',
    icon: '👥',
    name: 'Facebook',
    desc: 'Posts & Campaigns',
    color: '#1877f2',
    gradient: 'linear-gradient(135deg, #1877f2, #0d65d9)',
    bg: 'rgba(24, 119, 242, 0.08)',
    glow: 'rgba(24, 119, 242, 0.3)',
    users: '3B+ Users'
  }
];

const PlatformSelect = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  return (
     <PageTransition>
    <div className="platform-page">
      <nav className="ps-navbar">
        <span className="ps-brand">⚡ SocialGenAI</span>
        <div className="ps-nav-links">
          <span className="ps-user">Hi, {user?.name} 👋</span>
          <button className="ps-nav-btn" onClick={() => navigate('/history')}>History</button>
          <button className="ps-logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="platform-container">
        <div className="platform-header">
          <div className="header-badge">✨ AI-Powered Content</div>
          <h1>Choose Your Platform</h1>
          <p>Select a platform or generate AI images instantly</p>
        </div>

        <div className="platform-grid">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={`platform-card ${hoveredId === platform.id ? 'hovered' : ''}`}
              style={{
                '--platform-color': platform.color,
                '--platform-gradient': platform.gradient,
                '--platform-bg': platform.bg,
                '--platform-glow': platform.glow,
              }}
              onClick={() => navigate(`/generate/${platform.id}`)}
              onMouseEnter={() => setHoveredId(platform.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="card-glow"></div>
              <div className="card-inner">
                <div className="platform-icon-wrapper">
                  <div className="platform-icon-bg"></div>
                  <span className="platform-icon">{platform.icon}</span>
                </div>
                <div className="platform-info">
                  <h3>{platform.name}</h3>
                  <p>{platform.desc}</p>
                  <span className="platform-users">{platform.users}</span>
                </div>
                <div className="platform-arrow">→</div>
              </div>
              <div className="card-shine"></div>
            </div>
          ))}

          {/* 5th Card — AI Image Generation */}
          <div
            className={`platform-card ai-image-card ${hoveredId === 'aiimage' ? 'hovered' : ''}`}
            style={{
              '--platform-color': '#a78bfa',
              '--platform-gradient': 'linear-gradient(135deg, #7c3aed, #a78bfa, #60a5fa)',
              '--platform-bg': 'rgba(167,139,250,0.08)',
              '--platform-glow': 'rgba(167,139,250,0.3)',
            }}
            onClick={() => navigate('/imagegenerate')}
            onMouseEnter={() => setHoveredId('aiimage')}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="card-glow"></div>
            <div className="card-inner">
              <div className="platform-icon-wrapper">
                <div className="platform-icon-bg"></div>
                <span className="platform-icon">🎨</span>
              </div>
              <div className="platform-info">
                <h3>AI Image Generator</h3>
                <p>Generate stunning visuals with AI</p>
                <span className="platform-users ai-badge">✨ Powered by AI</span>
              </div>
              <div className="platform-arrow">→</div>
            </div>
            <div className="card-shine"></div>
            <div className="ai-card-glow-ring"></div>
          </div>
        </div>

        <div className="platform-footer">
          <div className="footer-stat">
            <span className="stat-number">10+</span>
            <span className="stat-label">AI Features</span>
          </div>
          <div className="footer-divider"></div>
          <div className="footer-stat">
            <span className="stat-number">5</span>
            <span className="stat-label">Platforms</span>
          </div>
          <div className="footer-divider"></div>
          <div className="footer-stat">
            <span className="stat-number">∞</span>
            <span className="stat-label">Content Ideas</span>
          </div>
        </div>
      </div>
    </div>
     </PageTransition>
  );
};

export default PlatformSelect;