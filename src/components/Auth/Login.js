import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForm.css';

function Login({ onSwitch }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(
      formData.username,
      formData.password,
      formData.rememberMe
    );

    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form className="auth-form pixel-card" onSubmit={handleSubmit}>
      <h2 className="auth-title">PLAYER LOGIN</h2>
      
      {error && <div className="pixel-error">{error}</div>}
      
      <div className="form-group">
        <label className="pixel-label">USERNAME/EMAIL</label>
        <input
          type="text"
          name="username"
          className="pixel-input"
          value={formData.username}
          onChange={handleChange}
          required
          autoComplete="username"
        />
      </div>

      <div className="form-group">
        <label className="pixel-label">PASSWORD</label>
        <input
          type="password"
          name="password"
          className="pixel-input"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />
      </div>

      <div className="form-group checkbox-group">
        <label className="pixel-checkbox">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          <span className="checkbox-custom"></span>
          <span>REMEMBER ME</span>
        </label>
      </div>

      <button 
        type="submit" 
        className="pixel-btn success full-width"
        disabled={loading}
      >
        {loading ? 'LOADING...' : 'START GAME'}
      </button>

      <div className="auth-switch">
        <span>NEW PLAYER?</span>
        <button 
          type="button" 
          className="link-btn"
          onClick={onSwitch}
        >
          CREATE ACCOUNT
        </button>
      </div>
    </form>
  );
}

export default Login;