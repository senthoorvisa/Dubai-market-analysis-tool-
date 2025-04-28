import OpenAI from 'openai';

// Initialize OpenAI with API key
const openai = new OpenAI({ 
  apiKey: 'sk-proj-4QJq3X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3',
  dangerouslyAllowBrowser: true
});

// Export the initialization function
export const initOpenAI = () => {
  return openai;
};

// Export the instance as default
export default openai; 