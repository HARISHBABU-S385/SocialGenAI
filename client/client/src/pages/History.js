import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, deletePost } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './History.css';

const History = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await getPosts();
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await deletePost(id);
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === 'saved' ? posts.filter(p => p.isSaved) : posts;

  return (
    <div className="history-page">
      <nav className="navbar">
        <span className="navbar-brand">⚡ SocialGenAI</span>
        <div className="navbar-links">
          <span style={{ color: '#ccc', fontSize: '0.9rem' }}>Hi, {user?.name}</span>
          <Link to="/">Generator</Link>
          <button className="btn btn-outline" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="history-container">
        <div className="history-header">
          <h1>Content History</h1>
          <div className="filter-buttons">
            <button
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('all')}
            >
              All Posts ({posts.length})
            </button>
            <button
              className={`btn ${filter === 'saved' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('saved')}
            >
              Saved ({posts.filter(p => p.isSaved).length})
            </button>
          </div>
        </div>

        {loading && <div className="history-loading">Loading your posts...</div>}

        {!loading && filtered.length === 0 && (
          <div className="history-empty card">
            <p>No posts found. <Link to="/">Generate your first post!</Link></p>
          </div>
        )}

        <div className="history-grid">
          {filtered.map(post => (
            <div key={post._id} className="history-card card">
              <div className="history-card-header">
                <div className="history-meta">
                  <span className="platform-badge">{post.platform}</span>
                  <span className="tone-badge">{post.tone}</span>
                  {post.isSaved && <span className="saved-badge">💾 Saved</span>}
                </div>
                <button className="btn btn-danger delete-btn" onClick={() => handleDelete(post._id)}>
                  🗑️
                </button>
              </div>
              <h4 className="history-topic">{post.topic}</h4>
              <p className="history-caption">{post.caption}</p>
              <div className="history-hashtags">
                {post.hashtags.slice(0, 4).map((tag, i) => (
                  <span key={i} className="hashtag">#{tag}</span>
                ))}
              </div>
              <p className="history-date">
                {new Date(post.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;