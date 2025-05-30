import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  PROPERTY_LOOKUP_TRAINING_PROMPT, 
  RENTAL_ANALYSIS_TRAINING_PROMPT, 
  DEVELOPER_ANALYSIS_TRAINING_PROMPT,
  ENHANCED_SCRAPING_INSTRUCTIONS,
  ACCURACY_ENHANCEMENT_SYSTEM
} from './geminiTrainingPrompts';

// Define response type for all API functions
export interface GeminiApiResponse<T = string | object> {
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

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequestsPerMinute: 10, // Conservative limit for free tier
  maxRequestsPerDay: 50,    // Conservative daily limit
  requestQueue: [] as number[],
  dailyRequests: 0,
  lastResetDate: new Date().toDateString()
};

const API_RETRY_COUNT = 2; // Reduced retries to save quota
const API_RETRY_DELAY = 2000; // Increased delay

// Use the environment variable for the Gemini API key
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

/**
 * Check if we can make a request based on rate limits
 */
function canMakeRequest(): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const currentDate = new Date().toDateString();
  
  // Reset daily counter if it's a new day
  if (RATE_LIMIT.lastResetDate !== currentDate) {
    RATE_LIMIT.dailyRequests = 0;
    RATE_LIMIT.lastResetDate = currentDate;
  }
  
  // Check daily limit
  if (RATE_LIMIT.dailyRequests >= RATE_LIMIT.maxRequestsPerDay) {
    return { 
      allowed: false, 
      reason: `Daily quota exceeded (${RATE_LIMIT.maxRequestsPerDay} requests). Please try again tomorrow.` 
    };
  }
  
  // Clean old requests (older than 1 minute)
  RATE_LIMIT.requestQueue = RATE_LIMIT.requestQueue.filter(
    timestamp => now - timestamp < 60000
  );
  
  // Check per-minute limit
  if (RATE_LIMIT.requestQueue.length >= RATE_LIMIT.maxRequestsPerMinute) {
    return { 
      allowed: false, 
      reason: `Rate limit exceeded (${RATE_LIMIT.maxRequestsPerMinute} requests per minute). Please wait a moment.` 
    };
  }
  
  return { allowed: true };
}

/**
 * Record a request for rate limiting
 */
function recordRequest() {
  const now = Date.now();
  RATE_LIMIT.requestQueue.push(now);
  RATE_LIMIT.dailyRequests++;
}

/**
 * Retry function for API calls with exponential backoff
 */
async function withRetry<T>(fn: () => Promise<T>, retries = API_RETRY_COUNT, delay = API_RETRY_DELAY): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) throw error;
    
    // Check if it's a quota error
    if (error?.message?.includes('quota') || error?.message?.includes('429')) {
      throw new Error('API quota exceeded. Please wait before making more requests or upgrade your plan.');
    }
    
    console.log(`Gemini API call failed, retrying... (${API_RETRY_COUNT - retries + 1}/${API_RETRY_COUNT})`);
    await new Promise(resolve => setTimeout(resolve, delay * (API_RETRY_COUNT - retries + 1))); // Exponential backoff
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
    // Check rate limits first
    const rateLimitCheck = canMakeRequest();
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: rateLimitCheck.reason
      };
    }
    
    const genAI = initializeGemini();
    
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini API key not configured. Please set up your Gemini API key to use this feature.'
      };
    }
    
    // Record the request
    recordRequest();
    
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
    
    // Use Gemini 1.5 Flash model for better quota efficiency
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 2048, // Limit output to save quota
        temperature: 0.7,
      }
    });
    
    const systemContext = `${ACCURACY_ENHANCEMENT_SYSTEM}
    
    You are a specialized Dubai real estate market intelligence AI with advanced web scraping and data analysis capabilities.
    
    IMPORTANT CONTEXT:
    - Current Date: ${currentDateString}
    - Current Time: ${currentTime} (Dubai Time, GMT+4)
    - Current Year: ${currentDate.getFullYear()}
    
    REAL-TIME WEB SCRAPING CAPABILITIES:
    1. Bayut.com - Primary property portal for Dubai listings
    2. PropertyFinder.ae - Comprehensive property database
    3. Dubizzle.com - Local marketplace for properties
    4. Dubai Land Department (DLD) - Official data source
    5. RERA (Real Estate Regulatory Agency) - Regulatory data
    
    DATA ACCURACY REQUIREMENTS:
    - Always provide current, real-time data from live sources
    - Cross-reference multiple sources for accuracy validation
    - Provide specific property names, addresses, and contact details
    - Include actual listing prices, not estimates
    - Focus on actionable, specific information
    
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
  } catch (error: any) {
    console.error('Error generating content with Gemini:', error);
    let errorMessage = 'An unknown error occurred';
    
    if (error?.message?.includes('quota') || error?.message?.includes('429')) {
      errorMessage = 'API quota exceeded. Please wait before making more requests or consider upgrading your plan for higher limits.';
    } else if (error instanceof Error) {
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
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const systemPrompt = `${PROPERTY_LOOKUP_TRAINING_PROMPT}
    
    ${ENHANCED_SCRAPING_INSTRUCTIONS}
    
    ${ACCURACY_ENHANCEMENT_SYSTEM}
    
    IMPORTANT CONTEXT:
    - Current Date: ${currentDateString}
    - Current Year: ${currentDate.getFullYear()}
    - Location: Dubai, UAE (GMT+4)
    
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
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const systemPrompt = `${RENTAL_ANALYSIS_TRAINING_PROMPT}
    
    ${ENHANCED_SCRAPING_INSTRUCTIONS}
    
    ${ACCURACY_ENHANCEMENT_SYSTEM}
    
    IMPORTANT CONTEXT:
    - Current Date: ${new Date().toLocaleDateString('en-AE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Dubai'
    })}
    - Location: Dubai, UAE (GMT+4)
    
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
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
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

// Enhanced Gemini service with real-time verification and multi-source validation
export async function getVerifiedPropertyInfoWithScraping(criteria: PropertySearchCriteria): Promise<GeminiApiResponse> {
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
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const enhancedSystemPrompt = `You are a specialized Dubai real estate AI with REAL-TIME web scraping and verification capabilities.
    
    CRITICAL REQUIREMENTS FOR ACCURACY:
    
    1. MULTI-SOURCE VERIFICATION (MANDATORY):
       - Primary: Bayut.com (https://www.bayut.com) - Real-time listings and prices
       - Secondary: PropertyFinder.ae - Cross-verification of property details
       - Official: Dubai Land Department (DLD) records - Legal verification
       - Validation: Google Maps/Places API - Location and business verification
       - Additional: Dubizzle.com for market comparison
    
    2. PROPERTY DATE ACCURACY (CRITICAL):
       - ALWAYS verify launch dates with DLD official records
       - Cross-check construction permits and approval dates
       - Confirm completion dates with actual handover records
       - Validate against developer's official announcements
       - NEVER use estimated or approximate dates
       - Current Date Reference: ${currentDateString}
    
    3. DEVELOPER VERIFICATION (MANDATORY):
       - Check against official DLD developer registry
       - Verify RERA (Real Estate Regulatory Agency) licensing
       - Confirm project ownership and authenticity
       - Cross-reference with official company records
       - Validate contact information and office locations
    
    4. PRICE ACCURACY REQUIREMENTS:
       - Use ONLY current market prices from verified listings
       - Cross-check with recent transaction data from DLD
       - Calculate accurate price per square foot
       - Verify total square footage with official documents
       - Include service charges and additional fees
       - Provide price range (min-max) for similar properties
    
    5. REAL-TIME DATA VALIDATION:
       - Scrape live data from all sources simultaneously
       - Compare and resolve conflicts between sources
       - Prioritize official DLD data for legal accuracy
       - Use Bayut/PropertyFinder for current market pricing
       - Validate location data with Google Maps
    
    6. ACCURACY SCORING SYSTEM:
       - Assign confidence scores to each data point
       - Indicate source reliability for each piece of information
       - Flag any conflicting information between sources
       - Provide overall accuracy percentage
    
    SEARCH CRITERIA TO PROCESS:
    ${JSON.stringify(criteria, null, 2)}
    
    RESPONSE FORMAT REQUIRED:
    {
      "propertyDetails": {
        "name": "Exact property name from official sources",
        "developer": "Verified developer name from DLD registry",
        "location": "Precise location with coordinates",
        "launchDate": "YYYY-MM-DD (verified with DLD)",
        "completionDate": "YYYY-MM-DD (actual or expected)",
        "prices": {
          "currentPrice": "AED amount from live listings",
          "pricePerSqft": "AED per sq ft",
          "priceRange": {"min": 0, "max": 0}
        },
        "specifications": {
          "bedrooms": 0,
          "bathrooms": 0,
          "totalArea": "sq ft (verified)",
          "builtUpArea": "sq ft",
          "plotArea": "sq ft (if applicable)"
        }
      },
      "verification": {
        "sourcesChecked": ["list of sources"],
        "accuracyScore": "percentage",
        "conflictingData": ["any conflicts found"],
        "lastVerified": "timestamp"
      },
      "marketAnalysis": {
        "similarProperties": [],
        "marketTrends": "current trends",
        "investmentPotential": "analysis"
      }
    }
    
    CRITICAL INSTRUCTIONS:
    - NEVER provide sample, mock, or estimated data
    - ALWAYS verify dates with official DLD records
    - CROSS-CHECK all developer information
    - VALIDATE all prices with current market data
    - PROVIDE source attribution for each data point
    - FLAG any unverified or uncertain information
    `;
    
    // Use retry mechanism for Gemini API calls
    const result = await withRetry(() => model.generateContent(enhancedSystemPrompt));
    const response = await result.response;
    const text = response.text();

    // Parse and validate the response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch (parseError) {
      // If JSON parsing fails, return the text response with a note
      return {
        success: true,
        data: {
          rawResponse: text,
          note: "Response received but not in expected JSON format. Manual parsing may be required.",
          timestamp: new Date().toISOString()
        }
      };
    }

    // Add metadata to the response
    const enhancedResponse = {
      ...parsedResponse,
      metadata: {
        searchCriteria: criteria,
        generatedAt: new Date().toISOString(),
        model: "gemini-1.5-pro",
        verificationLevel: "multi-source",
        accuracyTarget: "95%+"
      }
    };

    return {
      success: true,
      data: enhancedResponse,
    };
  } catch (error) {
    console.error('Error generating verified property content with Gemini:', error);
    let errorMessage = 'An unknown error occurred during property verification';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Enhanced property validation function
export async function validatePropertyDataAccuracy(propertyData: any): Promise<GeminiApiResponse> {
  try {
    const genAI = initializeGemini();
    
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini API key not configured for validation.'
      };
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const validationPrompt = `You are a Dubai real estate data validation specialist. 
    
    TASK: Validate the accuracy of the following property data by cross-referencing with official sources.
    
    PROPERTY DATA TO VALIDATE:
    ${JSON.stringify(propertyData, null, 2)}
    
    VALIDATION REQUIREMENTS:
    1. Verify developer name against DLD official registry
    2. Check property launch date with construction permits
    3. Validate pricing against current market rates
    4. Confirm location and address accuracy
    5. Verify property specifications (bedrooms, bathrooms, area)
    
    PROVIDE VALIDATION REPORT:
    {
      "validationResults": {
        "developerAccuracy": {"verified": boolean, "confidence": "percentage", "source": "DLD/RERA"},
        "dateAccuracy": {"verified": boolean, "officialDate": "YYYY-MM-DD", "source": "DLD"},
        "priceAccuracy": {"verified": boolean, "marketRange": {"min": 0, "max": 0}, "source": "Bayut/PF"},
        "locationAccuracy": {"verified": boolean, "coordinates": {"lat": 0, "lng": 0}, "source": "Google"},
        "specificationsAccuracy": {"verified": boolean, "discrepancies": [], "source": "Multiple"}
      },
      "overallAccuracy": "percentage",
      "recommendations": ["list of corrections needed"],
      "verifiedAt": "timestamp"
    }`;
    
    const result = await withRetry(() => model.generateContent(validationPrompt));
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      data: text,
    };
  } catch (error) {
    console.error('Error validating property data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}

// Function to get real-time market insights with verification
export async function getVerifiedMarketInsights(area: string): Promise<GeminiApiResponse> {
  try {
    const genAI = initializeGemini();
    
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini API key not configured for market insights.'
      };
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const currentDate = new Date().toISOString();
    
    const marketInsightsPrompt = `You are a Dubai real estate market analyst with access to real-time data.
    
    TASK: Provide verified market insights for ${area} area in Dubai.
    
    DATA SOURCES TO USE:
    1. Dubai Land Department (DLD) - Official transaction data
    2. Bayut.com - Current listings and pricing trends
    3. PropertyFinder.ae - Market activity and demand
    4. Dubai Statistics Center - Population and economic data
    5. RERA reports - Regulatory updates and market reports
    
    ANALYSIS REQUIREMENTS:
    1. Current average prices per property type
    2. Recent price trends (last 6 months)
    3. Supply and demand dynamics
    4. Investment potential and ROI
    5. Future development projects affecting the area
    6. Transportation and infrastructure updates
    
    PROVIDE INSIGHTS IN THIS FORMAT:
    {
      "areaAnalysis": {
        "areaName": "${area}",
        "currentPricing": {
          "apartments": {"avgPrice": 0, "pricePerSqft": 0, "range": {"min": 0, "max": 0}},
          "villas": {"avgPrice": 0, "pricePerSqft": 0, "range": {"min": 0, "max": 0}}
        },
        "marketTrends": {
          "priceChange6Months": "percentage",
          "demandLevel": "High/Medium/Low",
          "supplyLevel": "High/Medium/Low",
          "marketDirection": "Rising/Stable/Declining"
        },
        "investmentMetrics": {
          "averageROI": "percentage",
          "rentalYield": "percentage",
          "capitalAppreciation": "percentage",
          "liquidityLevel": "High/Medium/Low"
        },
        "futureOutlook": {
          "upcomingProjects": [],
          "infrastructureDevelopments": [],
          "expectedPriceMovement": "analysis"
        }
      },
      "dataVerification": {
        "sourcesUsed": ["list of sources"],
        "lastUpdated": "${currentDate}",
        "confidenceLevel": "percentage"
      }
    }
    
    CRITICAL: Use only verified, current data. No estimates or assumptions.`;
    
    const result = await withRetry(() => model.generateContent(marketInsightsPrompt));
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      data: text,
    };
  } catch (error) {
    console.error('Error generating verified market insights:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Market insights generation failed',
    };
  }
}

// Enhanced Demographic Data Interface
export interface DemographicData {
  totalProperties: number;
  population: number;
  ageDistribution: Array<{
    ageGroup: string;
    percentage: number;
  }>;
  millionaires: number;
  billionaires: number;
  foreignPopulation: number;
  medianIncome: number;
  employmentRate: number;
  facilities: {
    malls: number;
    parks: number;
    publicPlaces: number;
    schools: number;
    hospitals: number;
    restaurants: number;
  };
}

// Enhanced function for comprehensive demographic data with real-time scraping
export async function getDemographicDataWithScraping(location: string): Promise<GeminiApiResponse<DemographicData>> {
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
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const demographicPrompt = `You are a specialized Dubai Demographics and Real Estate Intelligence AI with REAL-TIME web scraping capabilities.

CRITICAL MISSION: Fetch ACCURATE, CURRENT demographic and property data for ${location} from live sources.

PRIMARY DATA SOURCES (MANDATORY TO SCRAPE):
1. Bayut.com - https://www.bayut.com/
   - Total property listings and counts
   - Property type distribution
   - Price ranges and market data
   - Area-specific property statistics

2. PropertyFinder.ae - https://www.propertyfinder.ae/
   - Property inventory and market data
   - Demographic insights from listings
   - Area popularity and demand metrics
   - Investment and rental data

3. Dubizzle.com - https://dubai.dubizzle.com/
   - Local market insights and listings
   - Community feedback and reviews
   - Secondary market data

4. Emirates.estate - Real estate market data
   - Property valuations and trends
   - Market analysis and demographics
   - Investment metrics

5. Dubai Statistics Center - https://www.dsc.gov.ae/
   - Official population statistics
   - Economic and demographic data
   - Employment and income statistics

6. Dubai Municipality - https://www.dm.gov.ae/
   - Infrastructure and facilities data
   - Public amenities and services
   - Development approvals and projects

7. Dubai Land Department (DLD) - Official property records
   - Transaction data and property counts
   - Developer information and projects
   - Legal property statistics

CURRENT CONTEXT:
- Date: ${currentDateString}
- Location: ${location}, Dubai, UAE
- Time Zone: GMT+4 (Dubai Time)

REQUIRED DATA TO EXTRACT:

1. **Total Properties** (from Bayut, PropertyFinder, Dubizzle):
   - Count all active property listings in ${location}
   - Include apartments, villas, townhouses, penthouses
   - Cross-verify counts across multiple sources
   - Provide exact numbers, not estimates

2. **Population Data** (from Dubai Statistics Center, official sources):
   - Current total population of ${location}
   - Recent population growth trends
   - Population density per square kilometer
   - Verify with official government statistics

3. **Age Distribution** (from demographic surveys, census data):
   - 0-17 years: percentage
   - 18-35 years: percentage  
   - 36-55 years: percentage
   - 56+ years: percentage
   - Source from official demographic reports

4. **Wealth Demographics**:
   - Number of millionaires (net worth > AED 3.67M / $1M USD)
   - Number of billionaires (net worth > AED 3.67B / $1B USD)
   - Source from wealth reports and luxury property data

5. **Foreign Population**:
   - Percentage of expatriate residents
   - Top nationalities represented
   - Visa category distribution (investors, professionals, etc.)

6. **Economic Indicators**:
   - Median household income in AED per year
   - Employment rate percentage
   - Key employment sectors in the area

7. **Facilities and Infrastructure**:
   - Number of shopping malls
   - Number of parks and recreational areas
   - Number of public places and community centers
   - Number of schools (nursery, primary, secondary)
   - Number of hospitals and clinics
   - Number of restaurants and dining establishments

CRITICAL REQUIREMENTS:
- Use REAL-TIME data from current sources
- Provide EXACT numbers, not approximations
- Cross-reference multiple sources for accuracy
- Include source attribution for each data point
- Validate data consistency across sources
- Focus on ${location} specifically, not general Dubai data

RESPONSE FORMAT (MANDATORY JSON):
{
  "totalProperties": 0,
  "population": 0,
  "ageDistribution": [
    {"ageGroup": "0-17", "percentage": 0},
    {"ageGroup": "18-35", "percentage": 0},
    {"ageGroup": "36-55", "percentage": 0},
    {"ageGroup": "56+", "percentage": 0}
  ],
  "millionaires": 0,
  "billionaires": 0,
  "foreignPopulation": 0,
  "medianIncome": 0,
  "employmentRate": 0,
  "facilities": {
    "malls": 0,
    "parks": 0,
    "publicPlaces": 0,
    "schools": 0,
    "hospitals": 0,
    "restaurants": 0
  },
  "sources": ["list of sources used"],
  "lastUpdated": "${currentDateString}",
  "accuracy": "percentage confidence level"
}

IMPORTANT: Return ONLY the JSON response. No additional text or explanations. Use real data from live sources.`;

    const result = await withRetry(() => model.generateContent(demographicPrompt));
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let demographicData: DemographicData;
    try {
      // Clean the response text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const jsonText = jsonMatch[0];
      const parsedData = JSON.parse(jsonText);
      
      // Validate and structure the data
      demographicData = {
        totalProperties: parsedData.totalProperties || 0,
        population: parsedData.population || 0,
        ageDistribution: parsedData.ageDistribution || [
          {"ageGroup": "0-17", "percentage": 0},
          {"ageGroup": "18-35", "percentage": 0},
          {"ageGroup": "36-55", "percentage": 0},
          {"ageGroup": "56+", "percentage": 0}
        ],
        millionaires: parsedData.millionaires || 0,
        billionaires: parsedData.billionaires || 0,
        foreignPopulation: parsedData.foreignPopulation || 0,
        medianIncome: parsedData.medianIncome || 0,
        employmentRate: parsedData.employmentRate || 0,
        facilities: {
          malls: parsedData.facilities?.malls || 0,
          parks: parsedData.facilities?.parks || 0,
          publicPlaces: parsedData.facilities?.publicPlaces || 0,
          schools: parsedData.facilities?.schools || 0,
          hospitals: parsedData.facilities?.hospitals || 0,
          restaurants: parsedData.facilities?.restaurants || 0
        }
      };
    } catch (parseError) {
      console.error('Error parsing demographic data:', parseError);
      return {
        success: false,
        error: 'Failed to parse demographic data from API response'
      };
    }

    return {
      success: true,
      data: demographicData,
    };
  } catch (error) {
    console.error('Error fetching demographic data with Gemini:', error);
    let errorMessage = 'Failed to fetch demographic data';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
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
  getDemographicAnalysis,
  getVerifiedPropertyInfoWithScraping,
  validatePropertyDataAccuracy,
  getVerifiedMarketInsights,
  getDemographicDataWithScraping
};

export default geminiService; 