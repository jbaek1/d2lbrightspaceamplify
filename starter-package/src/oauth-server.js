const express = require('express');
const BrightspaceClient = require('./brightspace-client');
require('dotenv').config();

/**
 * Simple OAuth server for handling Brightspace authentication
 * This creates a web server to handle the OAuth callback
 */
class OAuthServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.client = new BrightspaceClient();
    this.setupRoutes();
  }

  setupRoutes() {
    // Serve basic HTML page
    this.app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Amplify Brightspace Integration</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .button { background: #0066cc; color: white; padding: 12px 24px; 
                         text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
                .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
                .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
                .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
                pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
            </style>
        </head>
        <body>
            <h1>🚀 Amplify Brightspace Integration</h1>
            <p>Welcome to the Brightspace API testing interface!</p>
            
            <h2>Step 1: Authenticate</h2>
            <a href="/auth" class="button">🔐 Connect to Brightspace</a>
            
            <h2>Step 2: Test API (after authentication)</h2>
            <a href="/test" class="button">🧪 Test API Calls</a>
            
            <h2>Current Status</h2>
            <p>Authentication: <strong>${this.client.isAuthenticated() ? '✅ Connected' : '❌ Not Connected'}</strong></p>
            
            ${this.client.isAuthenticated() ? 
              `<p>Token expires: <strong>${this.client.tokenExpiry?.toLocaleString() || 'Unknown'}</strong></p>` 
              : ''
            }
        </body>
        </html>
      `);
    });

    // Start OAuth flow
    this.app.get('/auth', (req, res) => {
      const state = this.client.generateState();
      const authUrl = this.client.getAuthorizationUrl(state);
      
      console.log('🔄 Starting OAuth flow...');
      console.log('Redirecting to:', authUrl);
      
      res.redirect(authUrl);
    });

    // OAuth callback handler
    this.app.get('/auth/brightspace/callback', async (req, res) => {
      const { code, error, error_description, state } = req.query;

      if (error) {
        console.error('❌ OAuth error:', error, error_description);
        res.send(`
          <div class="error">
            <h3>❌ Authentication Failed</h3>
            <p><strong>Error:</strong> ${error}</p>
            <p><strong>Description:</strong> ${error_description || 'Unknown error'}</p>
            <a href="/">← Back to Home</a>
          </div>
        `);
        return;
      }

      if (!code) {
        res.send(`
          <div class="error">
            <h3>❌ No Authorization Code</h3>
            <p>No authorization code received from Brightspace.</p>
            <a href="/">← Back to Home</a>
          </div>
        `);
        return;
      }

      try {
        console.log('🔄 Exchanging code for token...');
        const tokenData = await this.client.exchangeCodeForToken(code);
        
        console.log('✅ Successfully authenticated!');
        
        res.send(`
          <div class="success">
            <h3>✅ Successfully Connected to Brightspace!</h3>
            <p>You can now make API calls to Brightspace.</p>
            <p><strong>Access Token:</strong> ${tokenData.access_token.substring(0, 20)}...</p>
            <p><strong>Expires In:</strong> ${tokenData.expires_in} seconds</p>
            <a href="/test" class="button">🧪 Test API Calls</a>
            <a href="/">← Back to Home</a>
          </div>
        `);
      } catch (error) {
        console.error('❌ Token exchange failed:', error);
        res.send(`
          <div class="error">
            <h3>❌ Token Exchange Failed</h3>
            <p><strong>Error:</strong> ${error.message}</p>
            <pre>${JSON.stringify(error.response?.data || error, null, 2)}</pre>
            <a href="/">← Back to Home</a>
          </div>
        `);
      }
    });

    // Test API calls
    this.app.get('/test', async (req, res) => {
      if (!this.client.isAuthenticated()) {
        res.send(`
          <div class="error">
            <h3>❌ Not Authenticated</h3>
            <p>Please authenticate first before testing API calls.</p>
            <a href="/auth" class="button">🔐 Connect to Brightspace</a>
            <a href="/">← Back to Home</a>
          </div>
        `);
        return;
      }

      try {
        console.log('🧪 Testing API calls...');
        
        // Test basic API calls
        const user = await this.client.getCurrentUser();
        const courses = await this.client.getCourses();
        
        res.send(`
          <div class="success">
            <h3>✅ API Test Successful!</h3>
            
            <h4>Current User:</h4>
            <pre>${JSON.stringify(user, null, 2)}</pre>
            
            <h4>Available Courses:</h4>
            <pre>${JSON.stringify(courses, null, 2)}</pre>
            
            <a href="/">← Back to Home</a>
          </div>
        `);
      } catch (error) {
        console.error('❌ API test failed:', error);
        res.send(`
          <div class="error">
            <h3>❌ API Test Failed</h3>
            <p><strong>Error:</strong> ${error.message}</p>
            <pre>${JSON.stringify(error.response?.data || error, null, 2)}</pre>
            <a href="/">← Back to Home</a>
          </div>
        `);
      }
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 OAuth server running on http://localhost:${this.port}`);
      console.log(`📋 Visit http://localhost:${this.port} to test the integration`);
    });
  }
}

module.exports = OAuthServer;