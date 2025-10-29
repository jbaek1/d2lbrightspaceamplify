# 🚀 Amplify Brightspace Integration

Complete starter package for integrating Amplify AI with Vanderbilt's Brightspace system.

## 📋 Current Status

✅ **OAuth Setup Complete**  
✅ **Authentication Flow Working**  
✅ **Basic API Access Confirmed** (`orgunits:course:read`)  
🔍 **Additional Permissions Testing** (In Progress)

## 🛠 Quick Start

### 1. Installation

```bash
# Clone or extract this package
cd amplify-brightspace-integration

# Install dependencies
npm install

# Copy environment template
cp .env.template .env
```

### 2. Configuration

Edit `.env` file with your OAuth credentials:

```env
BRIGHTSPACE_CLIENT_ID=your_client_id_here
BRIGHTSPACE_CLIENT_SECRET=your_client_secret_here
```

> **🔐 Security:** Get credentials from Max Moundas (sent separately)

### 3. Test the Integration

```bash
# Start the OAuth server
npm run dev

# Open your browser to:
# http://localhost:3000
```

## 🎯 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run basic client |
| `npm run dev` | Start OAuth server with examples |
| `npm run test-auth` | Test authentication flow |
| `npm run test-api` | Test API calls |

## 📁 Project Structure

```
src/
├── brightspace-client.js    # Main API client class
├── oauth-server.js          # OAuth callback server
└── example-usage.js         # Usage examples and demos

.env.template                # Environment configuration template
package.json                 # Dependencies and scripts
README.md                    # This file
```

## 🔧 Core Components

### BrightspaceClient

Main class for interacting with Brightspace API:

```javascript
const client = new BrightspaceClient();

// Generate OAuth URL
const authUrl = client.getAuthorizationUrl();

// Exchange code for token
await client.exchangeCodeForToken(authorizationCode);

// Make API calls
const courses = await client.getCourses();
const user = await client.getCurrentUser();
```

### OAuth Server

Web server for handling OAuth flow:

```javascript
const server = new OAuthServer();
server.start(); // Runs on localhost:3000
```

## 🎮 Usage Examples

### Basic Authentication

```javascript
const BrightspaceClient = require('./src/brightspace-client');

const client = new BrightspaceClient();

// Step 1: Get authorization URL
const authUrl = client.getAuthorizationUrl('random-state-123');
console.log('Visit:', authUrl);

// Step 2: User completes OAuth flow and you get a code
const code = 'authorization_code_from_callback';

// Step 3: Exchange code for access token
await client.exchangeCodeForToken(code);

// Step 4: Make API calls
const user = await client.getCurrentUser();
const courses = await client.getCourses();
```

### Course Operations

```javascript
// Get course list
const enrollments = await client.getCourses();

// Get specific course details
const courseId = 123456;
const course = await client.getCourse(courseId);

// Get course content structure
const content = await client.getCourseContent(courseId);
```

### Custom API Calls

```javascript
// Make any Brightspace API call
const response = await client.apiCall('/le/1.0/123456/content/modules/');
const userData = await client.apiCall('/lp/1.0/users/whoami');
```

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` to git
2. **HTTPS Only**: Use HTTPS in production
3. **Token Storage**: Store tokens securely (consider encryption)
4. **Scope Limitation**: Only request needed permissions
5. **Error Handling**: Log errors but not sensitive data

## 📊 Current Permissions

| Scope | Status | Description |
|-------|--------|-------------|
| `orgunits:course:read` | ✅ **Working** | Read course information |
| `orgunits:course:update` | 🔍 Testing | Modify course settings |
| `content:modules:manage` | 🔍 Testing | Manage course modules |
| `content:topics:manage` | 🔍 Testing | Manage content topics |
| `managefiles:files:read` | 🔍 Testing | Read course files |
| `managefiles:files:manage` | 🔍 Testing | Upload/manage files |

> **Note:** Additional permissions are being tested. Check with Max for latest status.

## 🧪 Testing

### Web Interface Testing

1. Run `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Connect to Brightspace"
4. Complete authentication
5. Test API calls through web interface

### Programmatic Testing

```javascript
// Test authentication
node src/test-authentication.js

// Test API calls
node src/test-api-calls.js
```

## 🔗 Brightspace API Documentation

- **API Reference**: [Brightspace API Docs](https://docs.valence.desire2learn.com/)
- **OAuth 2.0**: [Authentication Guide](https://docs.valence.desire2learn.com/basic/oauth2.html)
- **Course APIs**: [Learning Environment APIs](https://docs.valence.desire2learn.com/res/le.html)

## 🆘 Troubleshooting

### Common Issues

**"Missing OAuth credentials"**
- Check `.env` file exists and has correct credentials
- Verify credentials with Max

**"Invalid redirect_uri"**
- Ensure redirect URI matches OAuth app configuration: `http://localhost:3000/auth/brightspace/callback`

**"Invalid scope"**
- Some permissions may not be configured yet
- Check current permissions table above

**"Token expired"**
- Client automatically refreshes tokens
- If issues persist, re-authenticate

### Getting Help

1. Check the console logs for detailed error messages
2. Verify your `.env` configuration
3. Contact Max Moundas for OAuth credential issues
4. Test with minimal scopes first (`orgunits:course:read`)

## 📞 Support

**Max Moundas**
- Email: [Your email]
- Status: OAuth setup complete, additional permissions testing in progress

**Next Steps for Your Team:**
1. Set up development environment
2. Get OAuth credentials from Max
3. Test basic integration
4. Identify specific Brightspace features needed for Amplify
5. Request additional scope testing as needed

---

**🎯 Ready to integrate AI-powered course creation with Brightspace!**