#!/usr/bin/env node

const AmplifyClient = require('./server/amplify-client');
require('dotenv').config();

async function testAmplifyAPI() {
  console.log('🧪 Testing Amplify API Connection...\n');
  
  // Check environment variables
  console.log('Environment Check:');
  console.log('- API Base URL:', process.env.AMPLIFY_API_BASE_URL);
  console.log('- API Key:', process.env.AMPLIFY_API_KEY ? `${process.env.AMPLIFY_API_KEY.substring(0, 10)}...` : 'NOT SET');
  console.log('');
  
  // Initialize client
  const client = new AmplifyClient();
  console.log('Client initialization:');
  console.log('- Mock Mode:', client.mockMode);
  console.log('- API Base URL:', client.apiBaseUrl);
  console.log('');
  
  try {
    // Test 1: Check API Health
    console.log('🏥 Testing API Health...');
    const healthResult = await client.checkApiHealth();
    console.log('Health Result:', JSON.stringify(healthResult, null, 2));
    console.log('');
    
    // Test 2: Simple Chat Test
    console.log('💬 Testing Chat API...');
    const chatResult = await client.chatWithAmplify({
      message: 'Hello, this is a test message',
      model: 'gpt-4o',
      temperature: 0.1,
      maxTokens: 50
    });
    console.log('Chat Result:', JSON.stringify(chatResult, null, 2));
    console.log('');
    
    // Test 3: Process Mock File
    console.log('📁 Testing File Processing...');
    const mockFile = {
      name: 'test-document.txt',
      type: 'text/plain',
      buffer: Buffer.from('This is a test document for educational analysis. It contains information about data science and machine learning concepts.')
    };
    
    const processResult = await client.processFile(mockFile, {
      processingType: 'educational_content',
      includeQuiz: true,
      includeAssignment: true
    });
    
    console.log('Process Result Summary:');
    console.log('- Success:', processResult.success);
    console.log('- Summary:', processResult.summary);
    console.log('- Topics:', processResult.topics);
    console.log('- Mock Mode Used:', processResult.metadata?.mock || false);
    console.log('');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
  }
}

// Run the test
testAmplifyAPI().then(() => {
  console.log('✅ Test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});