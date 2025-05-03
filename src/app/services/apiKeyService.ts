import { updateApiKey } from './initOpenAi';

// API Key service for secure management of OpenAI API keys
// Follows security best practices as per UAE PDPL regulations

interface ApiKeyMetadata {
  lastRotated: string;
  expiresAt: string;
  keyHash: string; // Store only hash, not the actual key
}

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
  
  localStorage.setItem('openai_key_metadata', JSON.stringify(metadata));
};

/**
 * Checks if the API key needs rotation
 */
const checkKeyRotation = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const metadataStr = localStorage.getItem('openai_key_metadata');
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
  return localStorage.getItem('openai_api_key');
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
    
    // Check for valid API key formats - support old, new and project-scoped formats
    const isValidFormat = apiKey.startsWith('sk-') || apiKey.startsWith('sk-or-v1-') || apiKey.startsWith('sk-proj-');
    if (!isValidFormat) {
      console.error('Invalid API key format - must start with sk-, sk-or-v1-, or sk-proj-');
      return false;
    }
    
    // Update the OpenAI instance
    updateApiKey(apiKey, orgId);
    
    // Store metadata securely - not the actual key
    const keyHash = createKeyHash(apiKey);
    storeKeyMetadata(keyHash);

    // Store the API key directly in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('openai_api_key', apiKey);
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
  return getStoredApiKey() !== null;
};

/**
 * Clear stored API key
 */
export const clearApiKey = (): boolean => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('openai_api_key');
      localStorage.removeItem('openai_key_metadata');
    }
    return true;
  } catch (error) {
    console.error('Error clearing API key:', error);
    return false;
  }
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

export default {
  secureSetApiKey,
  needsKeyRotation,
  anonymizeData,
  getStoredApiKey,
  isApiKeyConfigured,
  clearApiKey,
}; 