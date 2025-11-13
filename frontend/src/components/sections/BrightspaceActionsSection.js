import React from 'react';

const BrightspaceActionsSection = ({ 
  selectedCourse, 
  onCreateAnnouncement, 
  onCreateDiscussion,
  onCreateSurvey,
  authStatus 
}) => {
  // Fixed course ID from original interface
  const DEFAULT_COURSE_ID = '540221';
  
  // Use selected course if available, otherwise use default
  const courseId = selectedCourse || DEFAULT_COURSE_ID;
  
  if (!authStatus) {
    return null;
  }

  return (
    <>
      <div className="card">
        <h3>📰 Create Test Announcement</h3>
        <p>Click the button below to create a test announcement with auto-generated content.</p>
        <button 
          type="button" 
          className="btn btn-success" 
          onClick={() => onCreateAnnouncement(courseId)}
        >
          📰 Create Test Announcement
        </button>
      </div>

      <div className="card">
        <h3>💬 Create Test Discussion Forum</h3>
        <p>Click the button below to create a test discussion forum with auto-generated content.</p>
        <button 
          type="button" 
          className="btn btn-success" 
          onClick={() => onCreateDiscussion(courseId)}
        >
          💬 Create Test Discussion Forum
        </button>
      </div>

      <div className="card">
        <h3>📋 Create Test Survey</h3>
        <p>Click the button below to create a test survey with auto-generated content.</p>
        <button 
          type="button" 
          className="btn btn-success" 
          onClick={() => onCreateSurvey(courseId)}
        >
          📋 Create Test Survey
        </button>
      </div>
    </>
  );
};

export default BrightspaceActionsSection;

