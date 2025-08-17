import React from 'react';
import './PixelLoader.css';

function PixelLoader() {
  return (
    <div className="pixel-loader">
      <div className="loader-container">
        <div className="loader-bar">
          <div className="loader-fill"></div>
        </div>
        <p className="loader-text">LOADING...</p>
      </div>
    </div>
  );
}

export default PixelLoader;