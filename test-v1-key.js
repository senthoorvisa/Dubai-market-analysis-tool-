/**
 * Simple OpenAI API Key Tester for the new API key format (sk-or-v1)
 * This script tests if your OpenAI API key is valid and working
 * 
 * Usage: node test-v1-key.js YOUR_API_KEY
 */

const https = require('https');

// Get API key from command line arguments
const apiKey = process.argv[2];

if (!apiKey) {
  console.error('Error: No API key provided.');
  console.error('Usage: node test-v1-key.js YOUR_API_KEY');
  process.exit(1);
}

console.log('OpenAI API Key Tester (v1 Format)');
console.log('----------------------------------');
console.log(`Testing key: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`);

// Create the request options
const data = JSON.stringify({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "user",
      content: "Hello, this is a test. Please respond with just the text 'API key is working!'"
    }
  ],
  max_tokens: 10
});

const options = {
  hostname: 'api.openai.com',
  port: 443,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': data.length
  }
};

// Send the request
console.log('Sending test request to OpenAI API...');

const req = https.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log(`\nResponse Status: ${res.statusCode} ${res.statusMessage}`);
    
    try {
      const parsedData = JSON.parse(responseData);
      console.log('\nResponse Data:');
      console.log(JSON.stringify(parsedData, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ SUCCESS: API key is working correctly!');
        if (parsedData.choices && parsedData.choices.length > 0) {
          console.log(`Response from OpenAI: "${parsedData.choices[0].message.content}"`);
        }
      } else {
        console.log('\n❌ ERROR: The API key is not working.');
        
        if (parsedData.error) {
          if (parsedData.error.type === 'authentication_error') {
            console.log('This is an authentication error. Your API key is invalid or revoked.');
            console.log('Visit https://platform.openai.com/api-keys to create a new key.');
          } else if (parsedData.error.type === 'insufficient_quota') {
            console.log('Your account does not have sufficient quota or credits.');
            console.log('Visit https://platform.openai.com/account/billing to add credits.');
          } else {
            console.log(`Error type: ${parsedData.error.type}`);
            console.log(`Error message: ${parsedData.error.message}`);
          }
        }
      }
    } catch (error) {
      console.log('\n❌ ERROR: Could not parse the response.');
      console.log(`Raw response: ${responseData}`);
    }
  });
});

req.on('error', (error) => {
  console.log(`\n❌ Network Error: ${error.message}`);
});

req.write(data);
req.end(); 