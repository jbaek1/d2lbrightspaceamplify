import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUploadSection from './components/FileUploadSection';
import AuthSection from './components/AuthSection';
import ProcessingIndicator from './components/ProcessingIndicator';
import ResultsSection from './components/ResultsSection';
import Notification from './components/Notification';

function App() {
  const [authStatus, setAuthStatus] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle OAuth redirect messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'authenticated') {
      showNotification('Successfully connected to Brightspace!', 'success');
      // Refresh auth status to update UI
      checkAuthStatus();
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      let errorMessage = 'Authentication failed';
      switch (error) {
        case 'auth_failed':
          errorMessage = 'Brightspace authentication failed';
          break;
        case 'no_code':
          errorMessage = 'No authorization code received';
          break;
        case 'token_exchange_failed':
          errorMessage = 'Token exchange failed';
          break;
        default:
          errorMessage = 'Authentication error occurred';
      }
      showNotification(errorMessage, 'error');
      // Clean up URL parameters
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

  const handleAuthentication = () => {
    window.location.href = 'http://localhost:3001/auth';
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

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  const createCourseModule = () => {
    showNotification('Creating course module...', 'info');
  };

  const generateQuiz = () => {
    showNotification('Generating quiz from content...', 'info');
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

        <FileUploadSection
          selectedFiles={selectedFiles}
          onFileChange={handleFileChange}
          courses={courses}
          selectedCourse={selectedCourse}
          onCourseChange={handleCourseChange}
          authStatus={authStatus}
          onProcess={processFiles}
        />

        <ProcessingIndicator isProcessing={isProcessing} />

        <ResultsSection
          results={results}
          onPublishToBrightspace={publishToBrightspace}
          onCreateModule={createCourseModule}
          onGenerateQuiz={generateQuiz}
          onCreateAssignment={createAssignment}
          onPreviewContent={previewContent}
          onExportResults={exportResults}
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