/**
 * Brightspace Content Creator - Production Ready
 * 
 * A clean, focused API client for creating Brightspace course content.
 * 
 * WORKING FEATURES:
 * - News/Announcements (multipart format)
 * - Discussion Forums (JSON format)
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

class BrightspaceContentCreator {
  constructor() {
    // OAuth Configuration
    this.clientId = process.env.BRIGHTSPACE_CLIENT_ID;
    this.clientSecret = process.env.BRIGHTSPACE_CLIENT_SECRET;
    this.authUrl = process.env.BRIGHTSPACE_AUTH_URL;
    this.tokenUrl = process.env.BRIGHTSPACE_TOKEN_URL;
    this.apiBaseUrl = process.env.BRIGHTSPACE_API_BASE_URL;
    this.redirectUri = process.env.BRIGHTSPACE_REDIRECT_URI;
    
    // Authentication
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    // Working OAuth scopes (from proven implementation)
    this.scopes = [
      'users:profile:read',
      'users:own_profile:read',
      'enrollment:orgunit:read',
      'enrollment:own_enrollment:read',
      'orgunits:course:read',
      'orgunits:course:update',
      'content:modules:manage',
      'content:topics:manage', 
      'content:file:read',
      'content:file:write',
      'content:access:read',
      'content:completions:read',
      'content:completions:write',
      'content:toc:read',
      'discussions:forums:manage',
      'discussions:topics:manage',
      'discussions:posts:manage',
      'discussions:access:read',
      'surveys:surveys:create',
      'surveys:surveys:read',
      'surveys:surveys:update',
      'surveys:surveys:delete',
      'surveys:access:read',
      'managefiles:files:manage',
      'managefiles:files:read',
      'checklists:checklist:write',
      'checklists:checklist:read',
      'news:newsitems:manage',
      'news:access:read',
      'calendar:access:read',
      'quizzing:quiz:read',
      'quizzing:quiz:write',
      'quizzing:quiz:manage',
      'quizzing:access:read'
    ].join(' ');
  }

  // ==========================================
  // OAUTH AUTHENTICATION
  // ==========================================

  getAuthorizationUrl() {
    const state = `brightspace-content-creator-${Date.now()}`;
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes,
      state: state
    });
    
    return `${this.authUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(code) {
    const tokenData = {
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code: code
    };

    const response = await axios({
      method: 'POST',
      url: this.tokenUrl,
      data: new URLSearchParams(tokenData),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    this.accessToken = response.data.access_token;
    this.refreshToken = response.data.refresh_token;
    this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));

    return response.data;
  }

  isAuthenticated() {
    return this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry;
  }

  getAuthHeaders() {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated. Please complete OAuth flow first.');
    }
    
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // ==========================================
  // CORE API METHODS
  // ==========================================

  async getCurrentUser() {
    const url = `${this.apiBaseUrl}/lp/1.0/users/whoami`;
    
    try {
      const response = await axios({
        method: 'GET',
        url,
        headers: this.getAuthHeaders(),
        timeout: 30000
      });
      
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // ==========================================
  // COURSE ENROLLMENTS
  // ==========================================

  async getCourses() {
    const url = `${this.apiBaseUrl}/lp/1.0/enrollments/myenrollments/`;
    
    try {
      const response = await axios({
        method: 'GET',
        url,
        headers: this.getAuthHeaders(),
        timeout: 30000
      });
      
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // ==========================================
  // NEWS/ANNOUNCEMENTS (WORKING)
  // ==========================================

  async checkNewsPermissions(courseId) {
    console.log('🔍 Checking news permissions for course:', courseId);
    
    // Test if user can read news items (basic permission check)
    try {
      const url = `${this.apiBaseUrl}/le/1.0/${courseId}/news/`;
      const response = await axios({
        method: 'GET',
        url,
        headers: this.getAuthHeaders(),
        timeout: 30000
      });
      
      console.log('✅ User can READ news items - basic permission OK');
      console.log('📋 Existing news items count:', response.data.length);
      return {
        canRead: true,
        newsCount: response.data.length,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Cannot read news items:', error.response?.data || error.message);
      
      if (error.response?.status === 403) {
        console.error('🔒 PERMISSION DENIED: User lacks basic news read permissions');
      }
      
      return {
        canRead: false,
        error: error.response?.data || error.message
      };
    }
  }

  async getExistingNews(courseId) {
    const url = `${this.apiBaseUrl}/le/1.0/${courseId}/news/`;
    
    try {
      const response = await axios({
        method: 'GET',
        url,
        headers: this.getAuthHeaders(),
        timeout: 30000
      });
      
      console.log('Existing news items:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Failed to get existing news:', error.response?.data || error.message);
      throw error;
    }
  }

  async createNewsItem(orgUnitId, newsData) {
    // News API requires multipart/mixed format according to documentation
    const boundary = `----formdata-brightspace-${Date.now()}`;
    const jsonPart = JSON.stringify(newsData);
    
    const multipartBody = [
      `--${boundary}`,
      'Content-Type: application/json',
      '',
      jsonPart,
      `--${boundary}--`
    ].join('\r\n');

    const url = `${this.apiBaseUrl}/le/1.0/${orgUnitId}/news/`;
    
    console.log(`🌐 Making multipart API call to: ${url}`);
    console.log(`📦 Multipart body:`, multipartBody);

    try {
      const response = await axios({
        method: 'POST',
        url,
        data: multipartBody,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': `multipart/mixed; boundary=${boundary}`,
          'Accept': 'application/json'
        },
        timeout: 30000
      });
      
      console.log(`✅ Multipart API call successful`);
      return response.data;
    } catch (error) {
      console.error(`API Error [POST ${url}]:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  // ==========================================
  // CONTENT MODULES (NEW)
  // ==========================================

  async createContentModule(orgUnitId, moduleData) {
    const completeModuleData = {
      Title: moduleData.Title,
      Description: moduleData.Description || { Text: '', Html: '' },
      IsHidden: moduleData.IsHidden || false,
      IsLocked: moduleData.IsLocked || false
    };
    
    const url = `${this.apiBaseUrl}/le/1.0/${orgUnitId}/content/modules/`;
    
    try {
      const response = await axios({
        method: 'POST',
        url,
        data: completeModuleData,
        headers: this.getAuthHeaders(),
        timeout: 30000
      });
      
      return response.data;
    } catch (error) {
      console.error(`API Error [POST ${url}]:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  // ==========================================
  // DISCUSSION FORUMS (WORKING) 
  // ==========================================

  async createDiscussionForum(courseId, forumData) {
    const url = `${this.apiBaseUrl}/le/1.0/${courseId}/discussions/forums/`;
    
    const completeForumData = {
      Name: forumData.Name,
      Description: forumData.Description,
      AllowAnonymous: forumData.AllowAnonymous || false,
      IsLocked: forumData.IsLocked || false,
      IsHidden: forumData.IsHidden || false,
      RequiresApproval: false,
      IsActive: true
    };
    
    try {
      const response = await axios({
        method: 'POST',
        url,
        data: completeForumData,
        headers: this.getAuthHeaders(),
        timeout: 30000
      });
      
      return response.data;
    } catch (error) {
      console.error('Discussion forum creation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async createDiscussionTopic(courseId, forumId, topicData) {
    const url = `${this.apiBaseUrl}/le/1.0/${courseId}/discussions/forums/${forumId}/topics/`;
    
    try {
      const response = await axios({
        method: 'POST',
        url,
        data: topicData,
        headers: this.getAuthHeaders(),
        timeout: 30000
      });
      
      return response.data;
    } catch (error) {
      console.error('Discussion topic creation failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // ==========================================
  // SURVEYS
  // ==========================================

  async createSurvey(orgUnitId, surveyData) {
    const url = `${this.apiBaseUrl}/le/1.0/${orgUnitId}/surveys/`;
    
    const completeSurveyData = {
      Name: surveyData.Name,
      Description: surveyData.Description || { Text: '', Html: '' },
      Instructions: surveyData.Instructions || { Text: '', Html: '' },
      IsActive: surveyData.IsActive !== undefined ? surveyData.IsActive : true,
      SortOrder: surveyData.SortOrder || 0,
      IsAnonymous: surveyData.IsAnonymous !== undefined ? surveyData.IsAnonymous : false,
      IsHidden: surveyData.IsHidden !== undefined ? surveyData.IsHidden : false,
      ShowResults: surveyData.ShowResults !== undefined ? surveyData.ShowResults : false
    };
    
    try {
      const response = await axios({
        method: 'POST',
        url,
        data: completeSurveyData,
        headers: this.getAuthHeaders(),
        timeout: 30000
      });
      
      return response.data;
    } catch (error) {
      console.error(`API Error [POST ${url}]:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  // ==========================================
  // QUIZZING (NEW)
  // ==========================================

  async createQuiz(orgUnitId, quizData) {
    const url = `${this.apiBaseUrl}/le/1.0/${orgUnitId}/quizzes/`;
    
    const completeQuizData = {
      Name: quizData.Name,
      Description: quizData.Description || { Text: '', Html: '' },
      Instructions: quizData.Instructions || { Text: '', Html: '' },
      IsActive: quizData.IsActive !== undefined ? quizData.IsActive : true,
      SortOrder: quizData.SortOrder || 0,
      AutoSetGraded: quizData.AutoSetGraded !== undefined ? quizData.AutoSetGraded : false,
      GradeOutOf: quizData.GradeOutOf || 0,
      IsRetakeCorrectOnly: quizData.IsRetakeCorrectOnly !== undefined ? quizData.IsRetakeCorrectOnly : false,
      RetakeIncorrectOnly: quizData.RetakeIncorrectOnly !== undefined ? quizData.RetakeIncorrectOnly : false,
      HasTimeLimit: quizData.HasTimeLimit !== undefined ? quizData.HasTimeLimit : false,
      TimeLimitValue: quizData.TimeLimitValue || 0,
      IsShuffleQuestions: quizData.IsShuffleQuestions !== undefined ? quizData.IsShuffleQuestions : false,
      IsShuffleAnswers: quizData.IsShuffleAnswers !== undefined ? quizData.IsShuffleAnswers : false,
      HasAttemptsLimit: quizData.HasAttemptsLimit !== undefined ? quizData.HasAttemptsLimit : false,
      AttemptsAllowed: quizData.AttemptsAllowed || 0
    };
    
    try {
      const response = await axios({
        method: 'POST',
        url,
        data: completeQuizData,
        headers: this.getAuthHeaders(),
        timeout: 30000
      });
      
      return response.data;
    } catch (error) {
      console.error(`API Error [POST ${url}]:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }

  // ==========================================
  // FILE MANAGEMENT
  // ==========================================

  async uploadFileToCourse(courseId, fileBuffer, fileName, fileType) {
    // Brightspace file upload uses a 3-step process:
    // 1. Create upload location
    // 2. PUT file to upload location
    // 3. Finalize upload
    
    const uploadEndpoint = `${this.apiBaseUrl}/le/1.0/${courseId}/managefiles/upload/`;
    
    try {
      // Step 1: Request an upload location
      const response = await axios({
        method: 'POST',
        url: uploadEndpoint,
        headers: this.getAuthHeaders(),
        data: {
          FileName: fileName,
          FileSize: fileBuffer.length
        },
        timeout: 30000
      });
      
      const uploadLocation = response.data;
      
      // Step 2: Upload the file to the provided location
      await axios({
        method: 'PUT',
        url: uploadLocation.UploadUrl || uploadLocation.uploadUrl,
        data: fileBuffer,
        headers: {
          'Content-Type': fileType || 'application/octet-stream',
          'Content-Length': fileBuffer.length.toString()
        },
        timeout: 60000
      });
      
      // Step 3: Finalize the upload
      const fileId = uploadLocation.FileId || uploadLocation.fileId || uploadLocation.Id;
      const finalizeUrl = uploadEndpoint.replace('/upload/', `/${fileId}/finalize/`);
      
      const finalizeResponse = await axios({
        method: 'POST',
        url: finalizeUrl,
        headers: this.getAuthHeaders(),
        timeout: 30000
      });

      return finalizeResponse.data;
      
    } catch (error) {
      console.error('File upload error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      
      throw error;
    }
  }


  // ==========================================
  // UTILITY METHODS
  // ==========================================

  decodeToken() {
    if (!this.accessToken) return null;
    try {
      return jwt.decode(this.accessToken);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getTokenScopes() {
    const decoded = this.decodeToken();
    return decoded?.scope ? decoded.scope.split(' ') : [];
  }
}

module.exports = BrightspaceContentCreator;