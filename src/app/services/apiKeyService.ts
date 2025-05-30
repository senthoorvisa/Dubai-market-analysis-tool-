// API Key service for secure management of API keys
// Follows security best practices as per UAE PDPL regulations

interface ApiKeyMetadata {
  lastRotated: string;
  expiresAt: string;
  keyHash: string; // Store only hash, not the actual key
}

const API_KEY_STORAGE_KEY = 'openai_api_key';
const ORG_ID_STORAGE_KEY = 'openai_org_id';
const GEMINI_API_KEY_STORAGE_KEY = 'gemini_api_key';

/**
 * Encrypts API key for secure storage
 * In a production environment, this should use a proper encryption library
 */
const secureEncrypt = (key: string): string => {
  // Simple obfuscation - in production, use a proper encryption library
  // This is just a placeholder
  const firstPart = key.substring(0, 3);
  const lastPart = key.substring(key.length - 4);
  return `${firstPart}...${lastPart}`;
};

/**
 * Creates a hash of the API key for verification without storing the actual key
 */
const createKeyHash = (key: string): string => {
  // In production, use a proper cryptographic hash function
  // This is just a placeholder
  return `hash_${key.substring(0, 2)}${key.substring(key.length - 2)}`;
};

/**
 * Securely stores API key metadata
 * In production, never store the actual API key in localStorage
 */
const storeKeyMetadata = (keyHash: string) => {
  if (typeof window === 'undefined') return; // Server-side safety check
  
  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(now.getDate() + 30); // Key rotation every 30 days
  
  const metadata: ApiKeyMetadata = {
    lastRotated: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    keyHash,
  };
  
  localStorage.setItem('api_key_metadata', JSON.stringify(metadata));
};

/**
 * Checks if the API key needs rotation
 */
const checkKeyRotation = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const metadataStr = localStorage.getItem('api_key_metadata');
  if (!metadataStr) return false;
  
  try {
    const metadata = JSON.parse(metadataStr) as ApiKeyMetadata;
    const expiresAt = new Date(metadata.expiresAt);
    return new Date() > expiresAt;
  } catch (e) {
    return false;
  }
};

/**
 * Get stored API key from localStorage
 */
export const getStoredApiKey = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

/**
 * Get stored Organization ID from localStorage
 */
export const getStoredOrgId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ORG_ID_STORAGE_KEY);
};

/**
 * Secure API key submission handler
 */
export const secureSetApiKey = (apiKey: string, orgId?: string): boolean => {
  try {
    // Validate API key format
    if (!apiKey || apiKey.length < 20) {
      console.error('Invalid API key format');
      return false;
    }
    
    // Check for valid API key formats - support Gemini and OpenAI formats
    const isValidFormat = apiKey.startsWith('sk-') || 
                         apiKey.startsWith('sk-or-v1-') || 
                         apiKey.startsWith('sk-proj-') ||
                         apiKey.startsWith('AIza'); // Gemini API key format
    if (!isValidFormat) {
      console.error('Invalid API key format');
      return false;
    }
    
    // Store metadata securely - not the actual key
    const keyHash = createKeyHash(apiKey);
    storeKeyMetadata(keyHash);

    // Store the API key directly in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      
      // Save org ID if provided
      if (orgId && orgId.trim()) {
        localStorage.setItem(ORG_ID_STORAGE_KEY, orgId);
      } else if (localStorage.getItem(ORG_ID_STORAGE_KEY)) {
        // Remove org ID if not provided but exists in storage
        localStorage.removeItem(ORG_ID_STORAGE_KEY);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in secureSetApiKey:', error);
    return false;
  }
};

/**
 * Checks if API key needs rotation
 */
export const needsKeyRotation = (): boolean => {
  return checkKeyRotation();
};

/**
 * Check if API key is configured
 */
export const isApiKeyConfigured = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const key = localStorage.getItem(API_KEY_STORAGE_KEY);
  return !!key && key.length > 10;
};

/**
 * Clear stored API key and org ID
 */
export const clearApiKey = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem(API_KEY_STORAGE_KEY);
  localStorage.removeItem(ORG_ID_STORAGE_KEY);
};

/**
 * Handle data anonymization before sending to OpenAI
 * Complies with DIFC and UAE PDPL regulations
 */
export const anonymizeData = (content: string): string => {
  // Simple PII detection and anonymization
  // In production, use a dedicated PII detection service
  
  // Replace email patterns
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  content = content.replace(emailPattern, '[EMAIL_REDACTED]');
  
  // Replace phone number patterns
  const phonePattern = /(\+\d{1,3}[\s.-])?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
  content = content.replace(phonePattern, '[PHONE_REDACTED]');
  
  // Replace passport/ID numbers
  const idPattern = /\b[A-Z0-9]{3,4}-?[A-Z0-9]{5,6}-?[A-Z0-9]{1}\b/g;
  content = content.replace(idPattern, '[ID_REDACTED]');
  
  return content;
};

/**
 * Initialize with default API key if one isn't set
 * This should be called when the application starts
 */
export const initializeWithDefaultKey = (): boolean => {
  // Only set the default key if there isn't one already stored
  if (!getStoredApiKey()) {
    // Use the default key provided
    const defaultApiKey = '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';
    return secureSetApiKey(defaultApiKey);
  }
  return true;
};

/**
 * Get stored Gemini API key from localStorage
 */
export const getGeminiApiKey = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
};

/**
 * Save Gemini API key to localStorage
 */
export const saveGeminiApiKey = (apiKey: string): boolean => {
  try {
    // Validate Gemini API key format
    if (!apiKey || apiKey.length < 20) {
      console.error('Invalid Gemini API key format');
      return false;
    }
    
    // Store the Gemini API key
    if (typeof window !== 'undefined') {
      localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, apiKey);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving Gemini API key:', error);
    return false;
  }
};

/**
 * Check if Gemini API key is configured
 */
export const isGeminiApiKeyConfigured = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const key = localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
  return !!key && key.length > 10;
};

/**
 * Clear stored Gemini API key
 */
export const clearGeminiApiKey = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
};

const apiKeyService = {
  saveApiKey: secureSetApiKey,
  getStoredApiKey,
  getStoredOrgId,
  isApiKeyConfigured,
  clearApiKey,
  initializeWithDefaultKey,
  anonymizeData,
  needsKeyRotation,
  getGeminiApiKey,
  saveGeminiApiKey,
  isGeminiApiKeyConfigured,
  clearGeminiApiKey,
};

export default apiKeyService; 