# 🎓 Brightspace API Integration Guide

**Complete guide for the Amplify team at Vanderbilt University**

---

## 📊 Current Permissions Status

### ✅ **CONFIRMED WORKING**
| Scope | Permission Level | Description | Use Cases |
|-------|------------------|-------------|-----------|
| `orgunits:course:read` | **READ-ONLY** | Access course information and structure | • Get course list<br>• Read course details<br>• Access course metadata |

### 🔍 **TESTING IN PROGRESS**
| Scope | Permission Level | Expected Capability | Priority |
|-------|------------------|---------------------|----------|
| `orgunits:course:update` | **WRITE** | Modify course settings | **HIGH** |
| `content:modules:manage` | **FULL CRUD** | Create/edit/delete content modules | **CRITICAL** |
| `content:topics:manage` | **FULL CRUD** | Manage individual content items | **CRITICAL** |
| `managefiles:files:read` | **READ** | Access course files | **HIGH** |
| `managefiles:files:manage` | **FULL CRUD** | Upload and manage files | **CRITICAL** |

> **Status Update:** We've confirmed OAuth works and basic course reading is available. Testing additional permissions systematically.

---

## 🚀 Getting Started

### 1. **Prerequisites**

**Required:**
- Node.js 16+ 
- Brightspace OAuth credentials (from Max)
- Access to Vanderbilt Brightspace system

**Recommended:**
- Git for version control
- VS Code or similar editor
- Postman for API testing

### 2. **Installation & Setup**

```bash
# Clone the starter package
git clone [repository] amplify-brightspace
cd amplify-brightspace

# Install dependencies
npm install

# Configure environment
cp .env.template .env
# Edit .env with your OAuth credentials
```

### 3. **OAuth Configuration**

**Required Environment Variables:**
```env
BRIGHTSPACE_CLIENT_ID=91b51d49-a0f2-4af8-b3c9-b5fcf5489166
BRIGHTSPACE_CLIENT_SECRET=[get_from_max]
BRIGHTSPACE_REDIRECT_URI=http://localhost:3000/auth/brightspace/callback
```

**OAuth Endpoints:**
- **Authorization:** `https://auth.brightspace.com/oauth2/auth`
- **Token Exchange:** `https://auth.brightspace.com/oauth2/token` 
- **API Base:** `https://vanderbilt.brightspace.com/d2l/api`

---

## 🎯 Core API Operations

### **Authentication Flow**

```javascript
const BrightspaceClient = require('./src/brightspace-client');

// 1. Initialize client
const client = new BrightspaceClient();

// 2. Generate authorization URL
const authUrl = client.getAuthorizationUrl('state123', ['orgunits:course:read']);
// User visits URL, completes OAuth flow

// 3. Exchange authorization code for token
await client.exchangeCodeForToken(authorizationCode);

// 4. Client is now authenticated for API calls
const isAuth = client.isAuthenticated(); // true
```

### **Course Operations** 

```javascript
// Get user's course enrollments
const enrollments = await client.getCourses();
console.log(`Found ${enrollments.Items.length} courses`);

// Get specific course details
const courseId = 123456;
const course = await client.getCourse(courseId);
console.log(`Course: ${course.Name} (${course.Code})`);

// Get course content structure
const content = await client.getCourseContent(courseId);
console.log(`Modules: ${content.length}`);
```

### **User Information**

```javascript
// Get current authenticated user
const user = await client.getCurrentUser();
console.log(`Logged in as: ${user.FirstName} ${user.LastName}`);
```

### **Custom API Calls**

```javascript
// Make any Brightspace API call
const customData = await client.apiCall('/lp/1.0/users/whoami');
const modules = await client.apiCall(`/le/1.0/${courseId}/content/modules/`);
```

---

## 🏗 Amplify Integration Patterns

### **Pattern 1: AI Content Creation**

```javascript
async function createAIContent(courseId, aiGeneratedContent) {
  const client = new BrightspaceClient();
  
  try {
    // 1. Get course structure
    const course = await client.getCourse(courseId);
    const existingContent = await client.getCourseContent(courseId);
    
    // 2. Process AI content
    const processedContent = processAIContent(aiGeneratedContent);
    
    // 3. Create new modules (when permissions available)
    // const newModule = await client.apiCall(`/le/1.0/${courseId}/content/modules/`, 'POST', {
    //   Title: processedContent.title,
    //   Description: processedContent.description
    // });
    
    // 4. Upload files (when permissions available)
    // const uploadedFiles = await uploadContentFiles(processedContent.files);
    
    return {
      success: true,
      courseId: courseId,
      modulesCreated: 1,
      filesUploaded: processedContent.files?.length || 0
    };
  } catch (error) {
    console.error('AI content creation failed:', error);
    throw error;
  }
}
```

### **Pattern 2: Course Analysis**

```javascript
async function analyzeCoursesForAI() {
  const client = new BrightspaceClient();
  
  // Get all accessible courses
  const enrollments = await client.getCourses();
  
  const courseAnalysis = [];
  
  for (const enrollment of enrollments.Items) {
    const courseId = enrollment.OrgUnit.Id;
    
    try {
      const course = await client.getCourse(courseId);
      const content = await client.getCourseContent(courseId);
      
      courseAnalysis.push({
        id: courseId,
        name: course.Name,
        code: course.Code,
        moduleCount: content.length,
        isEmpty: content.length === 0,
        aiOpportunity: content.length < 5 // Courses with few modules
      });
    } catch (error) {
      console.log(`Skipping course ${courseId}:`, error.message);
    }
  }
  
  return courseAnalysis;
}
```

### **Pattern 3: Content Synchronization**

```javascript
async function syncAmplifyToBrightspace(amplifyContent, courseId) {
  const client = new BrightspaceClient();
  
  // 1. Backup existing content
  const existingContent = await client.getCourseContent(courseId);
  
  // 2. Map Amplify content to Brightspace structure
  const brightspaceModules = mapAmplifyToBrightspace(amplifyContent);
  
  // 3. Create/update modules (when write permissions available)
  const results = {
    created: 0,
    updated: 0,
    errors: []
  };
  
  for (const module of brightspaceModules) {
    try {
      // When permissions available:
      // const result = await client.apiCall(`/le/1.0/${courseId}/content/modules/`, 'POST', module);
      // results.created++;
      
      console.log(`Would create module: ${module.Title}`);
    } catch (error) {
      results.errors.push({ module: module.Title, error: error.message });
    }
  }
  
  return results;
}
```

---

## 📋 Permission Matrix & Capabilities

### **Current Access Level: READ-ONLY**

| API Category | Available Operations | Blocked Operations |
|--------------|---------------------|-------------------|
| **Courses** | • List user courses<br>• Get course details<br>• Read course settings | • Create courses<br>• Update course settings<br>• Delete courses |
| **Content** | • View content structure<br>• Read module information | • Create modules<br>• Edit content<br>• Upload files<br>• Delete content |
| **Users** | • Get own user info | • Access other users<br>• Modify profiles |
| **Files** | *Testing in progress* | *Testing in progress* |

### **Expected with Full Permissions**

| API Category | Will Enable | Amplify Use Cases |
|--------------|-------------|-------------------|
| **Content Management** | • Create course modules<br>• Add topics and materials<br>• Upload AI-generated files | • AI course population<br>• Automated content creation<br>• Resource management |
| **File Management** | • Upload documents<br>• Organize course files<br>• Manage media assets | • AI-generated PDFs<br>• Course images<br>• Multimedia content |
| **Course Updates** | • Modify course properties<br>• Update descriptions<br>• Configure settings | • Course enhancement<br>• Metadata management<br>• Branding updates |

---

## 🔍 API Testing & Development

### **Testing Current Permissions**

```bash
# Start the OAuth server
npm run dev

# Open browser to http://localhost:3000
# Complete authentication flow
# Test available API calls through web interface
```

### **Development Workflow**

1. **Authenticate** using OAuth server
2. **Test basic calls** with confirmed permissions
3. **Build incrementally** as more permissions become available
4. **Handle errors gracefully** for unauthorized operations

### **Error Handling Patterns**

```javascript
async function safeApiCall(client, endpoint, method = 'GET', data = null) {
  try {
    return await client.apiCall(endpoint, method, data);
  } catch (error) {
    if (error.response?.status === 403) {
      console.log(`Permission denied for ${endpoint} - feature not available yet`);
      return null;
    } else if (error.response?.status === 404) {
      console.log(`Resource not found: ${endpoint}`);
      return null;
    } else {
      throw error; // Re-throw unexpected errors
    }
  }
}
```

---

## 📚 Brightspace API Reference

### **Key API Endpoints**

| Endpoint Pattern | Purpose | Current Access |
|------------------|---------|----------------|
| `/lp/1.0/users/whoami` | Get current user info | ✅ **Available** |
| `/lp/1.0/enrollments/myenrollments/` | List user courses | ✅ **Available** |
| `/lp/1.0/courses/{courseId}` | Get course details | ✅ **Available** |
| `/le/1.0/{courseId}/content/` | Course content structure | ✅ **Available** |
| `/le/1.0/{courseId}/content/modules/` | Content modules | 🔍 **Testing** |
| `/le/1.0/{courseId}/content/{topicId}` | Individual topics | 🔍 **Testing** |

### **Response Formats**

**Course List Response:**
```json
{
  "Items": [
    {
      "OrgUnit": {
        "Id": 123456,
        "Name": "Introduction to AI",
        "Code": "CS 3891"
      },
      "Role": {
        "Id": 109,
        "Code": "Instructor",
        "Name": "Instructor"
      }
    }
  ]
}
```

**Course Details Response:**
```json
{
  "Identifier": "CS_3891_001",
  "Name": "Introduction to AI", 
  "Code": "CS 3891",
  "IsActive": true,
  "StartDate": "2024-01-15T00:00:00.000Z",
  "EndDate": "2024-05-15T23:59:59.000Z"
}
```

---

## 🔐 Security Considerations

### **OAuth Token Management**

```javascript
// Good: Automatic token refresh
if (client.tokenExpiry && new Date() >= client.tokenExpiry) {
  await client.refreshAccessToken();
}

// Good: Check authentication before API calls
if (!client.isAuthenticated()) {
  throw new Error('Please authenticate first');
}
```

### **Data Protection**

- **Never log full tokens** - only show truncated versions
- **Encrypt stored tokens** if persisting to database
- **Use HTTPS only** in production
- **Validate all inputs** before sending to API
- **Handle errors without exposing sensitive data**

### **Rate Limiting**

```javascript
// Add delays between API calls if needed
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

for (const course of courses) {
  await processCourse(course);
  await delay(100); // 100ms between calls
}
```

---

## 📞 Support & Next Steps

### **Current Status Summary**

✅ **OAuth authentication working**  
✅ **Basic course reading confirmed**  
🔍 **Testing additional permissions**  
🎯 **Ready for Amplify integration development**

### **For Your Team**

1. **Immediate:** Set up starter package and test basic authentication
2. **Short-term:** Build read-only course analysis features  
3. **Medium-term:** Prepare for write permissions (content creation)
4. **Long-term:** Full Amplify-Brightspace integration

### **Contact Information**

**Max Moundas**
- OAuth setup complete
- Additional permissions testing in progress
- Available for integration support

---

**🎯 The foundation is ready - let's build the AI-powered course creation system!**