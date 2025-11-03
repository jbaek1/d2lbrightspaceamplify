#!/usr/bin/env node

const AmplifyClient = require('./server/amplify-client');
require('dotenv').config();

async function testDetailedAnalysis() {
  console.log('🔬 Testing Detailed AI Analysis...\n');
  
  const client = new AmplifyClient();
  
  // Create a test file with more educational content
  const mockFile = {
    name: 'cs3270-syllabus.pdf',
    type: 'application/pdf',
    buffer: Buffer.from(`
CS 3270 - Programming Languages Syllabus

Course Description:
This course provides an introduction to the fundamental concepts of programming languages, including syntax, semantics, and implementation. Students will explore different programming paradigms including functional, object-oriented, and logic programming.

Learning Objectives:
1. Understand different programming paradigms and their applications
2. Analyze language design decisions and their trade-offs
3. Implement interpreters and compilers for simple programming languages
4. Compare and contrast various programming languages

Topics Covered:
- Syntax and Grammar
- Semantic Analysis
- Type Systems
- Memory Management
- Functional Programming Concepts
- Object-Oriented Programming
- Concurrency and Parallelism

Assignments:
1. Language Comparison Report
2. Simple Interpreter Implementation
3. Type System Design Project
4. Final Programming Language Project

Assessment:
- Assignments: 40%
- Midterm Exam: 25%
- Final Project: 25%
- Participation: 10%
    `)
  };
  
  try {
    console.log('📤 Starting file upload...');
    const uploadResult = await client.uploadFileToAmplify(mockFile, {
      knowledgeBase: 'educational_content',
      tags: ['syllabus', 'computer-science', 'programming-languages'],
      ragOn: true
    });
    
    console.log('Upload Result:', JSON.stringify(uploadResult, null, 2));
    
    if (uploadResult && (uploadResult.id || uploadResult.key)) {
      console.log('\n💬 Testing direct chat with uploaded file...');
      
      const fileId = uploadResult.id || uploadResult.key;
      console.log('Using file ID:', fileId);
      
      const chatResult = await client.chatWithAmplify({
        message: 'Please analyze this syllabus and extract the key learning objectives, topics, and difficulty level. Provide specific educational insights.',
        dataSources: [fileId],
        model: 'gpt-4o',
        temperature: 0.3,
        maxTokens: 2048
      });
      
      console.log('Chat Analysis Result:');
      console.log('- Success:', chatResult.success);
      console.log('- Content Length:', chatResult.content?.length || 0);
      console.log('- Content Preview:', chatResult.content?.substring(0, 200) + '...');
      console.log('- Raw Response:', JSON.stringify(chatResult.raw_response, null, 2));
      console.log('- Full Content:', chatResult.content);
    } else {
      console.log('❌ Upload failed, no file ID received');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testDetailedAnalysis().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});