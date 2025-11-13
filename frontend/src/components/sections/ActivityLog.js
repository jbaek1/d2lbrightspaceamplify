import React, { useEffect, useRef } from 'react';

const ActivityLog = ({ logs = [], onClear }) => {
  const logOutputRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new logs are added
    if (logOutputRef.current) {
      logOutputRef.current.scrollTop = logOutputRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLog = () => {
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="activity-log-section">
      <div className="log-header">
        <h3>📝 Activity Log</h3>
        <button className="btn btn-warning btn-sm" onClick={clearLog}>
          🗑️ Clear Log
        </button>
      </div>
      <div className="log-output" ref={logOutputRef}>
        {logs.length === 0 ? (
          <p className="log-empty">Ready to create content...</p>
        ) : (
          logs.map((entry, index) => (
            <div key={index} className="log-entry">
              <span className="log-timestamp">[{entry.timestamp}]</span>
              <span className="log-message">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog;

