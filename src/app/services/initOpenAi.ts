import OpenAI from 'openai';

const API_KEY_STORAGE_KEY = 'openai_api_key';
const ORG_ID_STORAGE_KEY = 'openai_org_id';

// Create OpenAI instance with a default configuration that will be updated
let openai = new OpenAI({
  apiKey: 'sk-temp-invalid-key', // This will be replaced immediately
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

// Initialize with stored key if available (only on client-side)
export function initializeFromStorage() {
  if (typeof window !== 'undefined') {
    try {
      // Direct localStorage access to avoid circular dependency
      const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      const storedOrgId = localStorage.getItem(ORG_ID_STORAGE_KEY);
      
      if (storedKey) {
        updateApiKey(storedKey, storedOrgId || undefined);
      } else {
        // Initialize with the default API key from the service
        const defaultApiKey = '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';
        updateApiKey(defaultApiKey);
        localStorage.setItem(API_KEY_STORAGE_KEY, defaultApiKey);
      }
    } catch (error) {
      console.error('Failed to initialize OpenAI with stored key:', error);
    }
  }
}

export default openai; 