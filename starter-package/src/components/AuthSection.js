import React from 'react';

const AuthSection = ({ authStatus, user, onAuthenticate }) => {
  return (
    <div className={`status-section ${authStatus ? 'connected' : 'disconnected'}`}>
      <h3>🔐 Brightspace Connection</h3>
      <p>
        {authStatus
          ? `Connected as ${user?.DisplayName || 'User'}`
          : 'Not connected to Brightspace'}
      </p>
      <button
        className="btn btn-primary"
        onClick={onAuthenticate}
        disabled={authStatus}
      >
        {authStatus ? '✅ Connected' : 'Connect to Brightspace'}
      </button>
    </div>
  );
};

export default AuthSection;