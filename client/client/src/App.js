import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import PlatformSelect from './pages/PlatformSelect';
import Generator from './pages/Generator';
import History from './pages/History';
import ImageGenerate from './pages/ImageGenerate';
import './App.css';
import ImageGen from './pages/ImageGen';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><PlatformSelect /></PrivateRoute>} />
          <Route path="/generate/:platform" element={<PrivateRoute><Generator /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/imagegenerate" element={<PrivateRoute><ImageGenerate /></PrivateRoute>} />
          <Route path="/imagegen" element={<PrivateRoute><ImageGen /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;