#!/usr/bin/env node

/**
 * Debug script for Amplify AI analysis
 * Usage: node debug-amplify.js [file-path]
 */

const fs = require('fs');
const path = require('path');
const AmplifyClient = require('./server/amplify-client');

async function debugAmplify(filePath) {
  console.log('🔍 Amplify AI Debug Tool\n');
  
  if (!filePath) {
    console.error('Usage: node debug-amplify.js [file-path]');
    console.error('Example: node debug-amplify.js ./test-files/sample.pdf');
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  try {
    const client = new AmplifyClient();
    
    // Create a mock file object
    const fileStats = fs.statSync(filePath);
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    
    const mockFile = {
      name: fileName,
      size: fileStats.size,
      type: getMimeType(fileName),
      buffer: fileContent
    };
    
    console.log(`📁 Processing file: ${fileName}`);
    console.log(`📊 Size: ${fileStats.size} bytes`);
    console.log(`🏷️  Type: ${mockFile.type}\n`);
    
    // Test general analysis
    console.log('🤖 Testing general analysis...');
    const generalResult = await client.processFiles([mockFile], {
      processingType: 'general',
      includeTopics: true,
      includeInsights: true
    });
    
    console.log('\n📋 General Analysis Result:');
    console.log('- Success:', generalResult.success);
    console.log('- Has fallback reason:', !!generalResult.fallback_reason);
    if (generalResult.fallback_reason) {
      console.log('- Fallback reason:', generalResult.fallback_reason);
    }
    console.log('- Content length:', generalResult.content ? generalResult.content.length : 0);
    if (generalResult.content) {
      console.log('- Content preview:', generalResult.content.substring(0, 300) + '...');
    }
    
    // Test syllabus analysis if it looks like a syllabus
    if (fileName.toLowerCase().includes('syllabus') || fileName.toLowerCase().includes('course')) {
      console.log('\n📚 Testing syllabus analysis...');
      const syllabusResult = await client.processFiles([mockFile], {
        processingType: 'syllabus_extraction',
        fileType: 'syllabus'
      });
      
      console.log('\n📋 Syllabus Analysis Result:');
      console.log('- Success:', syllabusResult.success);
      console.log('- Has fallback reason:', !!syllabusResult.fallback_reason);
      if (syllabusResult.fallback_reason) {
        console.log('- Fallback reason:', syllabusResult.fallback_reason);
      }
      if (syllabusResult.entities) {
        console.log('- Extracted entities:', Object.keys(syllabusResult.entities));
      }
    }
    
  } catch (error) {
    console.error('❌ Error during processing:');
    console.error(error.message);
    if (error.stack) {
      console.error('\n📚 Stack trace:');
      console.error(error.stack);
    }
  }
}

function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Run the debug tool
const filePath = process.argv[2];
debugAmplify(filePath).catch(console.error);