const BrightspaceClient = require('./brightspace-client');
const OAuthServer = require('./oauth-server');
require('dotenv').config();

/**
 * Example usage of the Brightspace API client
 * This demonstrates how to use the integration in your Amplify project
 */

async function exampleApiUsage() {
  console.log('🚀 Brightspace API Example Usage\n');

  // Method 1: Use the OAuth server for easy authentication
  console.log('Method 1: Using OAuth Server');
  console.log('==================================');
  console.log('1. Start the OAuth server with: npm run dev');
  console.log('2. Visit http://localhost:3000 in your browser');
  console.log('3. Click "Connect to Brightspace"');
  console.log('4. Complete authentication in browser');
  console.log('5. Test API calls through the web interface\n');

  // Method 2: Manual client usage (for programmatic access)
  console.log('Method 2: Manual Client Usage');
  console.log('==================================');
  
  const client = new BrightspaceClient();
  
  // Generate authorization URL
  const authUrl = client.getAuthorizationUrl('example-state-123', ['orgunits:course:read']);
  console.log('Authorization URL:', authUrl);
  console.log('\nTo complete authentication:');
  console.log('1. Open the URL above in your browser');
  console.log('2. Complete Brightspace login');
  console.log('3. Copy the "code" parameter from the callback URL');
  console.log('4. Use client.exchangeCodeForToken(code) to get access token\n');

  // Example of what you can do after authentication
  console.log('Example API Operations (after authentication):');
  console.log('============================================');
  
  const exampleOperations = `
// Get current user info
const user = await client.getCurrentUser();
console.log('Current user:', user);

// Get available courses
const courses = await client.getCourses();
console.log('Available courses:', courses);

// Get specific course details
const courseId = 12345; // Replace with actual course ID
const course = await client.getCourse(courseId);
console.log('Course details:', course);

// Get course content structure
const content = await client.getCourseContent(courseId);
console.log('Course content:', content);

// Make custom API calls
const customData = await client.apiCall('/lp/1.0/users/whoami');
console.log('Custom API response:', customData);
`;

  console.log(exampleOperations);

  // Integration with Amplify example
  console.log('\nAmplify Integration Example:');
  console.log('===========================');
  
  const amplifyExample = `
// Example: Create AI-generated course content
async function createAmplifyContent(courseId, aiGeneratedContent) {
  const client = new BrightspaceClient();
  
  // Ensure authenticated (you'd handle OAuth flow first)
  if (!client.isAuthenticated()) {
    throw new Error('Please authenticate first');
  }
  
  try {
    // Get existing course structure
    const course = await client.getCourse(courseId);
    console.log('Working with course:', course.Name);
    
    // Get current content modules
    const content = await client.getCourseContent(courseId);
    console.log('Existing modules:', content.length);
    
    // Here you would:
    // 1. Process AI-generated content from Amplify
    // 2. Create new modules/topics in Brightspace
    // 3. Upload any files or resources
    // 4. Set up completion tracking
    
    return {
      success: true,
      message: 'AI content successfully added to Brightspace course'
    };
  } catch (error) {
    console.error('Failed to create content:', error);
    throw error;
  }
}
`;

  console.log(amplifyExample);
}

// Run the OAuth server for easy testing
if (require.main === module) {
  console.log('Starting OAuth server for testing...\n');
  
  const server = new OAuthServer();
  server.start();
  
  console.log('\n' + '='.repeat(60));
  exampleApiUsage().catch(console.error);
}