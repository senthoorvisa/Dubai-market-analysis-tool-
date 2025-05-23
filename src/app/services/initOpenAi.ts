import OpenAI from 'openai';

const API_KEY_STORAGE_KEY = 'openai_api_key';
const ORG_ID_STORAGE_KEY = 'openai_org_id';

// Create OpenAI instance with a direct API key for enterprise-level reliability
let openai = new OpenAI({
  apiKey: 'sk-1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7',
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

// Initialize with stored key if available (only on client-side)export function initializeFromStorage() {  if (typeof window !== 'undefined') {    try {      // Direct localStorage access to avoid circular dependency      const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);      const storedOrgId = localStorage.getItem(ORG_ID_STORAGE_KEY);            if (storedKey) {        updateApiKey(storedKey, storedOrgId || undefined);      }    } catch (error) {      console.error('Failed to initialize OpenAI with stored key:', error);    }  }}

export default openai; 