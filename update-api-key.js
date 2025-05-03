// Script to update the OpenAI API key in localStorage
const updateKey = () => {
  // The new API key
  const newApiKey = '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';
  
  // Clear any existing API key
  localStorage.removeItem('openai_api_key');
  localStorage.removeItem('openai_key_metadata');
  
  // Set the new API key
  localStorage.setItem('openai_api_key', newApiKey);
  
  console.log('API key updated successfully!');
  console.log('Please refresh the application to use the new API key.');
};

// Execute the update
updateKey(); 