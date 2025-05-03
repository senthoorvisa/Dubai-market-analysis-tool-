import OpenAI from 'openai';
import { updateApiKey } from './initOpenAi';
import { functionSchemas } from './promptTemplates';

interface OpenAIClientOptions {
  maxRetries: number;
  initialBackoff: number;
  maxBackoff: number;
  telemetryEnabled: boolean;
  timeoutMs: number;
}

interface TelemetryData {
  requestId: string;
  model: string;
  startTime: number;
  endTime: number;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  success: boolean;
  error?: string;
  endpoint: string;
  userIdentifier?: string;
}

/**
 * OpenAI Client with advanced features:
 * - Retry with exponential backoff
 * - Request telemetry
 * - Error handling and normalization
 * - Rate limit detection and handling
 */
class OpenAIClient {
  private readonly openai: OpenAI;
  private readonly options: OpenAIClientOptions;
  private telemetryData: TelemetryData[] = [];
  private quotaRemaining: Record<string, number> = {};
  private lastRequestTime: number = 0;
  private requestCounter: number = 0;
  
  constructor(apiKey: string = '', options?: Partial<OpenAIClientOptions>) {
    // Use provided API key, or fall back to env var, or use empty string
    const effectiveApiKey = apiKey || process.env.OPENAI_API_KEY || '';
    
    // Set the API key
    if (effectiveApiKey) {
      updateApiKey(effectiveApiKey);
    }
    
    // Initialize OpenAI client
    this.openai = new OpenAI({
      apiKey: effectiveApiKey,
      dangerouslyAllowBrowser: process.env.NODE_ENV === 'development'
    });
    
    // Set default options
    this.options = {
      maxRetries: 3,
      initialBackoff: 1000, // 1 second
      maxBackoff: 60000, // 60 seconds
      telemetryEnabled: true,
      timeoutMs: 60000, // 60 seconds
      ...options
    };
  }
  
  /**
   * Make a chat completion request with retry logic and telemetry
   */
  async createChatCompletion(
    params: OpenAI.ChatCompletionCreateParams,
    abortSignal?: AbortSignal
  ): Promise<OpenAI.ChatCompletion> {
    const requestId = `req_${Date.now()}_${this.requestCounter++}`;
    const startTime = Date.now();
    let telemetry: Partial<TelemetryData> = {
      requestId,
      model: params.model,
      startTime,
      endpoint: 'chat.completions',
      userIdentifier: params.user,
    };
    
    // Track requests for rate limiting
    this.trackRequest();
    
    // Create controller for timeout
    const timeoutController = new AbortController();
    const timeout = setTimeout(() => {
      timeoutController.abort();
    }, this.options.timeoutMs);
    
    // Combine abort signals if provided
    const signal = abortSignal ? this.combineAbortSignals(abortSignal, timeoutController.signal) : timeoutController.signal;
    
    let retries = 0;
    let lastError: Error | null = null;
    
    while (retries <= this.options.maxRetries) {
      try {
        // Calculate backoff time
        if (retries > 0) {
          const backoffTime = Math.min(
            this.options.initialBackoff * Math.pow(2, retries - 1),
            this.options.maxBackoff
          );
          
          // Add jitter to avoid thundering herd
          const jitter = Math.random() * 0.3 * backoffTime;
          const backoffWithJitter = backoffTime + jitter;
          
          // Log retry information
          console.log(`Retrying OpenAI request (${retries}/${this.options.maxRetries}) after ${Math.round(backoffWithJitter)}ms`);
          
          // Wait for backoff time
          await new Promise(resolve => setTimeout(resolve, backoffWithJitter));
        }
        
        // Add function calling if needed
        if (params.functions === undefined && params.function_call) {
          params.functions = functionSchemas;
        }
        
        // Make the request
        const completion = await this.openai.chat.completions.create({
          ...params
        }, { signal });
        
        // Record telemetry on success
        if (this.options.telemetryEnabled) {
          const endTime = Date.now();
          telemetry = {
            ...telemetry,
            endTime,
            latencyMs: endTime - startTime,
            inputTokens: completion.usage?.prompt_tokens || 0,
            outputTokens: completion.usage?.completion_tokens || 0,
            success: true
          };
          this.recordTelemetry(telemetry as TelemetryData);
        }
        
        // Clear timeout
        clearTimeout(timeout);
        
        return completion;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry if the request was aborted
        if (error.name === 'AbortError') {
          console.error('OpenAI request aborted:', error);
          throw new Error('Request aborted: timeout or user cancellation');
        }
        
        // Check for specific OpenAI error types
        if (error.status === 429) {
          // Rate limit hit - add longer backoff
          retries++;
          console.error(`OpenAI rate limit hit, retrying (${retries}/${this.options.maxRetries})`, error);
          continue;
        } else if (error.status >= 500) {
          // Server error - retry
          retries++;
          console.error(`OpenAI server error (${error.status}), retrying (${retries}/${this.options.maxRetries})`, error);
          continue;
        } else if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
          // Network error - retry
          retries++;
          console.error(`OpenAI network error (${error.code}), retrying (${retries}/${this.options.maxRetries})`, error);
          continue;
        } else {
          // Client error or unknown error - don't retry
          console.error('OpenAI request failed with non-retriable error:', error);
          clearTimeout(timeout);
          
          // Record telemetry on error
          if (this.options.telemetryEnabled) {
            const endTime = Date.now();
            telemetry = {
              ...telemetry,
              endTime,
              latencyMs: endTime - startTime,
              success: false,
              error: error.message
            };
            this.recordTelemetry(telemetry as TelemetryData);
          }
          
          throw this.normalizeError(error);
        }
      }
    }
    
    // If we exhausted retries, throw the last error
    console.error(`OpenAI request failed after ${this.options.maxRetries} retries`);
    clearTimeout(timeout);
    
    // Record telemetry on exhausted retries
    if (this.options.telemetryEnabled) {
      const endTime = Date.now();
      telemetry = {
        ...telemetry,
        endTime,
        latencyMs: endTime - startTime,
        success: false,
        error: `Failed after ${this.options.maxRetries} retries. Last error: ${lastError?.message}`
      };
      this.recordTelemetry(telemetry as TelemetryData);
    }
    
    throw this.normalizeError(lastError);
  }
  
  /**
   * Normalize different types of errors into a standard format
   */
  private normalizeError(error: any): Error {
    if (!error) return new Error('Unknown error occurred');
    
    // Handle OpenAI API errors
    if (error.status) {
      switch (error.status) {
        case 400:
          return new Error(`Bad request: ${error.message}`);
        case 401:
          return new Error('Authentication error: Invalid API key');
        case 403:
          return new Error('Authorization error: Not authorized to use this endpoint');
        case 404:
          return new Error('Not found: The requested resource doesn\'t exist');
        case 429:
          return new Error('Rate limit exceeded: Please try again later');
        case 500:
        case 502:
        case 503:
        case 504:
          return new Error(`Service error: OpenAI servers returned error (${error.status})`);
        default:
          return new Error(`OpenAI API error (${error.status}): ${error.message}`);
      }
    }
    
    // Handle network errors
    if (error.code) {
      switch (error.code) {
        case 'ECONNRESET':
          return new Error('Connection reset: Please check your network connection');
        case 'ETIMEDOUT':
        case 'ESOCKETTIMEDOUT':
          return new Error('Request timeout: The request took too long to complete');
        default:
          return new Error(`Network error (${error.code}): ${error.message}`);
      }
    }
    
    // Handle other errors
    return error instanceof Error ? error : new Error(String(error));
  }
  
  /**
   * Record telemetry data
   */
  private recordTelemetry(data: TelemetryData): void {
    this.telemetryData.push(data);
    
    // In a real implementation, you'd send this to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: send to monitoring service
      // this.sendToMonitoring(data);
      
      // For now, just log in development
      console.log('[Telemetry]', JSON.stringify(data));
    }
    
    // Keep only the last 100 records
    if (this.telemetryData.length > 100) {
      this.telemetryData.shift();
    }
  }
  
  /**
   * Track request for rate limiting
   */
  private trackRequest(): void {
    const now = Date.now();
    this.lastRequestTime = now;
  }
  
  /**
   * Get telemetry data
   */
  getTelemetryData(): TelemetryData[] {
    return this.telemetryData;
  }
  
  /**
   * Combine multiple abort signals
   */
  private combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    
    const abortHandler = () => {
      controller.abort();
      signals.forEach(signal => {
        signal.removeEventListener('abort', abortHandler);
      });
    };
    
    signals.forEach(signal => {
      if (signal.aborted) {
        abortHandler();
        return;
      }
      signal.addEventListener('abort', abortHandler);
    });
    
    return controller.signal;
  }
  
  /**
   * Get the underlying OpenAI client
   */
  getOpenAIClient(): OpenAI {
    return this.openai;
  }
}

export default OpenAIClient; 