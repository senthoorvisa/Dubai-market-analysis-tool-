/**
 * Simple OpenAI API Key Tester for the project-scoped API key format (sk-proj-)
 * This script tests if your OpenAI project-scoped API key is valid and working
 * 
 * Usage: node test-proj-key.js
 */

const https = require('https');

// The API key to test
const apiKey = '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';

console.log('OpenAI API Key Tester (Project-Scoped Format)');
console.log('----------------------------------');
console.log(`Testing key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

// Create the request options
const data = JSON.stringify({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "user",
      content: "Hello, this is a test. Please respond with 'API key is working!'"
    }
  ],
  max_tokens: 20
});

const options = {
  hostname: 'api.openai.com',
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': data.length
  }
};

// Send the request
console.log('\nSending request to OpenAI API...');
const req = https.request(options, (res) => {
  let responseData = '';
  
  // Status code check
  console.log(`Status Code: ${res.statusCode}`);
  if (res.statusCode === 200) {
    console.log('✓ Status code 200 - Request successful');
  } else {
    console.error(`✗ Error status code: ${res.statusCode}`);
  }

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const parsedData = JSON.parse(responseData);
      
      if (res.statusCode === 200) {
        console.log('\n✅ API KEY IS WORKING! ✅');
        console.log('\nResponse:');
        console.log(`- Model: ${parsedData.model}`);
        console.log(`- Response: "${parsedData.choices[0].message.content}"`);
        console.log(`- Tokens used: ${parsedData.usage.total_tokens}`);
        console.log('\nYour API key is valid and has sufficient credits. You can use it in your application.');
      } else {
        console.error('\n❌ API KEY ERROR ❌');
        console.error('\nError details:');
        console.error(parsedData.error?.message || 'Unknown error');
        
        if (parsedData.error?.type === 'insufficient_quota') {
          console.error('\nYour account has insufficient quota. Please check your billing status.');
        } else if (parsedData.error?.code === 'invalid_api_key') {
          console.error('\nInvalid API key format or the key has been revoked.');
        }
      }
    } catch (error) {
      console.error('\n❌ Failed to parse response:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ REQUEST ERROR ❌');
  console.error(error.message);
});

// Write data to request body
req.write(data);
req.end(); 