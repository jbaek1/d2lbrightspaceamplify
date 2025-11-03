import React from 'react';

const ResultsSection = ({
  results,
  onPublishToBrightspace,
  onCreateModule,
  onGenerateQuiz,
  onCreateAssignment,
  onPreviewContent,
  onExportResults,
}) => {
  if (!results) return null;

  return (
    <div className="results-section show">
      <h2>🎯 AI Analysis Results</h2>
      
      <div className="amplify-results">
        <h3>🤖 Amplify AI Analysis</h3>
        <div className="result-item">
          <h4>📊 Content Summary</h4>
          <p>{results.summary || 'Content analyzed and processed'}</p>
        </div>
        <div className="result-item">
          <h4>🏷️ Extracted Topics</h4>
          <div>
            {(results.topics || ['Machine Learning', 'Data Analysis', 'Course Content']).map((topic, index) => (
              <span key={index} className="amplify-tag">{topic}</span>
            ))}
          </div>
        </div>
        <div className="result-item">
          <h4>📝 Key Insights</h4>
          <ul>
            {(results.insights || [
              'Educational content detected',
              'Suitable for course integration',
              'Contains actionable learning objectives'
            ]).map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="two-column">
        <div>
          <h3>📝 Suggested Actions</h3>
          <div className="result-item">
            <button className="btn btn-primary" onClick={onCreateModule}>
              📚 Create Course Module
            </button>
            <button className="btn btn-secondary" onClick={onGenerateQuiz}>
              ❓ Generate Quiz
            </button>
            <button className="btn btn-secondary" onClick={onCreateAssignment}>
              📝 Create Assignment
            </button>
          </div>
        </div>
        <div>
          <h3>🎓 Course Integration</h3>
          <div className="result-item">
            <button className="btn btn-success" onClick={onPublishToBrightspace}>
              🚀 Publish to Brightspace
            </button>
            <button className="btn btn-secondary" onClick={onPreviewContent}>
              👁️ Preview Content
            </button>
            <button className="btn btn-secondary" onClick={onExportResults}>
              💾 Export Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;