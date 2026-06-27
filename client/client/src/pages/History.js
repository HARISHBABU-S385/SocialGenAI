import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts, deletePost } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './History.css';

const History = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await getPosts();
      setPosts(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await deletePost(id);
      setPosts(posts.filter(p => p._id !== id));
      if (selectedPost?._id === id) setSelectedPost(null);
    } catch (err) { console.error(err); }
  };

  const filtered = filter === 'saved' ? posts.filter(p => p.isSaved) : posts;

  return (
    <div className="history-page">
      <nav className="navbar">
        <span className="navbar-brand">⚡ SocialGenAI</span>
        <div className="navbar-links">
          <span className="navbar-user">Hi, {user?.name}</span>
          <button className="nav-link" onClick={() => navigate('/')}>Platforms</button>
          <button className="nav-link" onClick={() => navigate(-1)}>Generator</button>
          <button className="btn btn-outline" onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="history-layout">
        <div className="history-sidebar">
          <div className="history-header">
            <h1>History</h1>
            <div className="filter-buttons">
              <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('all')}>
                All ({posts.length})
              </button>
              <button className={`btn ${filter === 'saved' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('saved')}>
                Saved ({posts.filter(p => p.isSaved).length})
              </button>
            </div>
          </div>

          {loading && <div className="history-loading">Loading...</div>}

          {!loading && filtered.length === 0 && (
            <div className="history-empty">
              <p>No posts found. <Link to="/">Generate one!</Link></p>
            </div>
          )}

          <div className="history-list">
            {filtered.map(post => (
              <div
                key={post._id}
                className={`history-item ${selectedPost?._id === post._id ? 'active' : ''}`}
                onClick={() => setSelectedPost(post)}
              >
                <div className="history-item-header">
                  <span className="platform-badge">{post.platform}</span>
                  {post.isSaved && <span className="saved-badge">💾</span>}
                  <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDelete(post._id); }}>🗑️</button>
                </div>
                <p className="history-item-topic">{post.topic}</p>
                <p className="history-item-date">
                  {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="history-detail">
          {!selectedPost ? (
            <div className="detail-empty">
              <div className="empty-icon">📋</div>
              <h3>Select a post to view</h3>
              <p>Click any post from the list to reopen it</p>
            </div>
          ) : (
            <div className="detail-content">
              <div className="detail-header">
                <div>
                  <span className="platform-badge">{selectedPost.platform}</span>
                  <span className="tone-badge">{selectedPost.tone}</span>
                </div>
                <p className="detail-date">
                  {new Date(selectedPost.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <h2 className="detail-topic">{selectedPost.topic}</h2>
     {selectedPost.imageUrl && (
  <div className="detail-section">
    <label>🎨 Saved Image</label>
    <img src={selectedPost.imageUrl} alt="saved" style={{width:'100%', borderRadius:'10px'}} />
  </div>
)}         
              <div className="detail-section">
                <label>📝 Caption</label>
                <p className="detail-text">{selectedPost.caption}</p>
              </div>

              <div className="detail-section">
                <label>🏷️ Hashtags</label>
                <div className="hashtag-list">
                  {selectedPost.hashtags.map((tag, i) => (
                    <span key={i} className="hashtag">#{tag}</span>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <label>📣 Call to Action</label>
                <p className="detail-cta">{selectedPost.callToAction}</p>
              </div>

              <div className="detail-section">
                <label>💡 Post Ideas</label>
                <ul className="ideas-list">
                  {selectedPost.postIdeas?.map((idea, i) => (
                    <li key={i}>{idea}</li>
                  ))}
                </ul>
              </div>

              <div className="detail-actions">
                <button className="action-btn" onClick={() => {
                  navigator.clipboard.writeText(`${selectedPost.caption}\n\n${selectedPost.hashtags.map(h => `#${h}`).join(' ')}\n\n${selectedPost.callToAction}`);
                }}>
                  📋 Copy
                </button>
                <button className="action-btn primary" onClick={() => navigate(`/generate/${selectedPost.platform}`)}>
                  ✨ Generate Similar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;