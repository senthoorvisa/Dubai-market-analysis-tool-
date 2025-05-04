import OpenAI from 'openai';

const API_KEY_STORAGE_KEY = 'openai_api_key';
const ORG_ID_STORAGE_KEY = 'openai_org_id';

// Create OpenAI instance with an initial placeholder
let openai = new OpenAI({
  apiKey: 'placeholder',
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

// Update the API key for the OpenAI instance
export function updateApiKey(apiKey: string, orgId?: string): void {
  try {
    // Validate API key
    if (!apiKey || !apiKey.startsWith('sk-')) {
      throw new Error('Invalid API key format');
    }
    
    // Create a new instance with the provided key
    openai = new OpenAI({
      apiKey: apiKey,
      organization: orgId || undefined,
      dangerouslyAllowBrowser: true,
    });
    
    console.log('OpenAI API initialized successfully');
  } catch (error) {
    console.error('Error updating OpenAI API key:', error);
    throw error;
  }
}

// Initialize with stored key if available
if (typeof window !== 'undefined') {
  try {
    // Direct localStorage access to avoid circular dependency
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    const storedOrgId = localStorage.getItem(ORG_ID_STORAGE_KEY);
    
    if (storedKey) {
      updateApiKey(storedKey, storedOrgId || undefined);
    }
  } catch (error) {
    console.error('Failed to initialize OpenAI with stored key:', error);
  }
}

export default openai; 