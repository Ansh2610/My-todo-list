import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();

  const getPixelAvatar = (num) => {
    const avatars = ['👾', '🤖', '👽', '🎮', '🕹️', '⚡', '🌟', '🚀'];
    return avatars[num - 1] || avatars[0];
  };

  return (
    <header className="pixel-header">
      <div className="header-container">
        <div className="header-logo">
          <span className="logo-icon">🎮</span>
          <span className="logo-text">PIXEL TODO</span>
        </div>

        <div className="header-user">
          <div className="user-info">
            <span className="user-avatar">{getPixelAvatar(user.avatar)}</span>
            <span className="user-name">{user.username}</span>
          </div>
          <button 
            className="pixel-btn danger small"
            onClick={logout}
          >
            LOGOUT
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;