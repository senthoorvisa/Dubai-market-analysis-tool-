import OpenAI from 'openai';
import openai, { updateApiKey } from './initOpenAi';
import apiKeyService from './apiKeyService';
import { RentalFilter } from './rentalApiService';

// Define response type for all API functions
export interface ApiResponse<T = string> {
  success: boolean;
  data?: T;
  error?: string;
}

// Define criteria type for property search
export interface PropertySearchCriteria {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  priceRange?: string;
  amenities?: string[];
}

interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    text?: string;
    message?: {
      role: string;
      content: string;
    };
    index: number;
    logprobs: any;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface RentalSearchCriteria {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  propertyName?: string;
}

interface OpenAIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

// Safe content generation with error handling
const safeGenerateContent = async (prompt: string): Promise<ApiResponse> => {
  try {
    const apiKey = apiKeyService.getStoredApiKey();
    if (!apiKey) {
      return {
        success: false,
        error: 'API key not configured. Please configure your API key in settings.',
      };
    }

    updateApiKey(apiKey);
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a knowledgeable real estate market expert assistant.' },
        { role: 'user', content: prompt }
      ],
      model: 'gpt-4-turbo',
      temperature: 0.3,
      max_tokens: 1000,
    });

    return {
      success: true,
      data: completion.choices[0].message.content || "",
    };
  } catch (error) {
    console.error('Error generating content:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Get property information based on search criteria
export async function getPropertyInfo(criteria: PropertySearchCriteria): Promise<ApiResponse> {
  try {
    // Create a prompt that's specific to property lookup
    let prompt = `You are a Dubai real estate market expert assistant. Please provide detailed information about properties in Dubai with the following criteria:\n\n`;
    
    if (criteria.location) {
      prompt += `Location: ${criteria.location}\n`;
    }
    if (criteria.propertyType) {
      prompt += `Property Type: ${criteria.propertyType}\n`;
    }
    if (criteria.bedrooms) {
      prompt += `Bedrooms: ${criteria.bedrooms}\n`;
    }
    if (criteria.priceRange) {
      prompt += `Price Range: ${criteria.priceRange}\n`;
    }
    if (criteria.amenities && criteria.amenities.length > 0) {
      prompt += `Amenities: ${criteria.amenities.join(', ')}\n`;
    }

    prompt += `\nFor this property search, please provide the following information:
1. Current average price for properties matching these criteria
2. Recent market trends for this type of property
3. Investment potential and ROI analysis
4. Similar properties in the area and their comparative values
5. Any notable developments or infrastructure projects nearby
6. Recommendations for potential buyers or investors

Base your analysis on current Dubai real estate market data, referencing the Dubai Land Department records where possible.`;

    return await safeGenerateContent(prompt);
  } catch (error) {
    console.error('Error in getPropertyInfo:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Get developer information
export async function getDeveloperInfo(developerName: string): Promise<ApiResponse> {
  try {
    const prompt = `You are a Dubai real estate market expert assistant. Please provide detailed information about the developer "${developerName}" in Dubai's real estate market.

Please include:
1. Company profile and history in Dubai
2. Major projects and developments (completed, ongoing, and planned)
3. Market reputation and reliability assessment
4. Quality standards and typical property features
5. Price range of their properties
6. Investment performance of their previous projects
7. Any relevant news or updates about this developer

Base your analysis on current Dubai real estate market data, referencing the Dubai Land Department records where possible.`;

    return await safeGenerateContent(prompt);
  } catch (error) {
    console.error('Error in getDeveloperInfo:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Get rental market information
export async function getRentalMarketInfo(criteria: RentalSearchCriteria): Promise<ApiResponse> {
  try {
    const apiKey = apiKeyService.getStoredApiKey();
    
    if (!apiKey) {
      return {
        success: false,
        error: 'API key not configured. Please set up your OpenAI API key to use this feature.'
      };
    }
    
    // Construct the prompt for OpenAI
    let prompt = `I need accurate, up-to-date rental price information for properties in Dubai. `;
    
    if (criteria.location) {
      prompt += `Area: ${criteria.location}. `;
    }
    
    if (criteria.propertyName) {
      prompt += `Specifically, I'm looking for rental prices for "${criteria.propertyName}". `;
    }
    
    if (criteria.propertyType) {
      prompt += `Property type: ${criteria.propertyType}. `;
    }
    
    if (criteria.bedrooms !== undefined) {
      prompt += `Bedrooms: ${criteria.bedrooms === 0 ? 'Studio' : criteria.bedrooms}. `;
    }
    
    prompt += `Please provide:
    1. Current average rental prices (in AED/year)
    2. Price ranges based on actual listings
    3. Trends in this area over the past 3-6 months
    4. Price comparison with similar properties in nearby areas
    
    Ensure all information is based on actual current rental market data, not estimates. Cite current rental prices from specific properties whenever possible.`;
    
    updateApiKey(apiKey);
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: `You are a Dubai real estate expert specializing in rental property analysis. 
          Provide accurate, detailed, and specific rental price information based on current market data.
          Use concrete figures, actual listings, and avoid vague statements or broad ranges when possible.
          Format your response with clear sections and bullet points for readability.` 
        },
        { role: 'user', content: prompt }
      ],
      model: 'gpt-4-turbo',
      temperature: 0.3,
      max_tokens: 750,
    });

    return {
      success: true,
      data: completion.choices[0].message.content || "",
    };
  } catch (error) {
    console.error('Error fetching rental market information:', error);
    return {
      success: false,
      error: `Failed to fetch rental information: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Get market forecast information
export async function getMarketForecast(timeframe: string = '12 months'): Promise<ApiResponse> {
  try {
    const prompt = `You are a Dubai real estate market expert assistant. Please provide a detailed forecast of the Dubai property market for the next ${timeframe}.

Please include:
1. Overall market trend predictions
2. Property price forecasts by area (Downtown, Marina, Palm Jumeirah, etc.)
3. Expected changes in rental yields
4. Investment hotspots and emerging areas
5. Factors that might influence the market (economic indicators, government policies, etc.)
6. Recommendations for investors based on the forecast
7. Potential risks and challenges in the market

Base your forecast on current Dubai real estate market data and trends, referencing the Dubai Land Department records and economic indicators where possible.`;

    return await safeGenerateContent(prompt);
  } catch (error) {
    console.error('Error in getMarketForecast:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Get demographic information for a location
export async function getDemographicInfo(location: string): Promise<ApiResponse> {
  try {
    const prompt = `You are a Dubai real estate market expert assistant. Please provide detailed demographic information about ${location} in Dubai.

Please include:
1. Population statistics (total population, density, growth rate)
2. Resident demographics (age distribution, nationality breakdown, income levels)
3. Infrastructure and facilities (schools, hospitals, shopping, public transport)
4. Lifestyle and community features
5. Typical resident profiles (professionals, families, tourists, etc.)
6. How demographics affect property values and rental demand
7. Future development plans that might impact demographics

Base your analysis on current Dubai demographic data, referencing official statistics where possible.`;

    return await safeGenerateContent(prompt);
  } catch (error) {
    console.error('Error in getDemographicInfo:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Function to extract specific information from Dubai Land Department website
export async function getDubaiLandInfo(infoType: 'projects' | 'regulations' | 'transactions' | 'services'): Promise<ApiResponse> {
  try {
    let prompt = `You are a Dubai real estate data specialist. I need you to provide current information about `;
    
    switch (infoType) {
      case 'projects':
        prompt += `real estate projects in Dubai, including ongoing developments, completed projects, and future plans. Include details like developer names, project locations, completion status, and unique features.`;
        break;
      case 'regulations':
        prompt += `current real estate regulations in Dubai. Include information about property ownership laws, transaction fees, rental regulations, and any recent regulatory changes.`;
        break;
      case 'transactions':
        prompt += `recent real estate transactions in Dubai. Include data on sales volumes, average prices by area, most active areas for transactions, and notable high-value transactions.`;
        break;
      case 'services':
        prompt += `services offered by the Dubai Land Department. Include information about registration processes, ownership transfer procedures, dispute resolution mechanisms, and digital services available.`;
        break;
    }

    return await safeGenerateContent(prompt);
  } catch (error) {
    console.error('Error in getDubaiLandInfo:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Initialize the API with the provided key
export function initWithApiKey(apiKey: string, orgId?: string): boolean {
  try {
    if (!apiKey || apiKey.length < 20) {
      console.error('Invalid API key format');
      return false;
    }
    
    // Use HTTPS for all API calls
    if (!apiKey.startsWith('sk-')) {
      console.error('Invalid API key format: must start with "sk-"');
      return false;
    }
    
    // Update the OpenAI instance with the new key
    updateApiKey(apiKey, orgId);
    
    // Store API key in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('openai_api_key', apiKey);
      
      // Store API usage timestamp for rotation tracking
      const now = new Date().toISOString();
      localStorage.setItem('openai_key_last_used', now);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing OpenAI with key:', error);
    return false;
  }
}

const openAiService = {
  getRentalMarketInfo: async (criteria: RentalSearchCriteria): Promise<ApiResponse> => {
    try {
      const apiKey = apiKeyService.getStoredApiKey();
      
      if (!apiKey) {
        return {
          success: false,
          error: 'API key not configured. Please set up your OpenAI API key to use this feature.'
        };
      }
      
      // Construct the prompt for OpenAI
      let prompt = `I need accurate, up-to-date rental price information for properties in Dubai. `;
      
      if (criteria.location) {
        prompt += `Area: ${criteria.location}. `;
      }
      
      if (criteria.propertyName) {
        prompt += `Specifically, I'm looking for rental prices for "${criteria.propertyName}". `;
      }
      
      if (criteria.propertyType) {
        prompt += `Property type: ${criteria.propertyType}. `;
      }
      
      if (criteria.bedrooms !== undefined) {
        prompt += `Bedrooms: ${criteria.bedrooms === 0 ? 'Studio' : criteria.bedrooms}. `;
      }
      
      prompt += `Please provide:
      1. Current average rental prices (in AED/year)
      2. Price ranges based on actual listings
      3. Trends in this area over the past 3-6 months
      4. Price comparison with similar properties in nearby areas
      
      Ensure all information is based on actual current rental market data, not estimates. Cite current rental prices from specific properties whenever possible.`;
      
      updateApiKey(apiKey);
      const completion = await openai.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: `You are a Dubai real estate expert specializing in rental property analysis. 
            Provide accurate, detailed, and specific rental price information based on current market data.
            Use concrete figures, actual listings, and avoid vague statements or broad ranges when possible.
            Format your response with clear sections and bullet points for readability.` 
          },
          { role: 'user', content: prompt }
        ],
        model: 'gpt-4-turbo',
        temperature: 0.3,
        max_tokens: 750,
      });

      return {
        success: true,
        data: completion.choices[0].message.content || "",
      };
    } catch (error) {
      console.error('Error fetching rental market information:', error);
      return {
        success: false,
        error: `Failed to fetch rental information: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};

export default openAiService; 