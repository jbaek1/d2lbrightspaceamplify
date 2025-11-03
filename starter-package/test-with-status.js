#!/usr/bin/env node

const AmplifyClient = require('./server/amplify-client');
const axios = require('axios');
require('dotenv').config();

async function testWithStatusCheck() {
  console.log('🕰️ Testing with Status Check and Longer Wait...\n');
  
  const client = new AmplifyClient();
  
  // Create a test file with real content
  const mockFile = {
    name: 'data-science-basics.txt',
    type: 'text/plain',
    buffer: Buffer.from(`
Data Science Fundamentals - Course Content

Introduction to Data Science
Data science is an interdisciplinary field that combines statistics, computer science, and domain expertise to extract insights from data.

Key Topics:
1. Data Collection and Cleaning
   - Web scraping techniques
   - Data validation methods
   - Handling missing data

2. Exploratory Data Analysis
   - Statistical summaries
   - Data visualization
   - Pattern identification

3. Machine Learning Fundamentals
   - Supervised learning algorithms
   - Unsupervised learning techniques
   - Model evaluation metrics

4. Data Visualization
   - Plotting libraries and tools
   - Dashboard creation
   - Storytelling with data

Learning Objectives:
- Students will understand the data science workflow
- Students will be able to clean and preprocess data
- Students will apply machine learning algorithms to real datasets
- Students will create effective data visualizations

Assessment Methods:
- Project-based assignments (50%)
- Quizzes and exams (30%)
- Data visualization portfolio (20%)

Prerequisites:
- Basic statistics knowledge
- Programming experience (Python or R preferred)
- Linear algebra fundamentals
    `)
  };
  
  try {
    console.log('📤 Starting file upload...');
    const uploadResult = await client.uploadFileToAmplify(mockFile, {
      knowledgeBase: 'educational_content',
      tags: ['data-science', 'course-content', 'educational'],
      ragOn: true
    });
    
    console.log('✅ Upload successful!');
    console.log('File Key:', uploadResult.key);
    
    if (uploadResult.statusUrl) {
      console.log('\n🔍 Checking file processing status...');
      
      // Check status multiple times
      for (let attempt = 1; attempt <= 5; attempt++) {
        console.log(`Attempt ${attempt}/5: Checking processing status...`);
        
        try {
          const statusResponse = await axios.get(uploadResult.statusUrl);
          console.log(`Status Response (${attempt}):`, JSON.stringify(statusResponse.data, null, 2));
        } catch (statusError) {
          console.log(`Status check ${attempt} failed:`, statusError.response?.status || statusError.message);
        }
        
        // Wait between attempts
        if (attempt < 5) {
          console.log('⏳ Waiting 10 seconds before next check...');
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }
    }
    
    console.log('\n💬 Testing AI analysis after processing wait...');
    const chatResult = await client.chatWithAmplify({
      message: 'Analyze this educational content. What are the main topics, learning objectives, and difficulty level? Provide specific insights about how this could be used in a course.',
      dataSources: [uploadResult.key],
      model: 'gpt-4o',
      temperature: 0.3,
      maxTokens: 3000
    });
    
    console.log('\nFinal Analysis Result:');
    console.log('- Success:', chatResult.success);
    console.log('- Content Length:', chatResult.content?.length || 0);
    console.log('- Raw Response Data:', chatResult.raw_response?.data);
    
    if (chatResult.content && chatResult.content.length > 50) {
      console.log('\n🎉 SUCCESS! Real AI analysis received:');
      console.log('---');
      console.log(chatResult.content);
      console.log('---');
    } else {
      console.log('\n⚠️ Still getting generic response, may need more processing time');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testWithStatusCheck().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});