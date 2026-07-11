import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [isActive, setIsActive] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const res = await login(loginData);
      authLogin(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setRegisterError('');
    try {
      const res = await register(registerData);
      authLogin(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setRegisterError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://socialgenai-backend.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, newPassword: forgotPassword })
      });
      const data = await res.json();
      if (res.ok) setForgotMsg('Password updated! Please login.');
      else setForgotMsg(data.message);
    } catch (err) {
      setForgotMsg('Failed. Try again.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="floating-blobs">
  <div className="blob blob-1"></div>
  <div className="blob blob-2"></div>
  <div className="blob blob-3"></div>
  <div className="blob blob-4"></div>
  <div className="blob blob-5"></div>
  <div className="blob blob-6"></div>
</div>

      {showForgot && (
        <div className="forgot-overlay">
          <div className="forgot-box">
            <h3>Reset Password</h3>
            <form onSubmit={handleForgot}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Your email" value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" placeholder="New password" value={forgotPassword}
                  onChange={(e) => setForgotPassword(e.target.value)} required />
              </div>
              {forgotMsg && <p className="forgot-msg">{forgotMsg}</p>}
              <button type="submit" className="auth-btn">Update Password</button>
              <button type="button" className="auth-btn"
                style={{ background: 'transparent', border: '1px solid rgba(77,166,255,0.2)', marginTop: '0.5rem' }}
                onClick={() => { setShowForgot(false); setForgotMsg(''); }}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <div className={`auth-container ${isActive ? 'active' : ''}`}>

        {/* LOGIN FORM */}
        <div className="form-box login">
          <h2>Login</h2>
          <p className="auth-subtitle">Welcome back to SocialGenAI</p>
          {loginError && <div className="auth-error">{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="Enter your email"
                value={loginData.email} onChange={handleLoginChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Enter your password"
                value={loginData.password} onChange={handleLoginChange} required />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="forgot-link" onClick={() => setShowForgot(true)}>Forgot password?</p>
          <p className="auth-switch">
            Don't have an account?{' '}
            <span onClick={() => setIsActive(true)}>Register</span>
          </p>
        </div>

        {/* REGISTER FORM */}
        <div className="form-box register">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Start generating content for free</p>
          {registerError && <div className="auth-error">{registerError}</div>}
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" placeholder="Enter your name"
                value={registerData.name} onChange={handleRegisterChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="Enter your email"
                value={registerData.email} onChange={handleRegisterChange} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Create a password"
                value={registerData.password} onChange={handleRegisterChange} required />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
          <p className="auth-switch">
            Already have an account?{' '}
            <span onClick={() => setIsActive(false)}>Login</span>
          </p>
        </div>

        {/* TOGGLE PANELS */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <div className="brand-logo">⚡ SocialGenAI</div>
            <h1>Welcome Back!</h1>
            <p>AI-powered content for every platform</p>
            <button className="toggle-btn" onClick={() => setIsActive(false)}>Login</button>
          </div>
          <div className="toggle-panel toggle-right">
            <div className="brand-logo">⚡ SocialGenAI</div>
            <h1>Join SocialGenAI</h1>
            <p>Create stunning content with AI in seconds</p>
            <button className="toggle-btn" onClick={() => setIsActive(true)}>Register</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;