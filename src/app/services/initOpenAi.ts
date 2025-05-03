import OpenAI from 'openai';

// Prioritize environment variable for API key if available
const apiKeyFromEnv = process.env.OPENAI_API_KEY || '';

// Try to get API key from localStorage
const getStoredApiKey = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('openai_api_key') || '';
  }
  return '';
};

// DO NOT use hardcoded API keys - this is a security vulnerability
// The API key will be set dynamically at runtime through a secure method
const openai = new OpenAI({ 
  apiKey: apiKeyFromEnv || getStoredApiKey(),  // Use environment variable or localStorage
  dangerouslyAllowBrowser: true  // Need this for client-side API calls with API key stored in localStorage
});

// Function to update the API key securely
export const updateApiKey = (key: string, orgId?: string) => {
  if (!key || key.length < 20) {
    throw new Error('Invalid API key format');
  }
  
  // Update the API configuration with the provided key and org ID if available
  openai.apiKey = key;
  if (orgId) {
    openai.organization = orgId;
  }

  // Save to localStorage if we're in a browser environment
  if (typeof window !== 'undefined') {
    localStorage.setItem('openai_api_key', key);
  }
  
  return openai;
};

// Export the initialization function
export const initOpenAI = () => {
  // Check if we need to update the API key from localStorage on init
  const storedKey = getStoredApiKey();
  if (!openai.apiKey && storedKey) {
    openai.apiKey = storedKey;
  }
  
  return openai;
};

// Export the instance as default
export default openai; 