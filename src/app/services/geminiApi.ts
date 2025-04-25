// Google Gemini API Service
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

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

// Function to get API key from environment or local storage
const getGeminiApiKey = (): string => {
  // Check localStorage first (client-side only)
  if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem('api_key_googleGemini');
    if (storedKey) return storedKey;
  }
  
  // Fallback to env variable
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
};

// Initialize the Gemini API client
const initGeminiApi = (): GoogleGenerativeAI => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not found. Please configure it in the settings.');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Helper function to safely generate content and handle errors
const safeGenerateContent = async (model: GenerativeModel, prompt: string): Promise<ApiResponse> => {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return {
      success: true,
      data: text,
    };
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    
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
    const genAI = initGeminiApi();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
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

    return await safeGenerateContent(model, prompt);
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
    const genAI = initGeminiApi();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
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

    return await safeGenerateContent(model, prompt);
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
export async function getRentalMarketInfo(criteria: {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
}): Promise<ApiResponse> {
  try {
    const genAI = initGeminiApi();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    let prompt = `You are a Dubai real estate market expert assistant. Please provide detailed information about the current rental market in Dubai for properties with the following criteria:\n\n`;
    
    if (criteria.location) {
      prompt += `Location: ${criteria.location}\n`;
    }
    if (criteria.propertyType) {
      prompt += `Property Type: ${criteria.propertyType}\n`;
    }
    if (criteria.bedrooms) {
      prompt += `Bedrooms: ${criteria.bedrooms}\n`;
    }

    prompt += `\nFor this rental market analysis, please provide:
1. Current average rental prices for this type of property
2. Rental yield percentages and ROI potential
3. Rental demand trends over the past year
4. Forecasted changes in rental prices for the next 12 months
5. Popular rental terms and conditions
6. Suggestions for landlords to maximize rental income
7. Legal considerations for renting in this area

Base your analysis on current Dubai real estate market data, referencing the Dubai Land Department records and Rental Index where possible.`;

    return await safeGenerateContent(model, prompt);
  } catch (error) {
    console.error('Error in getRentalMarketInfo:', error);
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

// Get market forecast information
export async function getMarketForecast(timeframe: string = '12 months'): Promise<ApiResponse> {
  try {
    const genAI = initGeminiApi();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
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

    return await safeGenerateContent(model, prompt);
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

// Function to extract specific information from Dubai Land Department website
export async function getDubaiLandInfo(infoType: 'projects' | 'regulations' | 'transactions' | 'services'): Promise<ApiResponse> {
  try {
    const genAI = initGeminiApi();
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
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
        prompt += `services provided by the Dubai Land Department. Include information about property registration, Ejari system, broker licensing, and other services available to property owners and investors.`;
        break;
    }
    
    prompt += `\nBase your response on the most up-to-date information from the Dubai Land Department (dubailand.gov.ae).`;
    
    return await safeGenerateContent(model, prompt);
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