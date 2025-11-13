import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUploadSection from './components/sections/FileUploadSection';
import AuthSection from './components/sections/AuthSection';
import ProcessingIndicator from './components/ui/ProcessingIndicator';
import ResultsSection from './components/sections/ResultsSection';
import Notification from './components/ui/Notification';
import FeaturesSection from './components/sections/FeaturesSection';
import BrightspaceActionsSection from './components/sections/BrightspaceActionsSection';
import ActivityLog from './components/sections/ActivityLog';

function App() {
  const [authStatus, setAuthStatus] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [activityLogs, setActivityLogs] = useState([]);

  // Notification helper function
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  // Activity log helper function
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setActivityLogs(prev => [...prev, { timestamp, message }]);
  };

  // Check authentication status on component mount and after OAuth redirect
  useEffect(() => {
    checkAuthStatus();
    
    // Check for OAuth callback parameters in URL
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get('auth');
    
    if (authParam === 'success') {
      showNotification('✅ Successfully connected to Brightspace!', 'success');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Refresh auth status
      checkAuthStatus();
    } else if (authParam === 'error') {
      const errorMessage = urlParams.get('message') || 'Authentication failed';
      showNotification('❌ ' + decodeURIComponent(errorMessage), 'error');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Load courses when authenticated
  useEffect(() => {
    if (authStatus) {
      loadCourses();
    }
  }, [authStatus]);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/auth-status');
      const data = response.data;
      setAuthStatus(data.authenticated);
      setUser(data.user);
    } catch (error) {
      console.error('Auth status check failed:', error);
      setAuthStatus(false);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await axios.get('/api/courses');
      setCourses(response.data);
    } catch (error) {
      showNotification('Failed to load courses', 'error');
      console.error('Course loading error:', error);
    }
  };

  const handleAuthentication = async () => {
    try {
      // Get the authorization URL from the backend
      const response = await axios.get('/api/auth-url');
      if (response.data.authUrl) {
        // Redirect to Brightspace OAuth
        window.location.href = response.data.authUrl;
      } else {
        showNotification('Failed to get authentication URL', 'error');
      }
    } catch (error) {
      console.error('Auth URL fetch error:', error);
      showNotification('Failed to connect to authentication service', 'error');
    }
  };

  const handleFileChange = (files) => {
    setSelectedFiles(files);
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId);
  };

  const processFiles = async () => {
    if (selectedFiles.length === 0) {
      showNotification('Please select files first', 'error');
      return;
    }

    setIsProcessing(true);
    setResults(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      if (selectedCourse) {
        formData.append('courseId', selectedCourse);
      }

      const response = await axios.post('/api/process-files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResults(response.data);
      showNotification('Files processed successfully!', 'success');
    } catch (error) {
      showNotification('Processing failed', 'error');
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const publishToBrightspace = async () => {
    if (!selectedCourse) {
      showNotification('Please select a course first', 'error');
      return;
    }

    showNotification('Publishing to Brightspace...', 'info');

    try {
      const response = await axios.post('/api/publish-to-brightspace', {
        courseId: selectedCourse,
        amplifyResults: results,
      });

      showNotification('Successfully published to Brightspace!', 'success');
    } catch (error) {
      showNotification('Failed to publish to Brightspace', 'error');
      console.error('Publish error:', error);
    }
  };

  const createAssignment = () => {
    showNotification('Creating assignment...', 'info');
  };

  const previewContent = () => {
    showNotification('Opening content preview...', 'info');
  };

  const exportResults = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'amplify-analysis-results.json';
    link.click();
    showNotification('Results exported!', 'success');
  };

  const createAnnouncement = async (courseId) => {
    if (!courseId) {
      showNotification('Please select a course first', 'error');
      return;
    }

    addLog('📰 Creating test announcement...');
    showNotification('Creating announcement...', 'info');

    try {
      const response = await axios.post('/api/create-announcement', {
        courseId
      });

      if (response.data.success) {
        addLog('✅ Test announcement created successfully!');
        showNotification('✅ Announcement created successfully!', 'success');
      } else {
        addLog('❌ Announcement creation failed: ' + response.data.error);
        showNotification('❌ Failed to create announcement: ' + response.data.error, 'error');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      addLog('❌ Error: ' + errorMsg);
      showNotification('❌ Error creating announcement: ' + errorMsg, 'error');
      console.error('Announcement creation error:', error);
    }
  };

  const createDiscussion = async (courseId) => {
    if (!courseId) {
      showNotification('Please select a course first', 'error');
      return;
    }

    addLog('💬 Creating test discussion forum...');
    showNotification('Creating discussion forum...', 'info');

    try {
      const response = await axios.post('/api/create-discussion', {
        courseId
      });

      if (response.data.success) {
        addLog('✅ Test discussion forum created successfully!');
        showNotification('✅ Discussion forum created successfully!', 'success');
      } else {
        addLog('❌ Discussion creation failed: ' + response.data.error);
        showNotification('❌ Failed to create discussion: ' + response.data.error, 'error');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      addLog('❌ Error: ' + errorMsg);
      showNotification('❌ Error creating discussion: ' + errorMsg, 'error');
      console.error('Discussion creation error:', error);
    }
  };

  const createSurvey = async (courseId) => {
    if (!courseId) {
      showNotification('Please select a course first', 'error');
      return;
    }

    addLog('📋 Creating test survey...');
    showNotification('Creating survey...', 'info');

    try {
      const response = await axios.post('/api/create-survey', {
        courseId
      });

      if (response.data.success) {
        addLog('✅ Test survey created successfully!');
        showNotification('✅ Survey created successfully!', 'success');
      } else {
        addLog('❌ Survey creation failed: ' + response.data.error);
        showNotification('❌ Failed to create survey: ' + response.data.error, 'error');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      addLog('❌ Error: ' + errorMsg);
      showNotification('❌ Error creating survey: ' + errorMsg, 'error');
      console.error('Survey creation error:', error);
    }
  };

  const uploadFileToBrightspace = async (file, courseId) => {
    if (!courseId) {
      const defaultCourseId = '540221';
      courseId = defaultCourseId;
    }

    addLog(`📤 Uploading ${file.name} to Brightspace...`);
    showNotification(`Uploading ${file.name} to Brightspace...`, 'info');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseId', courseId);

      const response = await axios.post('/api/upload-file-to-brightspace', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        addLog(`✅ File ${file.name} uploaded successfully!`);
        showNotification(`✅ ${file.name} uploaded to Brightspace successfully!`, 'success');
      } else {
        addLog(`❌ File upload failed: ${response.data.error}`);
        showNotification(`❌ Failed to upload file: ${response.data.error}`, 'error');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message;
      addLog(`❌ Upload error: ${errorMsg}`);
      showNotification(`❌ Error uploading file: ${errorMsg}`, 'error');
      console.error('File upload error:', error);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🚀 Amplify x Brightspace</h1>
        <p>AI-powered content creation and course management</p>
      </div>

      <div className="main-card">
        <AuthSection
          authStatus={authStatus}
          user={user}
          onAuthenticate={handleAuthentication}
        />

        <FeaturesSection />

        <BrightspaceActionsSection
          selectedCourse={selectedCourse}
          onCreateAnnouncement={createAnnouncement}
          onCreateDiscussion={createDiscussion}
          onCreateSurvey={createSurvey}
          authStatus={authStatus}
        />

        <FileUploadSection
          selectedFiles={selectedFiles}
          onFileChange={handleFileChange}
          courses={courses}
          selectedCourse={selectedCourse}
          onCourseChange={handleCourseChange}
          authStatus={authStatus}
          onProcess={processFiles}
          onCreateAnnouncement={createAnnouncement}
          onCreateDiscussion={createDiscussion}
          onUploadToBrightspace={uploadFileToBrightspace}
        />

        <ProcessingIndicator isProcessing={isProcessing} />

        <ResultsSection
          results={results}
          onPublishToBrightspace={publishToBrightspace}
          onCreateAssignment={createAssignment}
          onPreviewContent={previewContent}
          onExportResults={exportResults}
          onCreateAnnouncement={createAnnouncement}
          onCreateDiscussion={createDiscussion}
          selectedCourse={selectedCourse}
        />

        <ActivityLog 
          logs={activityLogs} 
          onClear={() => setActivityLogs([])} 
        />
      </div>

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
      />
    </div>
  );
}

export default App;