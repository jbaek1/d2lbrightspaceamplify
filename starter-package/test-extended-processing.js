#!/usr/bin/env node

const AmplifyClient = require('./server/amplify-client');
require('dotenv').config();

async function testImprovedProcessing() {
  console.log('🕒 Testing Improved Processing with Extended Wait Times...\n');
  
  const client = new AmplifyClient();
  
  // Create a more substantial test file
  const mockSyllabusFile = {
    name: 'cs3270-syllabus.pdf',
    type: 'application/pdf',
    buffer: Buffer.from(`
CS 3270 - Programming Languages
Fall 2024

Course Information:
Instructor: Dr. Smith
Term: Fall 2024
Credits: 3 credit hours
Meeting Times: MWF 10:00-10:50 AM

Office Hours:
Monday and Wednesday 2:00-4:00 PM in FGH 201
Or by appointment via Zoom: https://vanderbilt.zoom.us/j/123456789

Course Description:
This course provides an introduction to the fundamental concepts of programming languages. 
Students will explore different programming paradigms including imperative, functional, 
logic, and object-oriented programming. The course covers language design principles, 
syntax and semantics, type systems, and implementation techniques.

Course Format:
This is a 3 credit hour course that meets 3 times per week for 50 minutes each session. 
Students should expect to spend approximately 6-9 hours per week on coursework outside of class, 
including reading assignments, programming projects, and exam preparation.

Learning Objectives:
1. Students will understand fundamental concepts of programming language design and implementation
2. Students will be able to compare and contrast different programming paradigms
3. Students will implement interpreters and compilers for simple programming languages
4. Students will analyze the syntax and semantics of programming languages
5. Students will evaluate the trade-offs in language design decisions

Required Materials:
- Programming Languages: Application and Interpretation by Shriram Krishnamurthi (free online)
- Access to a computer with Python, Racket, and other programming environments
- Course materials available through Brightspace

Assessment:
- Programming Projects (40%)
- Midterm Exam (25%)
- Final Exam (30%)
- Participation and Quizzes (5%)
    `)
  };
  
  try {
    console.log('📤 Starting file upload with extended processing...');
    const startTime = Date.now();
    
    const result = await client.processFile(mockSyllabusFile, {
      processingType: 'syllabus_extraction',
      fileType: 'syllabus'
    });
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️ Total processing time: ${totalTime} seconds\n`);
    
    console.log('📋 Processing Results:');
    console.log('- Success:', result.success);
    console.log('- File Type:', result.file_type);
    console.log('- Fallback Used:', result.fallback_reason ? 'Yes' : 'No');
    
    if (result.fallback_reason) {
      console.log('- Fallback Reason:', result.fallback_reason);
      console.log('- Note:', result.note);
    }
    
    if (result.syllabus_entities) {
      console.log('\n🏫 Extracted Course Information:');
      console.log('- Course:', result.syllabus_entities.course_code_name || 'Not extracted');
      console.log('- Term:', result.syllabus_entities.term || 'Not extracted');
      console.log('- Office Hours:', result.syllabus_entities.office_hours || 'Not extracted');
      console.log('- Description Length:', result.syllabus_entities.course_description?.length || 0, 'characters');
      console.log('- Learning Objectives Count:', result.syllabus_entities.learning_objectives?.length || 0);
      console.log('- Course Materials Count:', result.syllabus_entities.course_materials?.length || 0);
    }
    
    if (result.ai_analysis) {
      console.log('\n🤖 AI Analysis Info:');
      console.log('- Analysis Method:', result.ai_analysis.analysis_method);
      console.log('- Confidence Score:', result.ai_analysis.confidence_score);
      console.log('- Response Length:', result.ai_analysis.full_response?.length || 0, 'characters');
      
      if (result.ai_analysis.full_response && result.ai_analysis.full_response.length > 100) {
        console.log('- Content Preview:', result.ai_analysis.full_response.substring(0, 200) + '...');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testImprovedProcessing().then(() => {
  console.log('\n✅ Extended processing test completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});