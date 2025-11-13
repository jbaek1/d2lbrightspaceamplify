import React, { useRef, useState } from 'react';

const FileUploadSection = ({ 
  selectedFiles, 
  onFileChange, 
  courses, 
  selectedCourse, 
  onCourseChange, 
  authStatus, 
  onProcess,
  onCreateAnnouncement,
  onCreateDiscussion,
  onUploadToBrightspace
}) => {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const newFiles = files.filter(file => {
      return !selectedFiles.find(f => f.name === file.name && f.size === file.size);
    });
    onFileChange([...selectedFiles, ...newFiles]);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    onFileChange(newFiles);
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('audio')) return '🎵';
    if (type.includes('text')) return '📝';
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
    if (type.includes('presentation') || type.includes('powerpoint')) return '📋';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-section">
      <h2>📁 Upload Files for AI Analysis</h2>
      <p>Upload documents, images, or other files to be processed by Amplify AI</p>

      <div
        className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">📁</div>
        <h3>Drop files here or click to browse</h3>
        <p>Supports: PDF, DOC, DOCX, TXT, PNG, JPG, CSV, and more</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="file-input"
        multiple
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.csv,.xlsx,.pptx"
        onChange={handleFileInputChange}
      />

      {selectedFiles.length > 0 && (
        <div className="file-list">
          {selectedFiles.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-info">
                <div className="file-icon">{getFileIcon(file.type)}</div>
                <div className="file-details">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{formatFileSize(file.size)}</div>
                </div>
              </div>
              <div className="file-actions">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeFile(index)}
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFiles.length > 0 && authStatus && (
        <div className="course-selection">
          <h3>🎓 Select Target Course</h3>
          <select
            className="course-select"
            value={selectedCourse}
            onChange={(e) => onCourseChange(e.target.value)}
          >
            <option value="">Select a course...</option>
            {courses.map((course) => (
              <option key={course.OrgUnit.Id} value={course.OrgUnit.Id}>
                {course.OrgUnit.Name} ({course.OrgUnit.Code})
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <button className="btn btn-success" onClick={onProcess}>
          🤖 Process with Amplify AI
        </button>
      )}

      {selectedFiles.length > 0 && authStatus && (
        <div className="brightspace-quick-actions">
          <h3>📋 Upload to Brightspace</h3>
          <div className="action-buttons">
            {selectedFiles.map((file, index) => (
              <button
                key={index}
                className="btn btn-primary"
                onClick={() => onUploadToBrightspace && onUploadToBrightspace(file, selectedCourse || '540221')}
              >
                📤 Upload {file.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedCourse && authStatus && (
        <div className="brightspace-quick-actions">
          <h3>📋 Quick Brightspace Actions</h3>
          <div className="action-buttons">
            <button 
              className="btn btn-primary" 
              onClick={() => onCreateAnnouncement && onCreateAnnouncement(selectedCourse)}
            >
              📰 Create Announcement
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => onCreateDiscussion && onCreateDiscussion(selectedCourse)}
            >
              💬 Create Discussion Forum
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;