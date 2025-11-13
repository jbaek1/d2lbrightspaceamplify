# Brightspace Content Manager

A streamlined web interface for creating Brightspace course content through simple test buttons. This application demonstrates working OAuth authentication and basic content creation functionality.

## Features

- **News & Announcements**: Create test announcements with auto-generated content
- **Discussion Forums**: Create test discussion forums with auto-generated content  
- **OAuth Authentication**: Secure Brightspace integration with comprehensive scopes
- **Web Interface**: Simple button-based interface for testing API functionality

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate SSL certificates:**
   ```bash
   npm run generate-certs
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open browser:**
   - Navigate to `https://localhost:3000` (backend)
   - Or `http://localhost:5173` (frontend - recommended)
   - Accept the SSL certificate warning if accessing backend directly
   - Connect to Brightspace and test content creation

## Configuration

### OAuth Settings (in .env)
```bash
BRIGHTSPACE_CLIENT_ID=91b51d49-a0f2-4af8-b3c9-b5fcf5489166
BRIGHTSPACE_CLIENT_SECRET=yCCvrPER3LT62JGyQyyq7swSHIsa3KlYFsDNb98AmiI
BRIGHTSPACE_API_BASE_URL=https://vanderbilttest.brightspace.com/d2l/api
BRIGHTSPACE_REDIRECT_URI=https://localhost:3000/auth/brightspace/callback
```

### OAuth Scopes
The application requests comprehensive scopes for full Brightspace API access:
- `users:profile:read` - User authentication
- `users:own_profile:read` - User profile access
- `enrollment:orgunit:read` - Course enrollment access
- `news:newsitems:manage` - Create/manage announcements
- `news:access:read` - Read news permissions
- `discussions:forums:manage` - Create/manage discussion forums
- `discussions:topics:manage` - Manage forum topics
- Plus 25+ additional scopes for comprehensive API access

## Test Course Access

**Course URL**: https://vanderbilttest.brightspace.com/d2l/home/540221
- Navigate to https://vanderbilttest.brightspace.com
- Go to "Sandbox Courses" tab
- Select "Amplify Testing Sandbox" course
- Verify you have instructor access and can view created content

## API Integration

### Working Implementation
- **News (Announcements) API**: Uses multipart/mixed format with API version 1.0
- **Discussion API**: Standard JSON REST API with proper field validation
- **Authentication**: Complete OAuth 2.0 flow with token management

## Usage

### Creating Test Content
1. Connect to Brightspace using OAuth (grants all required scopes)
2. Click "Create Test Announcement" - auto-generates announcement content
3. Click "Create Test Discussion Forum" - auto-generates forum content
4. Check activity log for creation status
5. Verify content appears in Brightspace course at URL above

## Extending Functionality

This application demonstrates basic Brightspace API integration. For additional functionality:

### Available API Endpoints
Comprehensive documentation available at: https://docs.valence.desire2learn.com/http-scopestable.html

### Common Extensions
- **Quizzes**: `quizzing:quiz:write` scope with quiz creation endpoints
- **Assignments**: `assignments:assignment:write` scope 
- **Gradebook**: `grades:gradebook:read` and `grades:gradebook:write` scopes
- **File Management**: `managefiles:files:manage` scope for uploads
- **Calendar Events**: `calendar:calendar:write` scope

### Implementation Pattern
1. Add required OAuth scopes to `brightspace-content-creator.js`
2. Implement API method following `createNewsItem()` pattern
3. Add server endpoint in `server.js`
4. Add UI button and JavaScript function
5. Test with sandbox course

## Troubleshooting

### SSL Certificate Issues
If you get SSL warnings:
1. Regenerate certificates: `npm run generate-certs`
2. In browser, click "Advanced" then "Proceed to localhost"

### OAuth Failures  
1. Verify client credentials in `.env`
2. Check redirect URI matches exactly
3. Ensure you have instructor access to test course

### Content Creation Errors
1. Verify green authentication status indicator
2. Check server logs for specific error messages
3. Confirm content appears in Brightspace web interface
4. Re-authenticate if scope errors occur

## Security

- HTTPS required for OAuth callbacks
- SSL certificates auto-generated for localhost development
- OAuth tokens securely managed and refreshed automatically
- All API calls include proper authentication headers

## Architecture

### Core Components
- `server.js` - Express server with embedded HTML interface
- `brightspace-content-creator.js` - Brightspace API client with OAuth
- `.env` - Configuration and credentials
- `certs/` - SSL certificates for HTTPS

### Data Flow
1. User clicks test button
2. Browser sends request to Express server
3. Server calls Brightspace API with OAuth token
4. API response returned to browser
5. Success/error displayed in activity log