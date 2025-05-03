// Simple script to test if an OpenAI API key works
const { OpenAI } = require('openai');

async function testApiKey(apiKey) {
  if (!apiKey) {
    console.error('No API key provided. Please provide an API key as an argument.');
    console.error('Usage: node test-api-key.js YOUR_API_KEY');
    process.exit(1);
  }

  console.log('Testing API key...');
  
  try {
    // Create OpenAI client with the provided API key
    const openai = new OpenAI({ 
      apiKey: apiKey
    });
    
    // Make a simple test request
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, this is a test. Please respond with 'API key is working.'" }],
      max_tokens: 10
    });
    
    if (response && response.choices && response.choices.length > 0) {
      console.log('✅ API key is working correctly!');
      console.log('Response:', response.choices[0].message.content);
      return true;
    } else {
      console.error('❌ Received an empty response. Please check your API key.');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing API key:', error.message);
    if (error.message.includes('401')) {
      console.error('This appears to be an authentication error. Your API key is likely invalid.');
    }
    return false;
  }
}

// Get API key from command line arguments
const apiKey = process.argv[2];
testApiKey(apiKey); 