/**
 * Environment Configuration for Dubai Market Analysis Tool
 * Handles API keys, settings, and data quality parameters
 */

export interface EnvironmentConfig {
  // API Keys
  openaiApiKey?: string;
  scrapingBeeApiKey?: string;
  scraperApiKey?: string;
  scrapestackApiKey?: string;
  bayutApiKey?: string;
  propertyfinderApiKey?: string;

  // Application Settings
  nodeEnv: string;
  appUrl: string;

  // Performance & Rate Limiting
  rateLimitPerMinute: number;
  cacheDurationMinutes: number;
  requestTimeoutSeconds: number;

  // Data Quality
  minConfidenceThreshold: number;
  enablePriceValidation: boolean;
  enableCrossVerification: boolean;

  // Mock Data Control
  useMockData: boolean;
  fallbackToMockOnError: boolean;
  enableRealApiCalls: boolean;

  // Logging & Monitoring
  logLevel: string;
  enablePerformanceMonitoring: boolean;
}

/**
 * Load and validate environment configuration
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  // Check for required environment variables
  const requiredEnvVars: string[] = [];
  
  // Log missing variables but don't crash the app
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars.join(', '));
    console.warn('Some features may not work without proper API keys.');
  }

  return {
    // API Keys
    openaiApiKey: process.env.OPENAI_API_KEY,
    scrapingBeeApiKey: process.env.SCRAPINGBEE_API_KEY,
    scraperApiKey: process.env.SCRAPER_API_KEY,
    scrapestackApiKey: process.env.SCRAPESTACK_API_KEY,
    bayutApiKey: process.env.BAYUT_API_KEY,
    propertyfinderApiKey: process.env.PROPERTYFINDER_API_KEY,

    // Application Settings
    nodeEnv: process.env.NODE_ENV || 'development',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

    // Performance & Rate Limiting
    rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '30'),
    cacheDurationMinutes: parseInt(process.env.CACHE_DURATION_MINUTES || '30'),
    requestTimeoutSeconds: parseInt(process.env.REQUEST_TIMEOUT_SECONDS || '30'),

    // Data Quality
    minConfidenceThreshold: parseFloat(process.env.MIN_CONFIDENCE_THRESHOLD || '0.7'),
    enablePriceValidation: process.env.ENABLE_PRICE_VALIDATION !== 'false',
    enableCrossVerification: process.env.ENABLE_CROSS_VERIFICATION !== 'false',

    // Mock Data Control
    useMockData: process.env.USE_MOCK_DATA === 'true',
    fallbackToMockOnError: process.env.FALLBACK_TO_MOCK_ON_ERROR !== 'false',
    enableRealApiCalls: process.env.ENABLE_REAL_API_CALLS !== 'false',

    // Logging & Monitoring
    logLevel: process.env.LOG_LEVEL || 'info',
    enablePerformanceMonitoring: process.env.ENABLE_PERFORMANCE_MONITORING === 'true'
  };
}

/**
 * Get API key for specific service with fallbacks
 */
export function getApiKey(service: 'scraping' | 'openai' | 'bayut' | 'propertyfinder'): string | undefined {
  const config = loadEnvironmentConfig();

  switch (service) {
    case 'scraping':
      return config.scrapingBeeApiKey || config.scraperApiKey || config.scrapestackApiKey;
    case 'openai':
      return config.openaiApiKey;
    case 'bayut':
      return config.bayutApiKey;
    case 'propertyfinder':
      return config.propertyfinderApiKey;
    default:
      return undefined;
  }
}

/**
 * Validate that required API keys are available for core functionality
 */
export function validateConfiguration(): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const config = loadEnvironmentConfig();
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check scraping capability
  const hasScrapingKey = config.scrapingBeeApiKey || config.scraperApiKey || config.scrapestackApiKey;
  if (!hasScrapingKey) {
    warnings.push('No web scraping API key configured. Real-time data fetching will be limited.');
  }

  // Check AI capability
  if (!config.openaiApiKey) {
    warnings.push('No OpenAI API key configured. AI analysis features will be unavailable.');
  }

  // Validate numeric configurations
  if (config.rateLimitPerMinute <= 0) {
    errors.push('Rate limit must be positive');
  }

  if (config.cacheDurationMinutes <= 0) {
    errors.push('Cache duration must be positive');
  }

  if (config.minConfidenceThreshold < 0 || config.minConfidenceThreshold > 1) {
    errors.push('Confidence threshold must be between 0 and 1');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}

// Export singleton instance
export const environmentConfig = loadEnvironmentConfig();

export default environmentConfig; 