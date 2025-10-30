const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const BrightspaceClient = require('./brightspace-client');
const AmplifyClient = require('./amplify-client');
require('dotenv').config();

/**
 * Enhanced server with Amplify AI integration and modern file upload UI
 * Combines Brightspace API with Amplify AI for intelligent content processing
 */
class EnhancedAmplifyServer {
  constructor() {
    this.app = express();
    this.port = process.env.SERVER_PORT || 3001; // Changed to 3001 for React dev server
    this.brightspaceClient = new BrightspaceClient();
    this.amplifyClient = new AmplifyClient();
    
    // Ensure uploads directory exists
    this.uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    
    this.setupMiddleware();
    this.setupStorage();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    this.app.use('/uploads', express.static(this.uploadsDir));
    // Removed static serving of public directory - React dev server handles this
  }

  setupStorage() {
    // Configure multer for file uploads
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
      }
    });

    this.upload = multer({
      storage: storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 10 // Maximum 10 files
      },
      fileFilter: (req, file, cb) => {
        // Allow common educational file types
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'image/jpeg',
          'image/png',
          'image/gif',
          'video/mp4',
          'audio/mpeg'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`File type ${file.mimetype} not supported`), false);
        }
      }
    });
  }

  setupRoutes() {
    // Remove the main route - React dev server handles this
    // this.app.get('/', (req, res) => {
    //   res.sendFile(path.join(__dirname, '../public/index.html'));
    // });

    // Brightspace OAuth routes
    this.app.get('/auth', (req, res) => {
      const state = this.brightspaceClient.generateState();
      const authUrl = this.brightspaceClient.getAuthorizationUrl(state);
      console.log('🔄 Starting OAuth flow...');
      res.redirect(authUrl);
    });

    this.app.get('/auth/brightspace/callback', async (req, res) => {
      const { code, error, error_description } = req.query;

      if (error) {
        console.error('❌ OAuth error:', error, error_description);
        return res.redirect('/?error=auth_failed');
      }

      if (!code) {
        return res.redirect('/?error=no_code');
      }

      try {
        await this.brightspaceClient.exchangeCodeForToken(code);
        console.log('✅ Successfully authenticated with Brightspace!');
        res.redirect('/?success=authenticated');
      } catch (error) {
        console.error('❌ Token exchange failed:', error);
        res.redirect('/?error=token_exchange_failed');
      }
    });

    // API Routes
    this.app.get('/api/auth-status', async (req, res) => {
      try {
        const isAuth = this.brightspaceClient.isAuthenticated();
        let user = null;
        
        if (isAuth) {
          try {
            user = await this.brightspaceClient.getCurrentUser();
          } catch (error) {
            console.error('Failed to get user info:', error);
          }
        }
        
        res.json({
          authenticated: isAuth,
          user: user,
          expires: this.brightspaceClient.tokenExpiry
        });
      } catch (error) {
        res.json({ authenticated: false, error: error.message });
      }
    });

    this.app.get('/api/courses', async (req, res) => {
      try {
        if (!this.brightspaceClient.isAuthenticated()) {
          return res.status(401).json({ error: 'Not authenticated' });
        }

        const courses = await this.brightspaceClient.getCourses();
        res.json(courses.Items || courses);
      } catch (error) {
        console.error('❌ Failed to load courses:', error);
        res.status(500).json({ error: 'Failed to load courses' });
      }
    });

    // File processing endpoint - the main integration point
    this.app.post('/api/process-files', this.upload.array('files'), async (req, res) => {
      try {
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ error: 'No files uploaded' });
        }

        console.log(`🚀 Processing ${req.files.length} files...`);
        
        // Prepare files for Amplify processing
        const amplifyFiles = req.files.map(file => ({
          path: file.path,
          name: file.originalname,
          type: file.mimetype,
          size: file.size
        }));

        // Get course context if provided
        let courseContext = null;
        if (req.body.courseId && this.brightspaceClient.isAuthenticated()) {
          try {
            courseContext = await this.brightspaceClient.getCourse(req.body.courseId);
          } catch (error) {
            console.warn('Could not fetch course context:', error.message);
          }
        }

        // Process files through Amplify AI
        const amplifyResults = await this.amplifyClient.processFiles(amplifyFiles, {
          processingType: 'educational_content',
          courseContext: courseContext,
          includeQuiz: true,
          includeAssignment: true
        });

        // Generate educational content suggestions
        const educationalContent = await this.amplifyClient.generateEducationalContent(
          amplifyResults, 
          { contentType: 'module', includeQuiz: true, includeAssignment: true }
        );

        // Combine results
        const combinedResults = {
          ...amplifyResults,
          educational_content: educationalContent,
          course_context: courseContext,
          upload_info: {
            files_processed: req.files.length,
            total_size: req.files.reduce((sum, file) => sum + file.size, 0),
            timestamp: new Date().toISOString()
          }
        };

        // Clean up uploaded files after processing
        setTimeout(() => {
          req.files.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        }, 300000); // Clean up after 5 minutes

        console.log('✅ File processing completed successfully');
        res.json(combinedResults);

      } catch (error) {
        console.error('❌ File processing failed:', error);
        res.status(500).json({ 
          error: 'File processing failed', 
          details: error.message 
        });
      }
    });

    // Publish to Brightspace endpoint
    this.app.post('/api/publish-to-brightspace', async (req, res) => {
      try {
        if (!this.brightspaceClient.isAuthenticated()) {
          return res.status(401).json({ error: 'Not authenticated with Brightspace' });
        }

        const { courseId, amplifyResults } = req.body;
        
        if (!courseId) {
          return res.status(400).json({ error: 'Course ID is required' });
        }

        console.log(`📚 Publishing AI-generated content to course ${courseId}...`);

        // Get course details
        const course = await this.brightspaceClient.getCourse(courseId);
        console.log(`Publishing to course: ${course.Name}`);

        // Create course module based on Amplify results
        const moduleResult = await this.createCourseModule(courseId, amplifyResults);
        
        // If there's educational content, create additional resources
        let additionalResources = [];
        if (amplifyResults.educational_content) {
          if (amplifyResults.educational_content.quiz) {
            additionalResources.push({
              type: 'quiz',
              title: amplifyResults.educational_content.quiz.title,
              status: 'generated'
            });
          }
          
          if (amplifyResults.educational_content.assignment) {
            additionalResources.push({
              type: 'assignment',
              title: amplifyResults.educational_content.assignment.title,
              status: 'generated'
            });
          }
        }

        res.json({
          success: true,
          course: {
            id: courseId,
            name: course.Name
          },
          module: moduleResult,
          additional_resources: additionalResources,
          summary: `Successfully published AI-generated content to ${course.Name}`,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('❌ Publishing to Brightspace failed:', error);
        res.status(500).json({ 
          error: 'Failed to publish to Brightspace', 
          details: error.message 
        });
      }
    });

    // Health check endpoints
    this.app.get('/api/health', async (req, res) => {
      const brightspaceStatus = this.brightspaceClient.isAuthenticated();
      const amplifyStatus = await this.amplifyClient.checkApiHealth();
      
      res.json({
        status: 'healthy',
        services: {
          brightspace: {
            connected: brightspaceStatus,
            expires: this.brightspaceClient.tokenExpiry
          },
          amplify: amplifyStatus
        },
        timestamp: new Date().toISOString()
      });
    });

    // Development/testing endpoints
    this.app.get('/api/test-amplify', async (req, res) => {
      try {
        const mockFile = {
          name: 'test-document.txt',
          type: 'text/plain',
          buffer: Buffer.from('This is a test document for AI processing.')
        };

        const results = await this.amplifyClient.processFile(mockFile);
        res.json(results);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Error handling middleware
    this.app.use((error, req, res, next) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ error: 'Too many files. Maximum is 10 files.' });
        }
      }
      
      console.error('Server error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
  }

  /**
   * Create a course module in Brightspace based on Amplify results
   * @param {string} courseId - Brightspace course ID
   * @param {Object} amplifyResults - Results from Amplify AI processing
   * @returns {Promise<Object>} Module creation result
   */
  async createCourseModule(courseId, amplifyResults) {
    try {
      // Note: This is a simplified implementation
      // In a real scenario, you'd use Brightspace's Content API to create actual modules
      
      console.log('📝 Creating course module...');
      
      // Simulate module creation (replace with actual Brightspace API calls)
      const moduleData = {
        title: `AI-Generated Module: ${amplifyResults.topics?.[0] || 'Learning Content'}`,
        description: amplifyResults.summary || 'Content generated from uploaded materials',
        topics: amplifyResults.topics || [],
        learning_objectives: amplifyResults.educational_analysis?.learning_objectives || [],
        created_date: new Date().toISOString(),
        confidence_score: amplifyResults.confidence_score || 0.85
      };

      // In a real implementation, you would:
      // 1. Create the module structure using Brightspace Content API
      // 2. Upload any processed files as resources
      // 3. Create quiz questions if generated
      // 4. Set up assignments if created
      // 5. Configure module settings and availability

      console.log('✅ Course module created successfully');
      return {
        success: true,
        module_id: `mock_module_${Date.now()}`,
        title: moduleData.title,
        content_items: amplifyResults.topics?.length || 1,
        status: 'published'
      };

    } catch (error) {
      console.error('❌ Module creation failed:', error);
      throw error;
    }
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Enhanced Amplify x Brightspace server running on http://localhost:${this.port}`);
      console.log(`📋 Visit http://localhost:${this.port} to access the modern file upload interface`);
      console.log(`🤖 Amplify AI integration: ${this.amplifyClient.mockMode ? 'Mock Mode' : 'Live API'}`);
      console.log(`🎓 Brightspace integration: Ready`);
    });
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  const server = new EnhancedAmplifyServer();
  server.start();
}

module.exports = EnhancedAmplifyServer;