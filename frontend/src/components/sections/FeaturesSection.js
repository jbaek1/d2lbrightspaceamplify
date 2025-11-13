import React from 'react';

const FeaturesSection = () => {
  return (
    <div className="features-section">
      <h3>✨ Available Features</h3>
      <div className="features-list">
        <div className="feature-item">
          <span className="feature-icon">✅</span>
          <div className="feature-content">
            <strong>News & Announcements:</strong> Course updates and important information
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">✅</span>
          <div className="feature-content">
            <strong>Discussion Forums:</strong> Topic-based discussions and Q&A sessions
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;

