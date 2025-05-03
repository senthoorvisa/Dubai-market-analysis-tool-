#!/usr/bin/env node
const { execSync } = require('child_process');
const https = require('https');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Get API key from command line arguments
const apiKey = process.argv[2];

if (!apiKey) {
  console.log(`${colors.red}Error: No API key provided.${colors.reset}`);
  console.log(`${colors.yellow}Usage: node verify-api-key.js YOUR_API_KEY${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.blue}===== API Key Verification Tool =====${colors.reset}`);

// Step 1: Validate API key format
function validateKeyFormat(key) {
  console.log(`\n${colors.cyan}Step 1: Validating API key format${colors.reset}`);
  
  if (!key || key.length < 20) {
    console.log(`${colors.red}✘ Invalid: API key is too short (less than 20 characters)${colors.reset}`);
    return false;
  }
  
  // Check for valid API key formats
  const isOldFormat = key.startsWith('sk-');
  const isNewFormat = key.startsWith('sk-or-v1-');
  
  if (!isOldFormat && !isNewFormat) {
    console.log(`${colors.red}✘ Invalid: API key must start with 'sk-' or 'sk-or-v1-'${colors.reset}`);
    return false;
  }
  
  if (isNewFormat) {
    console.log(`${colors.green}✓ Valid: Using new API key format (sk-or-v1-...)${colors.reset}`);
    
    // Additional validation for new format structure
    const parts = key.split('-');
    if (parts.length < 4) {
      console.log(`${colors.yellow}⚠ Warning: New API key format structure seems unusual${colors.reset}`);
    }
  } else {
    console.log(`${colors.green}✓ Valid: Using classic API key format (sk-...)${colors.reset}`);
  }
  
  return true;
}

// Step 2: Test API key with OpenAI API
function testApiKey(key) {
  return new Promise((resolve, reject) => {
    console.log(`\n${colors.cyan}Step 2: Testing API key with OpenAI${colors.reset}`);
    console.log(`${colors.blue}Sending test request to OpenAI API...${colors.reset}`);
    
    const data = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Hello, this is a test. Please respond with 'API key is working!'"
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
        'Authorization': `Bearer ${key}`,
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          
          if (res.statusCode === 200) {
            console.log(`${colors.green}✓ Success! API key is working correctly.${colors.reset}`);
            console.log(`${colors.blue}Response:${colors.reset} ${parsedData.choices[0].message.content}`);
            resolve({ success: true, data: parsedData });
          } else {
            console.log(`${colors.red}✘ Error: ${res.statusCode} ${res.statusMessage}${colors.reset}`);
            console.log(`${colors.yellow}Error details: ${parsedData.error?.message || 'Unknown error'}${colors.reset}`);
            
            // Detailed error information based on error type
            if (parsedData.error?.type === 'invalid_request_error') {
              console.log(`${colors.yellow}This might be due to:${colors.reset}`);
              console.log(`  - Incorrect API key format`);
              console.log(`  - API key has been revoked`);
              console.log(`  - The model is not available for your account`);
            } else if (parsedData.error?.type === 'authentication_error') {
              console.log(`${colors.yellow}This indicates your API key is invalid or has been revoked.${colors.reset}`);
            } else if (res.statusCode === 429) {
              console.log(`${colors.yellow}You have exceeded your API rate limit or have insufficient quota.${colors.reset}`);
            }
            
            resolve({ success: false, data: parsedData, statusCode: res.statusCode });
          }
        } catch (error) {
          console.log(`${colors.red}✘ Error parsing response: ${error.message}${colors.reset}`);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`${colors.red}✘ Network error: ${error.message}${colors.reset}`);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// Step 3: Check API key billing status
function checkBillingStatus() {
  console.log(`\n${colors.cyan}Step 3: Checking API key billing status${colors.reset}`);
  console.log(`${colors.yellow}Note: This can only be done manually via the OpenAI dashboard.${colors.reset}`);
  console.log(`To check your billing status and available credits, visit:`);
  console.log(`  - ${colors.blue}https://platform.openai.com/account/usage${colors.reset}`);
  console.log(`  - ${colors.blue}https://platform.openai.com/settings/organization/billing/overview${colors.reset}`);
}

// Step 4: Suggestions for fixing issues
function provideSuggestions(testResult) {
  console.log(`\n${colors.cyan}Step 4: Suggestions${colors.reset}`);
  
  if (testResult && testResult.success) {
    console.log(`${colors.green}Your API key is working correctly! Here are some tips:${colors.reset}`);
    console.log(`  - Store this key securely - never expose it in client-side code`);
    console.log(`  - Consider setting usage limits in the OpenAI dashboard`);
    console.log(`  - Implement key rotation for production applications`);
    return;
  }
  
  console.log(`${colors.yellow}If you're experiencing issues, try these steps:${colors.reset}`);
  
  if (testResult && testResult.statusCode === 401) {
    console.log(`  1. ${colors.magenta}Your key appears to be invalid. Generate a new API key in the OpenAI dashboard:${colors.reset}`);
    console.log(`     ${colors.blue}https://platform.openai.com/api-keys${colors.reset}`);
  } else if (testResult && testResult.statusCode === 429) {
    console.log(`  1. ${colors.magenta}You may have reached your rate limit or used all your credits:${colors.reset}`);
    console.log(`     - Check your usage at ${colors.blue}https://platform.openai.com/account/usage${colors.reset}`);
    console.log(`     - Add billing information or upgrade your plan if needed`);
  } else {
    console.log(`  1. ${colors.magenta}Generate a new API key in the OpenAI dashboard:${colors.reset}`);
    console.log(`     ${colors.blue}https://platform.openai.com/api-keys${colors.reset}`);
  }
  
  console.log(`  2. ${colors.magenta}Ensure your account has sufficient credits or a valid payment method${colors.reset}`);
  console.log(`  3. ${colors.magenta}Try using a different model (e.g., gpt-3.5-turbo instead of gpt-4)${colors.reset}`);
  console.log(`  4. ${colors.magenta}Check the API status page:${colors.reset} ${colors.blue}https://status.openai.com/${colors.reset}`);
}

// Main function
async function main() {
  try {
    const isValidFormat = validateKeyFormat(apiKey);
    
    if (!isValidFormat) {
      console.log(`\n${colors.red}API key format validation failed. Please check your key and try again.${colors.reset}`);
      process.exit(1);
    }
    
    const testResult = await testApiKey(apiKey);
    checkBillingStatus();
    provideSuggestions(testResult);
    
    console.log(`\n${colors.blue}===== Verification Complete =====${colors.reset}`);
    
    if (testResult && testResult.success) {
      console.log(`${colors.green}Your API key is working correctly!${colors.reset}`);
      process.exit(0);
    } else {
      console.log(`${colors.red}There were issues with your API key. See above for details.${colors.reset}`);
      process.exit(1);
    }
  } catch (error) {
    console.log(`\n${colors.red}Error during verification: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the main function
main(); 