/**
 * Brightspace Content Manager - Simplified
 * 
 * Simple interface for creating Brightspace course content.
 * 
 * WORKING FEATURES:
 * - News/Announcements
 * - Discussion Forums
 * - Surveys
 * - OAuth authentication
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const https = require('https');
const multer = require('multer');

const BrightspaceContentCreator = require('./brightspace-content-creator');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Brightspace client
const brightspaceClient = new BrightspaceContentCreator();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// ==========================================
// API ROUTES FOR EXISTING FRONTEND
// ==========================================

// Auth status endpoint (matches frontend expectation)
app.get('/api/auth-status', async (req, res) => {
  try {
    const isAuthenticated = brightspaceClient.isAuthenticated();
    let user = null;
    
    if (isAuthenticated) {
      try {
        user = await brightspaceClient.getCurrentUser();
      } catch (error) {
        console.error('Failed to get user info:', error);
      }
    }
    
    res.json({
      authenticated: isAuthenticated,
      user: user
    });
  } catch (error) {
    console.error('Auth status error:', error);
    res.json({
      authenticated: false,
      user: null
    });
  }
});

// Get courses endpoint (matches frontend expectation)
app.get('/api/courses', async (req, res) => {
  try {
    if (!brightspaceClient.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const courses = await brightspaceClient.getCourses();
    res.json(courses);
  } catch (error) {
    console.error('Courses retrieval error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get auth URL endpoint (for frontend to redirect to)
app.get('/api/auth-url', (req, res) => {
  try {
    const authUrl = brightspaceClient.getAuthorizationUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stub endpoints for existing frontend functionality
app.post('/api/process-files', async (req, res) => {
  // This endpoint is expected by the frontend but may not be fully implemented
  // Return a mock response for now
  res.json({
    summary: 'Files processed successfully',
    topics: ['Sample Topic 1', 'Sample Topic 2'],
    insights: ['Content analyzed', 'Ready for integration']
  });
});

app.post('/api/publish-to-brightspace', async (req, res) => {
  // This endpoint is expected by the frontend but may not be fully implemented
  res.json({ success: true, message: 'Published to Brightspace' });
});

// ==========================================
// OAUTH ROUTES
// ==========================================

// OAuth route for existing frontend (matches frontend expectation)
app.get('/auth', (req, res) => {
  const authUrl = brightspaceClient.getAuthorizationUrl();
  res.redirect(authUrl);
});

// OAuth callback (supports both routes for compatibility)
app.get('/auth/brightspace', (req, res) => {
  const authUrl = brightspaceClient.getAuthorizationUrl();
  res.redirect(authUrl);
});

app.get('/auth/brightspace/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      throw new Error('No authorization code received');
    }
    
    await brightspaceClient.exchangeCodeForToken(code);
    // Redirect to frontend after successful auth
    // Frontend runs on port 5173, backend runs on port 3000
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?auth=success`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?auth=error&message=` + encodeURIComponent(error.message));
  }
});

// ==========================================
// CONTENT CREATION API ROUTES
// ==========================================

// Legacy status endpoint (for backward compatibility)
app.get('/status', (req, res) => {
  res.json({
    authenticated: brightspaceClient.isAuthenticated(),
    scopes: brightspaceClient.getTokenScopes()
  });
});

// Create announcement endpoint
app.post('/api/create-announcement', async (req, res) => {
  try {
    if (!brightspaceClient.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, error: 'Course ID required' });
    }
    
    // Auto-generate announcement data (no user input)
    const announcementData = {
      Title: 'API Test Announcement',
      Body: { 
        Text: 'This announcement was created via API test at ' + new Date().toLocaleString(),
        Html: '<p>This announcement was created via API test at ' + new Date().toLocaleString() + '</p>'
      },
      StartDate: new Date().toISOString(),
      EndDate: null,
      IsGlobal: false,
      IsPublished: true,
      ShowOnlyInCourseOfferings: false,
      IsAuthorInfoShown: true,
      IsPinned: false,
      IsStartDateShown: true
    };
    
    const result = await brightspaceClient.createNewsItem(courseId, announcementData);
    
    res.json({
      success: true,
      message: 'Announcement created successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Announcement creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create discussion forum endpoint
app.post('/api/create-discussion', async (req, res) => {
  try {
    if (!brightspaceClient.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, error: 'Course ID required' });
    }
    
    // Auto-generate forum data (no user input)
    const forumData = {
      Name: 'API Test Discussion Forum',
      Description: {
        Html: '<p>This discussion forum was created via API test at ' + new Date().toLocaleString() + '</p>',
        Text: 'This discussion forum was created via API test at ' + new Date().toLocaleString()
      },
      AllowAnonymous: false,
      IsLocked: false,
      IsHidden: false
    };
    
    const result = await brightspaceClient.createDiscussionForum(courseId, forumData);
    
    res.json({
      success: true,
      message: 'Discussion forum created successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Discussion creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create survey endpoint
app.post('/api/create-survey', async (req, res) => {
  try {
    if (!brightspaceClient.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, error: 'Course ID required' });
    }
    
    // Auto-generate survey data (no user input)
    const surveyData = {
      Name: 'API Test Survey',
      Description: {
        Html: '<p>This survey was created via API test at ' + new Date().toLocaleString() + '</p>',
        Text: 'This survey was created via API test at ' + new Date().toLocaleString()
      },
      Instructions: {
        Html: '<p>Please complete this test survey.</p>',
        Text: 'Please complete this test survey.'
      },
      IsActive: true,
      IsAnonymous: false,
      IsHidden: false,
      ShowResults: false
    };
    
    const result = await brightspaceClient.createSurvey(courseId, surveyData);
    
    res.json({
      success: true,
      message: 'Survey created successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Survey creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload file to Brightspace endpoint
app.post('/api/upload-file-to-brightspace', upload.single('file'), async (req, res) => {
  try {
    if (!brightspaceClient.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }
    
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, error: 'Course ID required' });
    }
    
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;
    
    console.log(`📤 Uploading file ${fileName} (${fileBuffer.length} bytes) to course ${courseId}`);
    
    const result = await brightspaceClient.uploadFileToCourse(
      courseId,
      fileBuffer,
      fileName,
      fileType
    );
    
    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: result
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({ 
      success: false, 
      error: error.message || 'File upload failed',
      details: error.response?.data || error.response?.statusText,
      status: error.response?.status,
      url: error.config?.url
    });
  }
});

// Legacy endpoints for backward compatibility
// These call the same API endpoints internally
app.post('/create-announcement', async (req, res) => {
  try {
    if (!brightspaceClient.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, error: 'Course ID required' });
    }
    
    const announcementData = {
      Title: 'API Test Announcement',
      Body: { 
        Text: 'This announcement was created via API test at ' + new Date().toLocaleString(),
        Html: '<p>This announcement was created via API test at ' + new Date().toLocaleString() + '</p>'
      },
      StartDate: new Date().toISOString(),
      EndDate: null,
      IsGlobal: false,
      IsPublished: true,
      ShowOnlyInCourseOfferings: false,
      IsAuthorInfoShown: true,
      IsPinned: false,
      IsStartDateShown: true
    };
    
    const result = await brightspaceClient.createNewsItem(courseId, announcementData);
    
    res.json({
      success: true,
      message: 'Announcement created successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Announcement creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/create-discussion', async (req, res) => {
  try {
    if (!brightspaceClient.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, error: 'Course ID required' });
    }
    
    const forumData = {
      Name: 'API Test Discussion Forum',
      Description: {
        Html: '<p>This discussion forum was created via API test at ' + new Date().toLocaleString() + '</p>',
        Text: 'This discussion forum was created via API test at ' + new Date().toLocaleString()
      },
      AllowAnonymous: false,
      IsLocked: false,
      IsHidden: false
    };
    
    const result = await brightspaceClient.createDiscussionForum(courseId, forumData);
    
    res.json({
      success: true,
      message: 'Discussion forum created successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Discussion creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/create-survey', async (req, res) => {
  try {
    if (!brightspaceClient.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, error: 'Course ID required' });
    }
    
    const surveyData = {
      Name: 'API Test Survey',
      Description: {
        Html: '<p>This survey was created via API test at ' + new Date().toLocaleString() + '</p>',
        Text: 'This survey was created via API test at ' + new Date().toLocaleString()
      },
      Instructions: {
        Html: '<p>Please complete this test survey.</p>',
        Text: 'Please complete this test survey.'
      },
      IsActive: true,
      IsAnonymous: false,
      IsHidden: false,
      ShowResults: false
    };
    
    const result = await brightspaceClient.createSurvey(courseId, surveyData);
    
    res.json({
      success: true,
      message: 'Survey created successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Survey creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// START SERVER
// ==========================================

async function startServer() {
  try {
    // Check for SSL certificates
    const certPath = './certs/localhost-cert.pem';
    const keyPath = './certs/localhost-key.pem';
    
    const cert = await fs.readFile(certPath);
    const key = await fs.readFile(keyPath);
    
    const server = https.createServer({ key, cert }, app);
    
    server.listen(PORT, () => {
      console.log('🚀 Brightspace Content Manager running on https://localhost:' + PORT);
      console.log('🔐 HTTPS enabled for Brightspace OAuth');
      console.log('✨ Features: News/Announcements, Discussion Forums, Surveys');
      console.log('🚨 Accept the SSL certificate warning in your browser');
    });
    
  } catch (error) {
    console.error('Failed to start HTTPS server:', error.message);
    console.log('📋 Run "npm run generate-certs" to create SSL certificates');
    process.exit(1);
  }
}

startServer();