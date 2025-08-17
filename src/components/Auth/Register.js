import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForm.css';

function Register({ onSwitch }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register(
      formData.username,
      formData.email,
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
      <h2 className="auth-title">NEW PLAYER</h2>
      
      {error && <div className="pixel-error">{error}</div>}
      
      <div className="form-group">
        <label className="pixel-label">USERNAME</label>
        <input
          type="text"
          name="username"
          className="pixel-input"
          value={formData.username}
          onChange={handleChange}
          required
          pattern="[a-zA-Z0-9_]{3,20}"
          title="3-20 characters, letters, numbers, and underscores only"
        />
      </div>

      <div className="form-group">
        <label className="pixel-label">EMAIL</label>
        <input
          type="email"
          name="email"
          className="pixel-input"
          value={formData.email}
          onChange={handleChange}
          required
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
          minLength={6}
        />
      </div>

      <div className="form-group">
        <label className="pixel-label">CONFIRM PASSWORD</label>
        <input
          type="password"
          name="confirmPassword"
          className="pixel-input"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
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
        {loading ? 'CREATING...' : 'CREATE PLAYER'}
      </button>

      <div className="auth-switch">
        <span>HAVE ACCOUNT?</span>
        <button 
          type="button" 
          className="link-btn"
          onClick={onSwitch}
        >
          LOGIN
        </button>
      </div>
    </form>
  );
}

export default Register;