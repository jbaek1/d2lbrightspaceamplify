const axios = require('axios');
require('dotenv').config();

/**
 * Brightspace API Client for Amplify Integration
 * Handles OAuth authentication and API calls to Vanderbilt's Brightspace system
 */
class BrightspaceClient {
  constructor() {
    this.clientId = process.env.BRIGHTSPACE_CLIENT_ID;
    this.clientSecret = process.env.BRIGHTSPACE_CLIENT_SECRET;
    this.authUrl = process.env.BRIGHTSPACE_AUTH_URL;
    this.tokenUrl = process.env.BRIGHTSPACE_TOKEN_URL;
    this.redirectUri = process.env.BRIGHTSPACE_REDIRECT_URI;
    this.apiBaseUrl = process.env.BRIGHTSPACE_API_BASE_URL;
    
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Missing required OAuth credentials. Check your .env file.');
    }
  }

  /**
   * Generate OAuth authorization URL
   * @param {string} state - Random state parameter for security
   * @param {string[]} scopes - Array of required scopes
   * @returns {string} Authorization URL
   */
  getAuthorizationUrl(state = null, scopes = ['orgunits:course:read']) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      state: state || this.generateState()
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   * @param {string} authorizationCode - Code from OAuth callback
   * @returns {Promise<Object>} Token response
   */
  async exchangeCodeForToken(authorizationCode) {
    try {
      const response = await axios.post(this.tokenUrl, {
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        code: authorizationCode
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, refresh_token, expires_in } = response.data;
      
      this.accessToken = access_token;
      this.refreshToken = refresh_token;
      this.tokenExpiry = new Date(Date.now() + (expires_in * 1000));

      console.log('✅ Successfully obtained access token');
      return response.data;
    } catch (error) {
      console.error('❌ Token exchange failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Refresh expired access token
   * @returns {Promise<Object>} New token response
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(this.tokenUrl, {
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken
      });

      const { access_token, expires_in } = response.data;
      
      this.accessToken = access_token;
      this.tokenExpiry = new Date(Date.now() + (expires_in * 1000));

      console.log('✅ Successfully refreshed access token');
      return response.data;
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Check if access token is valid and refresh if needed
   */
  async ensureValidToken() {
    if (!this.accessToken) {
      throw new Error('No access token available. Complete OAuth flow first.');
    }

    if (this.tokenExpiry && new Date() >= this.tokenExpiry) {
      console.log('🔄 Token expired, refreshing...');
      await this.refreshAccessToken();
    }
  }

  /**
   * Make authenticated API call to Brightspace
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {string} method - HTTP method
   * @param {Object} data - Request body data
   * @returns {Promise<Object>} API response
   */
  async apiCall(endpoint, method = 'GET', data = null) {
    await this.ensureValidToken();

    const url = `${this.apiBaseUrl}${endpoint}`;
    const config = {
      method,
      url,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`❌ API call failed: ${method} ${endpoint}`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get current user information
   * @returns {Promise<Object>} User data
   */
  async getCurrentUser() {
    return await this.apiCall('/lp/1.0/users/whoami');
  }

  /**
   * Get list of courses user has access to
   * @returns {Promise<Object>} Courses data
   */
  async getCourses() {
    return await this.apiCall('/lp/1.0/enrollments/myenrollments/');
  }

  /**
   * Get specific course information
   * @param {number} courseId - Brightspace course ID
   * @returns {Promise<Object>} Course data
   */
  async getCourse(courseId) {
    return await this.apiCall(`/lp/1.0/courses/${courseId}`);
  }

  /**
   * Get course content structure
   * @param {number} courseId - Brightspace course ID
   * @returns {Promise<Object>} Course content
   */
  async getCourseContent(courseId) {
    return await this.apiCall(`/le/1.0/${courseId}/content/`);
  }

  /**
   * Generate random state parameter for OAuth
   * @returns {string} Random state string
   */
  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Check if client is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!this.accessToken && (!this.tokenExpiry || new Date() < this.tokenExpiry);
  }
}

module.exports = BrightspaceClient;