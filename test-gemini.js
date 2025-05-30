const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test Gemini 1.5 Pro API
async function testGeminiAPI() {
  try {
    console.log('Testing Gemini 1.5 Pro API...');
    
    // Check if API key is available
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ NEXT_PUBLIC_GEMINI_API_KEY not found in environment variables');
      console.log('Please add your Gemini API key to your .env file:');
      console.log('NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here');
      return;
    }
    
    console.log('✅ API key found');
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    console.log('✅ Gemini 1.5 Pro model initialized');
    
    // Test with a simple prompt
    const prompt = `Test prompt: Please confirm you are Gemini 1.5 Pro and can access real-time web data for Dubai real estate. Respond with just "WORKING" if successful.`;
    
    console.log('🔄 Sending test prompt...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Response received:');
    console.log(text);
    
    // Test property search functionality
    console.log('\n🔄 Testing property search functionality...');
    
    const propertyPrompt = `Search for real-time property data in Dubai Marina for 2-bedroom apartments. Provide current prices from Bayut.com and PropertyFinder.ae. Keep response brief.`;
    
    const propertyResult = await model.generateContent(propertyPrompt);
    const propertyResponse = await propertyResult.response;
    const propertyText = propertyResponse.text();
    
    console.log('✅ Property search response:');
    console.log(propertyText.substring(0, 500) + '...');
    
    console.log('\n🎉 Gemini 1.5 Pro API is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing Gemini API:', error.message);
    
    if (error.message.includes('404')) {
      console.log('💡 This suggests the model name is incorrect or not available');
    } else if (error.message.includes('API key')) {
      console.log('💡 Please check your API key configuration');
    } else if (error.message.includes('quota')) {
      console.log('💡 You may have exceeded your API quota');
    }
  }
}

// Run the test
testGeminiAPI(); 