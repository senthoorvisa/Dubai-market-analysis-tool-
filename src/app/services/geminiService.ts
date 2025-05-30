import { GoogleGenerativeAI } from '@google/generative-ai';

// Define response type for all API functions
export interface GeminiApiResponse<T = string> {
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
  floorNumber?: string;
  unitNumber?: string;
}

interface RentalSearchCriteria {
  location?: string;
  propertyType?: string;
  bedrooms?: number;
  propertyName?: string;
  floorNumber?: string;
  unitNumber?: string;
}

const API_RETRY_COUNT = 3;
const API_RETRY_DELAY = 1000; // ms

// Use the environment variable for the Gemini API key
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

/**
 * Retry function for API calls
 * @param fn Function to retry
 * @param retries Number of retries
 * @param delay Delay between retries in ms
 */
async function withRetry<T>(fn: () => Promise<T>, retries = API_RETRY_COUNT, delay = API_RETRY_DELAY): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Gemini API call failed, retrying... (${API_RETRY_COUNT - retries + 1}/${API_RETRY_COUNT})`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay);
  }
}

// Initialize Gemini AI with the provided API key
function initializeGemini(): GoogleGenerativeAI | null {
  try {
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not configured');
      return null;
    }
    
    return new GoogleGenerativeAI(GEMINI_API_KEY);
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    return null;
  }
}

// Safe content generation with error handling and retry mechanism
const safeGenerateContent = async (prompt: string): Promise<GeminiApiResponse> => {
  try {
    const genAI = initializeGemini();
    
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini API key not configured. Please set up your Gemini API key to use this feature.'
      };
    }
    
    // Get current date for context
    const currentDate = new Date();
    const currentDateString = currentDate.toLocaleDateString('en-AE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Dubai'
    });
    const currentTime = currentDate.toLocaleTimeString('en-AE', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Dubai',
      hour12: true
    });
    
    // Use Gemini 1.5 Pro model for text generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-latest" });
    
    const systemContext = `You are a specialized Dubai real estate market intelligence AI with advanced web scraping and data analysis capabilities.
    
    IMPORTANT CONTEXT:
    - Current Date: ${currentDateString}
    - Current Time: ${currentTime} (Dubai Time, GMT+4)
    - Current Year: ${currentDate.getFullYear()}
    
    CAPABILITIES:
    1. Real-time web scraping of property websites (Bayut, PropertyFinder, Dubizzle, etc.)
    2. Access to Dubai Land Department data
    3. Market trend analysis and price predictions
    4. Property valuation and investment analysis
    
    INSTRUCTIONS:
    - Always search for the most current, real-time data
    - Cross-reference multiple sources for accuracy
    - Provide specific property names, addresses, and contact details when available
    - Include actual listing prices, not estimates
    - Mention data sources and last updated timestamps
    - Focus on actionable, specific information
    - CRITICAL: Always provide accurate price per sqft, total sqft, and bedroom counts
    - Validate all numerical data for accuracy
    
    When discussing project completion dates, upcoming developments, or future events, ensure all dates are AFTER the current date. Never suggest past dates as future or upcoming projects.
    
    Always provide accurate, up-to-date information reflecting current market conditions as of ${currentDateString}.`;
    
    const fullPrompt = `${systemContext}\n\nUser Query: ${prompt}`;
    
    // Use retry mechanism for Gemini API calls
    const result = await withRetry(() => model.generateContent(fullPrompt));
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      data: text,
    };
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
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

// Get property information with enhanced web scraping capabilities
export async function getPropertyInfoWithScraping(criteria: PropertySearchCriteria): Promise<GeminiApiResponse> {
  try {
    const genAI = initializeGemini();
    
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini API key not configured. Please set up your Gemini API key to use this feature.'
      };
    }
    
    // Get current date for context
    const currentDate = new Date();
    const currentDateString = currentDate.toLocaleDateString('en-AE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Dubai'
    });
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-latest" });
    
    const systemPrompt = `You are a specialized Dubai property market intelligence AI with real-time web scraping capabilities.
    
    IMPORTANT CONTEXT:
    - Current Date: ${currentDateString}
    - Current Year: ${currentDate.getFullYear()}
    - Location: Dubai, UAE (GMT+4)
    
    TASK: Search for real-time property data using web scraping techniques
    
    SOURCES TO SEARCH:
    1. Bayut.com - Primary property portal
    2. PropertyFinder.ae - Comprehensive listings
    3. Dubizzle.com - Local marketplace
    4. Emirates.estate - Luxury properties
    5. Propertyfinder.ae - International listings
    6. Dubai Land Department official data
    
    ENHANCED SCRAPING INSTRUCTIONS:
    - Extract EXACT current listing prices (not estimates) in AED
    - Get precise property specifications: beds, baths, EXACT sqft
    - Calculate and verify price per sqft (AED/sqft)
    - Get property names, addresses, and developer information
    - Find contact details and agent information
    - Collect amenities and building features
    - Note listing dates and price history if available
    - Validate all numerical data for accuracy
    - Cross-reference data across multiple sources
    
    DATA ACCURACY REQUIREMENTS:
    - Price: Must be current market price in AED, not estimates
    - Bedrooms: Exact count (0 for studio, 1, 2, 3, 4, 5+)
    - Sqft: Exact square footage, not approximations
    - Price per sqft: Calculated as (Total Price / Total Sqft)
    
    CRITICAL: When mentioning project completion dates, upcoming developments, or future events, ensure all dates are AFTER ${currentDateString}.`;
    
    // Construct the user prompt based on criteria
    let userPrompt = `Search for real-time property data in Dubai`;
    
    if (criteria.location) {
      userPrompt += ` in ${criteria.location}`;
    }
    
    if (criteria.propertyType) {
      userPrompt += ` for ${criteria.propertyType.toLowerCase()}s`;
    }
    
    if (criteria.bedrooms !== undefined) {
      if (criteria.bedrooms === 0) {
        userPrompt += ` with studio configuration`;
      } else {
        userPrompt += ` with ${criteria.bedrooms} bedroom${criteria.bedrooms > 1 ? 's' : ''}`;
      }
    }
    
    if (criteria.floorNumber) {
      userPrompt += ` on floor ${criteria.floorNumber}`;
    }
    
    if (criteria.unitNumber) {
      userPrompt += ` unit number ${criteria.unitNumber}`;
    }
    
    if (criteria.amenities && criteria.amenities.length > 0) {
      userPrompt += ` with amenities including ${criteria.amenities.join(', ')}`;
    }
    
    userPrompt += `.

Please provide the following real-time information by scraping current property websites:

1. **EXACT Property Specifications:**
   - Property names and exact addresses
   - PRECISE bedroom count (0 for studio, 1, 2, 3, 4, 5+)
   - EXACT square footage (sqft) - not approximations
   - Bathroom count and layout details
   - Floor number and unit specifications

2. **ACCURATE Pricing Information:**
   - Current asking prices (AED) from active listings
   - CALCULATED price per square foot (AED/sqft)
   - Price validation across multiple sources
   - Recent sale prices from completed transactions
   - Price trends over the past 3-6 months

3. **Current Listings Analysis:**
   - Developer and building information
   - Agent contact details and phone numbers
   - Property specifications validation
   - Days on market for similar properties
   - Availability status and move-in dates

4. **Market Data Validation:**
   - Cross-reference data from Bayut, PropertyFinder, Dubizzle
   - Verify sqft measurements and bedroom counts
   - Validate price calculations and market rates
   - Check for data consistency across sources

5. **Investment Analysis:**
   - Current rental yields from rental listings
   - ROI calculations based on current prices
   - Rental demand indicators
   - Market appreciation trends

6. **Specific Property Recommendations:**
   - Top 3-5 properties matching the criteria
   - Exact specifications: beds, baths, sqft, price
   - Calculated price per sqft for each property
   - Pros and cons of each property
   - Negotiation insights and market positioning

CRITICAL REQUIREMENTS:
- All prices must be EXACT from current listings, not estimates
- All sqft measurements must be PRECISE, not approximations
- All bedroom counts must be ACCURATE (0=studio, 1, 2, 3, 4, 5+)
- Calculate price per sqft as: Total Price ÷ Total Sqft
- Provide source websites and last updated timestamps for all data points
- Validate data consistency across multiple sources`;

    const fullPrompt = `${systemPrompt}\n\nUser Query: ${userPrompt}`;
    
    const result = await withRetry(() => model.generateContent(fullPrompt));
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      data: text,
    };
  } catch (error) {
    console.error('Error in getPropertyInfoWithScraping:', error);
    let errorMessage = 'Failed to fetch property information';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Get rental market information with real-time scraping
export async function getRentalMarketInfoWithScraping(criteria: RentalSearchCriteria): Promise<GeminiApiResponse> {
  try {
    const genAI = initializeGemini();
    
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini API key not configured. Please set up your Gemini API key to use this feature.'
      };
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-latest" });
    
    const systemPrompt = `You are a specialized Dubai rental market intelligence AI with real-time web scraping capabilities.
Your role is to provide up-to-date, accurate rental information for the Dubai real estate market by scraping current rental listings.

SOURCES TO SCRAPE:
1. Bayut.com/rent - Primary rental portal
2. PropertyFinder.ae/rent - Comprehensive rental listings  
3. Dubizzle.com/rent - Local rental marketplace
4. Rent.ae - Specialized rental platform
5. OpenSooq.com - Additional rental listings

SCRAPING FOCUS:
- Current rental prices (AED/year) from active listings
- Property specifications and amenities
- Landlord/agent contact information
- Availability dates and lease terms
- Service charges and included utilities
- Building facilities and location benefits

Structure your response with clear sections including: Current Rental Rates, Price Trends, Market Analysis, Area Comparison, and Investment Outlook.
Always cite specific buildings, communities, and actual listing price ranges when possible.
Provide rental rates in AED per year (the standard in Dubai) and be specific about property types and sizes.`;
    
    // Construct the user prompt based on criteria
    let userPrompt = `Scrape current rental market data for Dubai`;
    
    if (criteria.location && criteria.propertyType && criteria.bedrooms !== undefined) {
      userPrompt = `Scrape current rental listings for ${criteria.bedrooms === 0 ? 'studio' : `${criteria.bedrooms}-bedroom`} ${criteria.propertyType} properties in ${criteria.location}, Dubai`;
    } else if (criteria.location && criteria.propertyType) {
      userPrompt = `Scrape current rental listings for ${criteria.propertyType} properties in ${criteria.location}, Dubai`;
    } else if (criteria.location && criteria.bedrooms !== undefined) {
      userPrompt = `Scrape current rental listings for ${criteria.bedrooms === 0 ? 'studio' : `${criteria.bedrooms}-bedroom`} properties in ${criteria.location}, Dubai`;
    } else if (criteria.propertyType && criteria.bedrooms !== undefined) {
      userPrompt = `Scrape current rental listings for ${criteria.bedrooms === 0 ? 'studio' : `${criteria.bedrooms}-bedroom`} ${criteria.propertyType} properties in Dubai`;
    } else if (criteria.location) {
      userPrompt = `Scrape current rental listings for properties in ${criteria.location}, Dubai`;
    } else if (criteria.propertyType) {
      userPrompt = `Scrape current rental listings for ${criteria.propertyType} properties in Dubai`;
    } else if (criteria.bedrooms !== undefined) {
      userPrompt = `Scrape current rental listings for ${criteria.bedrooms === 0 ? 'studio' : `${criteria.bedrooms}-bedroom`} properties in Dubai`;
    }
    
    if (criteria.propertyName) {
      userPrompt += `, specifically in the ${criteria.propertyName} development`;
    }
    
    if (criteria.floorNumber || criteria.unitNumber) {
      userPrompt += ` - specifically looking for`;
      if (criteria.floorNumber) userPrompt += ` floor ${criteria.floorNumber}`;
      if (criteria.floorNumber && criteria.unitNumber) userPrompt += `,`;
      if (criteria.unitNumber) userPrompt += ` unit ${criteria.unitNumber}`;
    }
    
    userPrompt += `.

Please scrape and provide the following real-time rental information:

1. **Current Rental Rates (from active listings):**
   - Exact rental price ranges (in AED/year) from current listings
   - Average rental rates for this property type/area
   - Minimum and maximum prices currently available
   - Price per square foot comparisons

2. **Active Listings Analysis:**
   - Specific property names and addresses with rental prices
   - Landlord/agent contact information
   - Available move-in dates and lease terms
   - Included utilities and service charges
   - Parking and additional fees

3. **Market Trends (from listing data):**
   - Recent price changes in similar properties
   - Days on market for rental properties
   - Seasonal variations in rental availability
   - Demand indicators and occupancy rates

4. **Comparative Analysis:**
   - How rental prices compare to similar properties in neighboring areas
   - Premium features that affect rental prices
   - Value assessment (underpriced, fair market value, premium)

5. **Investment Insights:**
   - Current gross rental yields based on sale vs rental prices
   - Net yield estimates after service charges and maintenance
   - Rental demand characteristics for this area/property type
   - ROI projections for investors

CRITICAL: Provide actual data from real rental listings, not estimates. Include source websites, listing IDs where possible, and last updated timestamps for all data points.`;

    const fullPrompt = `${systemPrompt}\n\nUser Query: ${userPrompt}`;
    
    const result = await withRetry(() => model.generateContent(fullPrompt));
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      data: text,
    };
  } catch (error) {
    console.error('Error fetching rental market information with Gemini:', error);
    let errorMessage = 'Failed to fetch rental information with web scraping';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Get market forecast with real-time data analysis
export async function getMarketForecastWithData(timeframe: string = '12 months'): Promise<GeminiApiResponse> {
  try {
    const genAI = initializeGemini();
    
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini API key not configured. Please set up your Gemini API key to use this feature.'
      };
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-latest" });
    
    const systemPrompt = `You are a specialized Dubai real estate market forecasting AI with access to real-time market data and web scraping capabilities.
Your role is to provide accurate, detailed market forecasts for Dubai's property sector based on current data and trends.

DATA SOURCES TO ANALYZE:
1. Dubai Land Department transaction data
2. Current property listings and price trends
3. Economic indicators and government policies
4. Construction and development pipeline
5. Tourism and population growth data
6. Interest rates and financing conditions

Focus on delivering data-driven predictions with specific price trends, growth rates, and investment opportunities.
Always structure your response with clear sections including: Market Overview, Price Forecast by Area, 
Investment Hotspots, Risk Analysis, and Strategic Recommendations.
Ensure all forecasts are based on current economic indicators, government policies, and market dynamics.
Be specific about percentage changes expected and timeframes for developments.`;
    
    const userPrompt = `Analyze current market data and provide a comprehensive forecast of Dubai's real estate market for the next ${timeframe}. 

Please scrape and analyze the following real-time data:

1. **Current Market Analysis:**
   - Latest transaction volumes and values from DLD data
   - Current listing trends and price movements
   - Supply and demand balance across different areas
   - Key market drivers and influencing factors

2. **Price Forecasting:**
   - Expected market direction (growth, stability, correction)
   - Projected average price movement (percentage change)
   - Area-specific price predictions with reasoning
   - Property type performance forecasts

3. **Investment Opportunities:**
   - Best-performing property types for the forecast period
   - Expected rental yield changes and ROI projections
   - Emerging areas with growth potential
   - Recommended investment strategies and timing

4. **Risk Assessment:**
   - Potential market vulnerabilities and challenges
   - Economic factors that could impact forecasts
   - Supply risks (oversupply/undersupply) by area
   - Regulatory changes that might affect the market

5. **Strategic Recommendations:**
   - Actionable advice for different investor types
   - Optimal timing strategies for market entry/exit
   - Property types and areas to focus on/avoid
   - Risk mitigation approaches

Base all forecasts on current market data, economic indicators, government policies, and observable trends. Provide specific figures, percentages, and objective data points wherever possible.`;

    const fullPrompt = `${systemPrompt}\n\nUser Query: ${userPrompt}`;
    
    const result = await withRetry(() => model.generateContent(fullPrompt));
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      data: text,
    };
  } catch (error) {
    console.error('Error in getMarketForecastWithData:', error);
    let errorMessage = 'Failed to fetch market forecast with real-time data';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// New function for Demographic Analysis
export async function getDemographicAnalysis(location: string): Promise<GeminiApiResponse> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: 'Gemini API key not configured. Please set it up in Settings to use this feature.'
    };
  }

  const currentDate = new Date();
  const currentDateString = currentDate.toLocaleDateString('en-AE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Dubai'
  });

  const systemPrompt = `You are a specialized Dubai demographics and infrastructure intelligence AI with access to current (as of ${currentDateString}) data.
Your role is to provide accurate, detailed demographic analysis for specific areas in Dubai.
Focus on delivering data-driven insights with specific figures, infrastructure details, and population statistics.
Always structure your response with clear sections including: Population Statistics, Socioeconomic Profile, 
Infrastructure Analysis, Lifestyle & Community, Real Estate Impact, and Future Outlook.
Ensure all information reflects current conditions and cites specific data points where possible.
Do not use markdown formatting like asterisks or hashes in your output.`;

  const userPrompt = `I need comprehensive demographic and infrastructure analysis for ${location} in Dubai. Please provide:

1.  **Population Statistics:**
    *   Total population and density (persons per sq km).
    *   Population growth rate over the past 3-5 years (annualized %).
    *   Distribution by key age groups (e.g., 0-17, 18-35, 36-55, 55+), with percentages.
    *   Key nationality breakdown with approximate percentages (top 3-5 nationalities).

2.  **Socioeconomic Profile:**
    *   Estimated average household income range (e.g., AED Low-High per year).
    *   Dominant employment sectors for residents in this area.
    *   General education levels (e.g., percentage with tertiary education).
    *   Estimated proportion of property owners vs. renters.

3.  **Infrastructure Analysis:**
    *   Transportation: Availability and quality of metro/tram access, bus routes, major road connectivity, typical commute times to key business hubs.
    *   Education: Notable schools (nurseries, primary, secondary) and universities in or serving the area, with general reputation/rating if available.
    *   Healthcare: Major hospitals and clinics accessible to the area.
    *   Retail & Leisure: Key shopping malls, retail zones, restaurants, parks, and recreational facilities.

4.  **Lifestyle & Community:**
    *   Typical resident profile (e.g., young professionals, families with children, HNWIs).
    *   Community atmosphere and characteristics (e.g., vibrant, family-oriented, quiet).
    *   Safety and security perception.
    *   Availability of social amenities and community events.

5.  **Real Estate Impact:**
    *   How current demographics influence property types (e.g., demand for family villas vs. luxury apartments) and property values in ${location}.
    *   Observed correlation between resident profiles and property preferences.
    *   Characteristics of rental demand in the area.

6.  **Future Outlook (Next 3-5 Years):**
    *   Projected population changes or shifts in ${location}.
    *   Any significant planned infrastructure or commercial developments impacting the area.
    *   Expected evolution of the community based on these trends.

Present this information in a structured format. Use clear headings for each of the 6 main sections. Within each section, use bullet points for detailed data.
Provide specific figures and data points wherever possible, indicating if they are estimates. Ensure all data is as current as possible, reflecting ${currentDateString}.
Avoid markdown formatting in your response.`;

  // We can reuse the safeGenerateContent logic if we adapt it slightly or call the Gemini model directly here.
  // For simplicity and direct control, let's make the Gemini call here, similar to safeGenerateContent.

  try {
    const genAI = initializeGemini(); // initializeGemini already checks for GEMINI_API_KEY
    if (!genAI) {
      // This case should be caught by the initial apiKey check, but as a safeguard:
      return {
        success: false,
        error: 'Gemini API initialization failed. Check API key.'
      };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-latest" });
    const fullPrompt = `${systemPrompt}\n\nUser Query: ${userPrompt}`;

    const result = await withRetry(() => model.generateContent(fullPrompt));
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      data: text,
    };
  } catch (error) {
    console.error('Error generating demographic analysis with Gemini:', error);
    let errorMessage = 'An unknown error occurred during Gemini demographic analysis.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      error: errorMessage,
    };
  }
}

const geminiService = {
  getPropertyInfoWithScraping,
  getRentalMarketInfoWithScraping,
  getMarketForecastWithData,
  safeGenerateContent,
  getDemographicAnalysis
};

export default geminiService; 