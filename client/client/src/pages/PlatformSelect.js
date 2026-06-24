import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PlatformSelect.css';

const platforms = [
  {
    id: 'Instagram',
    icon: '📸',
    name: 'Instagram',
    desc: 'Reels, Stories & Posts',
    color: '#e1306c',
    bg: '#2a0a1a'
  },
  {
    id: 'Twitter',
    icon: '🐦',
    name: 'Twitter / X',
    desc: 'Tweets & Threads',
    color: '#1da1f2',
    bg: '#0a1a2a'
  },
  {
    id: 'LinkedIn',
    icon: '💼',
    name: 'LinkedIn',
    desc: 'Professional Content',
    color: '#0077b5',
    bg: '#0a1520'
  },
  {
    id: 'Facebook',
    icon: '👥',
    name: 'Facebook',
    desc: 'Posts & Campaigns',
    color: '#1877f2',
    bg: '#0a1020'
  }
];

const PlatformSelect = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (platformId) => {
    navigate(`/generate/${platformId}`);
  };

  return (
    <div className="platform-page">
      <nav className="navbar">
        <span className="navbar-brand">⚡ SocialGenAI</span>
        <div className="navbar-links">
          <span className="navbar-user">Hi, {user?.name}</span>
          <button className="nav-link" onClick={() => navigate('/history')}>History</button>
          <button className="btn btn-outline" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="platform-container">
        <div className="platform-header">
          <h1>Choose Your Platform</h1>
          <p>Select the social media platform you want to create content for</p>
        </div>

        <div className="platform-grid">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="platform-card"
              style={{ '--platform-color': platform.color, '--platform-bg': platform.bg }}
              onClick={() => handleSelect(platform.id)}
            >
              <div className="platform-icon">{platform.icon}</div>
              <h3>{platform.name}</h3>
              <p>{platform.desc}</p>
              <div className="platform-arrow">→</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformSelect;