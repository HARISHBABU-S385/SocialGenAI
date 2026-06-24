import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Auth = () => {
  const [isActive, setIsActive] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

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

  return (
    <div className="auth-wrapper">
      <div className={`auth-container ${isActive ? 'active' : ''}`}>

        <div className="form-box login">
          <h2>Login</h2>
          <p className="auth-subtitle">Welcome back to SocialGenAI</p>
          {loginError && <div className="auth-error">{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="auth-switch">
            Don't have an account?{' '}
            <span onClick={() => setIsActive(true)}>Register</span>
          </p>
        </div>

        <div className="form-box register">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Start generating content for free</p>
          {registerError && <div className="auth-error">{registerError}</div>}
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={registerData.name}
                onChange={handleRegisterChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
              />
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

        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <div className="brand-logo">⚡ SocialGenAI</div>
            <h1>Welcome Back!</h1>
            <p>AI-powered content for every platform</p>
            <button className="toggle-btn" onClick={() => setIsActive(true)}>
              Register
            </button>
          </div>
          <div className="toggle-panel toggle-right">
            <div className="brand-logo">⚡ SocialGenAI</div>
            <h1>Join SocialGenAI</h1>
            <p>Create stunning content with AI in seconds</p>
            <button className="toggle-btn" onClick={() => setIsActive(false)}>
              Login
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;