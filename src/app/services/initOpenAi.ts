import OpenAI from 'openai';

// Initialize OpenAI with server-side API key
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export default openai; 