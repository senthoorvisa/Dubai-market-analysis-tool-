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

const API_RETRY_COUNT = 3;
const API_RETRY_DELAY = 1000; // ms

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
    
    console.log(`OpenAI API call failed, retrying... (${API_RETRY_COUNT - retries + 1}/${API_RETRY_COUNT})`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay);
  }
}

// Safe content generation with error handling and retry mechanism
const safeGenerateContent = async (prompt: string): Promise<ApiResponse> => {
  try {
    // Use the provided API key directly for enterprise-level reliability
    const apiKey = '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';
    
    // Always update the API key before making a request
    updateApiKey(apiKey);
    
    // Use retry mechanism for OpenAI API calls
    const completion = await withRetry(() => openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a knowledgeable real estate market expert assistant specializing in Dubai property market with access to the latest 2025 data.' },
        { role: 'user', content: prompt }
      ],
      model: 'gpt-4-turbo',
      temperature: 0.2, // Lower temperature for more factual responses
      max_tokens: 1500, // Increased token limit for more detailed responses
    }));

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
    const apiKey = apiKeyService.getStoredApiKey();
    
    if (!apiKey) {
      return {
        success: false,
        error: 'API key not configured. Please set up your OpenAI API key to use this feature.'
      };
    }
    
    updateApiKey(apiKey);
    
    const systemPrompt = `You are a specialized Dubai property market intelligence AI with access to current (2024) real estate data.
Your role is to provide accurate, detailed property information and analysis based on search criteria.
Focus on delivering data-driven insights with specific price ranges, property details, market trends, and investment analysis.
Always structure your response with clear sections including: Property Overview, Price Analysis, Market Trends, 
Investment Potential, Location Analysis, and Recommendations.
Ensure all information reflects current market conditions and cites specific properties and developments where possible.`;
    
    // Construct the user prompt based on criteria
    let userPrompt = `I need detailed property information and analysis for Dubai`;
    
    if (criteria.location && criteria.propertyType && criteria.bedrooms) {
      userPrompt = `I need detailed information about ${criteria.bedrooms}-bedroom ${criteria.propertyType} properties in ${criteria.location}, Dubai`;
    } else if (criteria.location && criteria.propertyType) {
      userPrompt = `I need detailed information about ${criteria.propertyType} properties in ${criteria.location}, Dubai`;
    } else if (criteria.location && criteria.bedrooms) {
      userPrompt = `I need detailed information about ${criteria.bedrooms}-bedroom properties in ${criteria.location}, Dubai`;
    } else if (criteria.propertyType && criteria.bedrooms) {
      userPrompt = `I need detailed information about ${criteria.bedrooms}-bedroom ${criteria.propertyType} properties in Dubai`;
    } else if (criteria.location) {
      userPrompt = `I need detailed information about properties in ${criteria.location}, Dubai`;
    } else if (criteria.propertyType) {
      userPrompt = `I need detailed information about ${criteria.propertyType} properties in Dubai`;
    } else if (criteria.bedrooms) {
      userPrompt = `I need detailed information about ${criteria.bedrooms}-bedroom properties in Dubai`;
    }
    
    if (criteria.priceRange) {
      userPrompt += ` in the price range of ${criteria.priceRange}`;
    }
    
    if (criteria.amenities && criteria.amenities.length > 0) {
      userPrompt += ` with amenities including ${criteria.amenities.join(', ')}`;
    }
    
    userPrompt += `.

Please provide the following information:

1. Property Market Overview:
   - Current available properties matching these criteria
   - Average price ranges (in AED) with minimum and maximum
   - Price per square foot analysis
   - Available unit sizes and configurations
   - Typical features and specifications

2. Price Analysis:
   - Detailed breakdown of price components (base price, premium features)
   - How prices compare to similar properties in neighboring areas
   - Value assessment (underpriced, fair market value, premium)
   - Price trends over the past 12-24 months
   - Price forecast for next 12 months

3. Location Benefits & Drawbacks:
   - Proximity to key locations (downtown, beaches, business districts)
   - Transportation connectivity (metro, major roads)
   - Schools, hospitals, and shopping centers nearby
   - Community facilities and lifestyle offerings
   - Any known issues or challenges with the location

4. Investment Potential:
   - Current rental yields (gross and net)
   - Capital appreciation history and projection
   - Rental demand for this property type/location
   - ROI timeline scenarios
   - Comparison with other investment options in Dubai

5. Notable Developments:
   - Specific buildings or communities that best match these criteria
   - Reputable developers with projects matching these requirements
   - Recently completed projects worth considering
   - Upcoming projects that might affect market dynamics
   - Off-plan vs. ready property options

6. Practical Buying Advice:
   - Best time to purchase
   - Negotiation strategies for this property type/location
   - Financing considerations
   - Potential red flags to watch for
   - Legal and regulatory considerations

Present this information with specific figures, property examples, and objective data points wherever possible.`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'gpt-4-turbo',
      temperature: 0.2,
      max_tokens: 1500,
    });

    return {
      success: true,
      data: completion.choices[0].message.content || "",
    };
  } catch (error) {
    console.error('Error in getPropertyInfo:', error);
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

// Get developer information
export async function getDeveloperInfo(developerName: string): Promise<ApiResponse> {
  try {
    const apiKey = apiKeyService.getStoredApiKey();
    
    if (!apiKey) {
      return {
        success: false,
        error: 'API key not configured. Please set up your OpenAI API key to use this feature.'
      };
    }
    
    updateApiKey(apiKey);
    
    const systemPrompt = `You are a specialized Dubai real estate developer intelligence AI with access to current (2024) market data. 
Your role is to provide accurate, detailed, and comprehensive information about real estate developers in Dubai. 
Focus on delivering data-driven insights with specific figures, project details, and market analysis. 
Always structure your response with clear sections including: Company Overview, Key Projects (Completed/Ongoing/Planned), Financial Performance, 
Market Positioning, Quality & Reputation, and Latest Developments.
Ensure all information reflects current market conditions and cites specific projects and data points.`;
    
    const userPrompt = `I need comprehensive analytics on "${developerName}", a real estate developer in Dubai. Please provide:

1. Company Profile: Founding year, ownership structure, market positioning, and overall development approach
2. Project Portfolio Analysis: 
   - Total number of projects (completed, under construction, and planned)
   - Total market value of all projects (in AED)
   - Average ROI for investors in their properties
   - Breakdown of project types (residential, commercial, mixed-use)
   - Geographic distribution of projects across Dubai
3. Key Projects: Top 5-10 flagship projects with details on location, size, value, and unique features
4. Quality Assessment: Build quality reputation, design philosophy, amenities standards
5. Financial Performance: Project delivery timeline adherence, price appreciation of their properties
6. Market Position: Comparison with competing developers, market share, unique selling points
7. Customer Satisfaction: Rating or general reputation among property owners and tenants
8. Future Outlook: Announced projects, expansion plans, and market strategy

Present this information in a structured format with specific figures and data points wherever possible.`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'gpt-4-turbo',
      temperature: 0.2,
      max_tokens: 1500,
    });

    return {
      success: true,
      data: completion.choices[0].message.content || "",
    };
  } catch (error) {
    console.error('Error in getDeveloperInfo:', error);
    let errorMessage = 'Failed to fetch developer information';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
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
    
    updateApiKey(apiKey);
    
    const systemPrompt = `You are a specialized Dubai rental market intelligence AI with access to current (2024) rental market data.
Your role is to provide up-to-date, accurate rental information for the Dubai real estate market.
Focus on presenting specific rental figures, price ranges, trends, and comparative analysis between areas.
Structure your response with clear sections including: Current Rental Rates, Price Trends, Market Analysis, Area Comparison, and Investment Outlook.
Always cite specific buildings, communities, and actual listing price ranges when possible.
Provide rental rates in AED per year (the standard in Dubai) and be specific about property types and sizes.`;
    
    // Construct the user prompt based on criteria
    let userPrompt = `I need specific rental market analysis for Dubai`;
    
    if (criteria.location && criteria.propertyType && criteria.bedrooms !== undefined) {
      userPrompt = `I need specific rental market analysis for ${criteria.bedrooms === 0 ? 'studio' : `${criteria.bedrooms}-bedroom`} ${criteria.propertyType} properties in ${criteria.location}, Dubai`;
    } else if (criteria.location && criteria.propertyType) {
      userPrompt = `I need specific rental market analysis for ${criteria.propertyType} properties in ${criteria.location}, Dubai`;
    } else if (criteria.location && criteria.bedrooms !== undefined) {
      userPrompt = `I need specific rental market analysis for ${criteria.bedrooms === 0 ? 'studio' : `${criteria.bedrooms}-bedroom`} properties in ${criteria.location}, Dubai`;
    } else if (criteria.propertyType && criteria.bedrooms !== undefined) {
      userPrompt = `I need specific rental market analysis for ${criteria.bedrooms === 0 ? 'studio' : `${criteria.bedrooms}-bedroom`} ${criteria.propertyType} properties in Dubai`;
    } else if (criteria.location) {
      userPrompt = `I need specific rental market analysis for properties in ${criteria.location}, Dubai`;
    } else if (criteria.propertyType) {
      userPrompt = `I need specific rental market analysis for ${criteria.propertyType} properties in Dubai`;
    } else if (criteria.bedrooms !== undefined) {
      userPrompt = `I need specific rental market analysis for ${criteria.bedrooms === 0 ? 'studio' : `${criteria.bedrooms}-bedroom`} properties in Dubai`;
    }
    
    if (criteria.propertyName) {
      userPrompt += `, specifically in the ${criteria.propertyName} development`;
    }
    
    userPrompt += `.

Please provide the following information:

1. Current Rental Rates:
   - Precise rental price ranges (in AED/year)
   - Average rental rates for this property type/area
   - Minimum and maximum prices currently on the market
   - Price per square foot comparisons

2. Rental Market Trends:
   - Year-over-year price changes (% increase/decrease)
   - Seasonal variations in rental prices
   - Demand levels and occupancy rates
   - Future price projections for the next 6-12 months

3. Comparative Analysis:
   - How rental prices compare to similar properties in neighboring areas
   - Premium features that affect rental prices
   - Value assessment (underpriced, fair market value, premium)

4. Rental Yield Analysis:
   - Current gross rental yields
   - Net yield estimates after service charges and maintenance
   - Yield comparison with similar areas
   - ROI timeline for investors

5. Practical Renting Advice:
   - Best time to find rental deals
   - Negotiation insights for this area/property type
   - Common terms in rental contracts for this area
   - Additional costs renters should be aware of

Present all information with specific figures and data points. Include names of actual comparable buildings and developments when relevant.`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'gpt-4-turbo',
      temperature: 0.2,
      max_tokens: 1500,
    });

    return {
      success: true,
      data: completion.choices[0].message.content || "",
    };
  } catch (error) {
    console.error('Error fetching rental market information:', error);
    let errorMessage = 'Failed to fetch rental information';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Get market forecast information
export async function getMarketForecast(timeframe: string = '12 months'): Promise<ApiResponse> {
  try {
    const apiKey = apiKeyService.getStoredApiKey();
    
    if (!apiKey) {
      return {
        success: false,
        error: 'API key not configured. Please set up your OpenAI API key to use this feature.'
      };
    }
    
    updateApiKey(apiKey);
    
    const systemPrompt = `You are a specialized Dubai real estate market forecasting AI with access to current (2024) market data and trends.
Your role is to provide accurate, detailed market forecasts for Dubai's property sector.
Focus on delivering data-driven predictions with specific price trends, growth rates, and investment opportunities.
Always structure your response with clear sections including: Market Overview, Price Forecast by Area, 
Investment Hotspots, Risk Analysis, and Strategic Recommendations.
Ensure all forecasts are based on current economic indicators, government policies, and market dynamics.
Be specific about percentage changes expected and timeframes for developments.`;
    
    const userPrompt = `I need a comprehensive forecast of Dubai's real estate market for the next ${timeframe}. Please provide:

1. Overall Market Forecast:
   - Expected market direction (growth, stability, correction)
   - Projected average price movement (percentage change)
   - Transaction volume predictions
   - Supply and demand balance
   - Key market drivers and influencing factors

2. Segment Analysis & Projections:
   - Residential sector forecast (villas, apartments, townhouses)
   - Commercial sector outlook (offices, retail, industrial)
   - Luxury market predictions
   - Affordable housing segment trends
   - Off-plan vs. ready property market dynamics

3. Geographic Breakdown:
   - Performance forecast for key areas (Downtown, Dubai Marina, Palm Jumeirah, etc.)
   - Emerging areas with growth potential
   - Areas expected to underperform
   - Location-specific price movement predictions

4. Investment Opportunities:
   - Best-performing property types for the forecast period
   - Expected rental yield changes
   - ROI projections for different property categories
   - Investment strategy recommendations (buy, hold, sell)
   - Recommended entry/exit timelines

5. Risk Assessment:
   - Potential market vulnerabilities
   - Economic factors that could impact forecasts
   - Supply risks (oversupply/undersupply)
   - Regulatory changes that might affect the market
   - Global factors influencing Dubai real estate

6. Strategic Recommendations:
   - Actionable advice for investors
   - Timing strategies for market entry/exit
   - Property types to focus on/avoid
   - Geographic areas to prioritize
   - Risk mitigation approaches

Present all forecasts with specific figures, percentages, and objective data points wherever possible. Base projections on current economic indicators, government policies, and market trends.`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'gpt-4-turbo',
      temperature: 0.2,
      max_tokens: 1500,
    });

    return {
      success: true,
      data: completion.choices[0].message.content || "",
    };
  } catch (error) {
    console.error('Error in getMarketForecast:', error);
    let errorMessage = 'Failed to fetch market forecast';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
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
    const apiKey = apiKeyService.getStoredApiKey();
    
    if (!apiKey) {
      return {
        success: false,
        error: 'API key not configured. Please set up your OpenAI API key to use this feature.'
      };
    }
    
    updateApiKey(apiKey);
    
    const systemPrompt = `You are a specialized Dubai demographics and infrastructure intelligence AI with access to current (2024) data.
Your role is to provide accurate, detailed demographic analysis for specific areas in Dubai.
Focus on delivering data-driven insights with specific figures, infrastructure details, and population statistics.
Always structure your response with clear sections including: Population Statistics, Resident Demographics, 
Infrastructure Analysis, Community Profile, and Future Development Impact.
Ensure all information reflects current conditions and cites specific data points where possible.`;
    
    const userPrompt = `I need comprehensive demographic and infrastructure analysis for ${location} in Dubai. Please provide:

1. Population Statistics:
   - Total population and density
   - Population growth rate over the past 5 years
   - Distribution by age groups
   - Nationality breakdown with percentages

2. Socioeconomic Profile:
   - Income level distribution
   - Employment sectors dominant in this area
   - Education levels of residents
   - Proportion of property owners vs. renters

3. Infrastructure Analysis:
   - Transportation networks (metro/tram access, bus routes, road connectivity)
   - Educational institutions (schools, universities) with quality ratings
   - Healthcare facilities (hospitals, clinics)
   - Retail and commercial establishments
   - Recreational facilities (parks, sports complexes, beaches)

4. Lifestyle & Community:
   - Typical resident profiles (expats vs. locals, families vs. singles)
   - Community culture and characteristics
   - Safety and security statistics
   - Social amenities and community events

5. Real Estate Impact:
   - How demographics influence property values in this area
   - Correlation between resident profile and property types
   - Rental demand characteristics
   - Investment potential based on demographic trends

6. Future Outlook:
   - Projected population changes
   - Planned infrastructure developments
   - Expected demographic shifts
   - How these factors may impact property values

Present this information in a structured format with specific figures and data points wherever possible. 
Do not include any markdown formatting like asterisks (*) in the output. Format any section headers and important points without using markdown symbols.`;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'gpt-4-turbo',
      temperature: 0.2,
      max_tokens: 1500,
    });

    return {
      success: true,
      data: completion.choices[0].message.content || "",
    };
  } catch (error) {
    console.error('Error in getDemographicInfo:', error);
    let errorMessage = 'Failed to fetch demographic information';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Function to extract specific information from Dubai Land Department sources
export async function getDubaiLandInfo(infoType: 'projects' | 'regulations' | 'transactions' | 'services'): Promise<ApiResponse> {
  try {
    const apiKey = apiKeyService.getStoredApiKey();
    
    if (!apiKey) {
      return {
        success: false,
        error: 'API key not configured. Please set up your OpenAI API key to use this feature.'
      };
    }
    
    updateApiKey(apiKey);
    
    const systemPrompt = `You are a specialized Dubai Land Department data intelligence AI with access to current (2024) real estate regulatory information.
Your role is to provide accurate, detailed information about Dubai real estate regulations, services, projects, and transactions.
Focus on delivering factual, up-to-date information with specific details about regulations, processes, and requirements.
Always structure your response with clear sections and bullet points for readability.
Ensure all information reflects current policies and procedures as established by the Dubai Land Department.`;
    
    let userPrompt = '';
    
    switch (infoType) {
      case 'projects':
        userPrompt = `I need comprehensive information about real estate projects in Dubai. Please provide:

1. Major Development Projects:
   - List of significant ongoing development projects across Dubai
   - Key information about each project (developer, location, size, value)
   - Project completion timelines and current status
   - Notable features and unique selling points
   - Target market segments

2. Project Categories:
   - Breakdown of projects by type (residential, commercial, mixed-use)
   - Distribution across different areas of Dubai
   - Market share of major developers
   - Statistics on project launches and completions
   - Sustainability and smart initiatives in new projects

3. Regulatory Framework for Projects:
   - Approval process for new real estate projects
   - Escrow account requirements
   - Project registration procedures
   - Developer obligations and guarantees
   - Consumer protection mechanisms

Present this information with specific project examples, statistics, and factual data wherever possible.`;
        break;
        
      case 'regulations':
        userPrompt = `I need comprehensive information about current real estate regulations in Dubai. Please provide:

1. Property Ownership Laws:
   - Current freehold ownership rights for expatriates and UAE nationals
   - Leasehold property regulations
   - Ownership restrictions in different areas
   - Company and corporate ownership rules
   - Inheritance laws relating to property

2. Transaction Regulations:
   - Current fees and taxes on property transactions (transfer fees, registration fees)
   - VAT implications for real estate
   - Mortgage regulations and restrictions
   - Off-plan purchase protections
   - Title deed registration process

3. Rental Regulations:
   - Tenancy contract requirements
   - Rent increase regulations and RERA calculator
   - Security deposit rules
   - Eviction procedures and tenant protection
   - Holiday home and short-term rental regulations

4. Latest Regulatory Changes:
   - Recent changes to real estate laws (last 12-24 months)
   - Upcoming regulatory developments
   - COVID-19 related regulatory adjustments
   - Golden visa and residence through real estate investment

Present this information with specific regulatory references, fee percentages, and factual data wherever possible.`;
        break;
        
      case 'transactions':
        userPrompt = `I need comprehensive information about real estate transactions in Dubai. Please provide:

1. Transaction Volume & Value:
   - Current transaction statistics (number and value of transactions)
   - Year-on-year comparison with previous periods
   - Breakdown by property type (apartments, villas, commercial)
   - Off-plan vs. ready property transaction ratio
   - Average transaction values by area

2. Transaction Hotspots:
   - Areas with highest transaction volumes
   - Areas with highest transaction values
   - Emerging areas showing transaction growth
   - Property types with strongest transaction activity
   - Notable high-value transactions

3. Transaction Procedures:
   - Step-by-step process for property transactions
   - Documentation requirements
   - Due diligence procedures
   - Payment mechanisms and trustee accounts
   - Common transaction pitfalls and how to avoid them

4. Market Insights from Transaction Data:
   - Price trends revealed by transaction data
   - Buyer demographics (nationality, investor vs. end-user)
   - Mortgage vs. cash purchase trends
   - Seasonal transaction patterns
   - Investment yield indicators from transaction data

Present this information with specific transaction statistics, percentages, and factual data wherever possible.`;
        break;
        
      case 'services':
        userPrompt = `I need comprehensive information about services offered by the Dubai Land Department. Please provide:

1. Registration Services:
   - Property registration procedures
   - Title deed issuance process
   - Property ownership certificate services
   - Registration fees and charges
   - Required documentation for registration

2. Transaction Services:
   - Property valuation services
   - Sale and purchase transaction registration
   - Mortgage registration
   - Property transfer mechanisms
   - Gift and donation registration

3. Digital Services:
   - Online platforms (Dubai REST, eMart, etc.)
   - Smart applications and mobile services
   - Virtual access to property services
   - Blockchain initiatives (Dubai Blockchain Strategy)
   - Paperless transaction capabilities

4. Dispute Resolution & Legal Services:
   - Rental disputes center procedures
   - Property dispute resolution mechanisms
   - Legal advice and consultation services
   - Developer-buyer dispute management
   - Complaint procedures and escalation paths

5. Investor Services:
   - Services for international investors
   - Golden visa related property services
   - Investment advisory services
   - Market data and intelligence services
   - Investment protection mechanisms

Present this information with specific service descriptions, fees, processing times, and factual data wherever possible.`;
        break;
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'gpt-4-turbo',
      temperature: 0.2,
      max_tokens: 1500,
    });

    return {
      success: true,
      data: completion.choices[0].message.content || "",
    };
  } catch (error) {
    console.error('Error in getDubaiLandInfo:', error);
    let errorMessage = 'Failed to fetch Dubai Land Department information';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
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
  getPropertyInfo,
  getDeveloperInfo,
  getRentalMarketInfo,
  getMarketForecast,
  getDemographicInfo,
  getDubaiLandInfo,
  initWithApiKey
};

export default openAiService; 