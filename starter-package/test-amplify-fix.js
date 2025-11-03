const AmplifyClient = require('./server/amplify-client');

async function testAmplifyClient() {
    console.log('🧪 Testing Amplify Client...\n');
    
    const client = new AmplifyClient();
    
    // Test 1: Check API Health
    console.log('1. Testing API Health Check...');
    try {
        const health = await client.checkApiHealth();
        console.log('✅ Health check result:', health);
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
    }
    
    console.log('\n');
    
    // Test 2: Test Chat API
    console.log('2. Testing Chat API...');
    try {
        const chatResponse = await client.chatWithAmplify({
            message: 'Hello! This is a test message. Please respond with a simple greeting.',
            model: 'gpt-4o',
            temperature: 0.1,
            maxTokens: 50
        });
        console.log('✅ Chat response:', chatResponse);
    } catch (error) {
        console.error('❌ Chat test failed:', error.message);
    }
    
    console.log('\n');
    
    // Test 3: Test File Upload (mock file)
    console.log('3. Testing File Upload...');
    try {
        const mockFile = {
            name: 'test.txt',
            type: 'text/plain',
            buffer: Buffer.from('This is a test file for Amplify API integration.')
        };
        
        const uploadResponse = await client.uploadFileToAmplify(mockFile, {
            knowledgeBase: 'test',
            tags: ['test', 'integration']
        });
        console.log('✅ Upload response:', uploadResponse);
    } catch (error) {
        console.error('❌ Upload test failed:', error.message);
    }
    
    console.log('\n🏁 Test completed!');
}

// Run the test
testAmplifyClient().catch(console.error);