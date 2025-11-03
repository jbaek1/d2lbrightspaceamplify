import React from 'react';

const ProcessingIndicator = ({ isProcessing }) => {
  if (!isProcessing) return null;

  return (
    <div className="processing-indicator show">
      <div className="spinner"></div>
      <h3>🤖 AI Processing in Progress...</h3>
      <p>Amplify is analyzing your files and extracting insights</p>
    </div>
  );
};

export default ProcessingIndicator;