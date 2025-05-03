import OpenAI from 'openai';
import apiKeyService from './apiKeyService';

// Initialize OpenAI with the API key
const getOpenAIClient = (): OpenAI | null => {
  const apiKey = apiKeyService.getStoredApiKey();
  if (!apiKey) {
    console.error('No API key found. Please configure your API key in settings.');
    return null;
  }
  
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Required for client-side usage
  });
};

// Get property valuation history data
export async function getPropertyValuationHistory(
  location: string,
  propertyType: string,
  bedrooms: number,
  initialYear: number,
  initialPrice: number
): Promise<{ year: number; price: number }[]> {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error('OpenAI client not initialized. Please check your API key.');
  }

  try {
    // Get current date information
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    const prompt = `
      Based on real Dubai real estate market data, generate a realistic price history and forecast for the following property:
      - Location: ${location}
      - Property Type: ${propertyType}
      - Bedrooms: ${bedrooms}
      - Initial Purchase Year: ${initialYear}
      - Initial Purchase Price: ${initialPrice} AED

      Important: Today's date is ${currentDate.toISOString().split('T')[0]}, the current year is ${currentYear}.
      
      Generate year-by-year price estimates from ${initialYear} to ${currentYear + 2} based on real Dubai property market trends, including the effects of any significant market events (like the 2008-2009 global financial crisis, COVID-19 impact, etc.).
      
      Provide the data as a valid JSON array in the following format:
      [
        { "year": ${initialYear}, "price": ${initialPrice} },
        { "year": ${initialYear + 1}, "price": ESTIMATED_PRICE },
        ...
        { "year": ${currentYear}, "price": CURRENT_MARKET_PRICE },
        { "year": ${currentYear + 1}, "price": FORECAST_PRICE },
        { "year": ${currentYear + 2}, "price": FORECAST_PRICE }
      ]
      
      Show annual changes that realistically reflect Dubai's actual real estate market performance during those years. Only output the JSON array with no other text.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1200
    });

    const content = response.choices[0]?.message?.content?.trim() || '[]';
    
    // Extract the JSON data
    const jsonMatch = content.match(/(\[.*\])/s);
    const jsonString = jsonMatch ? jsonMatch[0] : '[]';
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error getting property valuation history:', error);
    throw error;
  }
}

// Get nearby property data
export async function getNearbyProperties(
  location: string,
  propertyType: string,
  bedrooms: number,
  count: number = 5
): Promise<any[]> {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error('OpenAI client not initialized. Please check your API key.');
  }

  try {
    // Get current date information
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    const prompt = `
      Based on real Dubai real estate market data, generate realistic information about ${count} properties near ${location} that are similar to a ${bedrooms} bedroom ${propertyType}.
      
      Important: Today's date is ${currentDate.toISOString().split('T')[0]}, the current year is ${currentYear}. All data should reflect current market conditions.
      
      For each property, include:
      - Address (specific to ${location} area in Dubai)
      - Original sale price (when it was first sold)
      - Current valuation (based on ${currentYear} market values)
      - Percentage change
      - Year built (must be a past year, no later than ${currentYear - 1})
      - Property size in sq ft
      - Developer name (use real Dubai developers)
      
      Provide the data as a valid JSON array in the following format:
      [
        {
          "id": 1,
          "address": "Example address in ${location}",
          "originalPrice": 1000000,
          "currentValuation": 1500000,
          "percentageChange": 50,
          "yearBuilt": 2015,
          "size": 1200,
          "developer": "Example Developer"
        },
        ...
      ]
      
      Make sure all the data is realistic for the Dubai market in ${currentYear}, using actual price ranges, developer names, and addresses appropriate for ${location}. Only output the JSON array with no other text.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const content = response.choices[0]?.message?.content?.trim() || '[]';
    
    // Extract the JSON data
    const jsonMatch = content.match(/(\[.*\])/s);
    const jsonString = jsonMatch ? jsonMatch[0] : '[]';
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error getting nearby properties:', error);
    throw error;
  }
}

// Get developer analysis data
export async function getDeveloperAnalysis(developerName: string): Promise<any> {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error('OpenAI client not initialized. Please check your API key.');
  }

  try {
    // Get current date information
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    const prompt = `
      Based on real Dubai real estate market data, generate a realistic analysis of the developer "${developerName}" including:
      
      Important: Today's date is ${currentDate.toISOString().split('T')[0]}, the current year is ${currentYear}. All data should reflect current market conditions.
      
      1. Overview of their projects (focusing on projects from ${currentYear-5} to ${currentYear})
      2. Average price per square foot across their developments in ${currentYear}
      3. Quality rating (1-10)
      4. Average ROI of their properties based on ${currentYear} market data
      5. Completion timeline reliability
      6. Notable projects with brief descriptions (include both completed and ongoing projects)
      7. Market reputation score (1-10)
      
      Provide the data as a valid JSON object in the following format:
      {
        "overview": "Brief description of the developer",
        "pricePerSqFt": 1500,
        "qualityRating": 8,
        "averageROI": 7.5,
        "timelineReliability": "Good",
        "notableProjects": [
          { "name": "Project 1", "description": "Brief description", "location": "Area", "status": "Completed in 2021" },
          { "name": "Project 2", "description": "Brief description", "location": "Area", "status": "Under construction, ${currentYear+1} completion" }
        ],
        "reputationScore": 8.5,
        "strengths": ["Strength 1", "Strength 2", ...],
        "weaknesses": ["Weakness 1", "Weakness 2", ...]
      }
      
      Make sure all the data is realistic for the Dubai market in ${currentYear}, using actual developer information for "${developerName}". Only output the JSON object with no other text.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content?.trim() || '{}';
    
    // Extract the JSON data
    const jsonMatch = content.match(/(\{.*\})/s);
    const jsonString = jsonMatch ? jsonMatch[0] : '{}';
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error getting developer analysis:', error);
    throw error;
  }
}

// Get market overview data
export async function getMarketOverview(): Promise<any> {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error('OpenAI client not initialized. Please check your API key.');
  }

  try {
    // Get current date information
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonthName = monthNames[currentMonth];
    const previousMonthName = monthNames[currentMonth === 0 ? 11 : currentMonth - 1];
    
    const prompt = `
      Based on real Dubai real estate market data, generate a realistic current market overview for ${currentMonthName} ${currentYear} including:
      
      Important: Today's date is ${currentDate.toISOString().split('T')[0]}. All data must be current as of this date.
      
      1. Transaction volume (monthly for ${previousMonthName} ${currentYear} and year to date for ${currentYear})
      2. Average price per square foot for apartments and villas
      3. Top investment hotspots in ${currentYear} with their ROI
      4. Current market trends in ${currentMonthName} ${currentYear}
      5. Upcoming developments (starting construction in ${currentYear}-${currentYear + 1})
      
      Provide the data as a valid JSON object in the following format:
      {
        "transactionVolume": {
          "monthly": 7000,
          "yearToDate": 65000,
          "monthlyChange": 12.4,
          "yearlyChange": 18.7
        },
        "averagePrice": {
          "apartments": 1450,
          "villas": 1380,
          "apartmentsChange": 5.8,
          "villasChange": 8.2
        },
        "investmentHotspots": [
          { "area": "Business Bay", "roi": 18.4 },
          ...
        ],
        "marketTrends": [
          "Trend 1",
          ...
        ],
        "upcomingDevelopments": [
          "Development 1",
          ...
        ]
      }
      
      Make sure all the data is realistic for the current Dubai market in ${currentMonthName} ${currentYear}. Only output the JSON object with no other text.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content?.trim() || '{}';
    
    // Extract the JSON data
    const jsonMatch = content.match(/(\{.*\})/s);
    const jsonString = jsonMatch ? jsonMatch[0] : '{}';
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error getting market overview:', error);
    throw error;
  }
}

// Get upcoming projects data
export async function getUpcomingProjects(location: string = ''): Promise<any[]> {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error('OpenAI client not initialized. Please check your API key.');
  }

  try {
    const locationFilter = location ? `in the ${location} area of Dubai` : 'across Dubai';
    
    // Get current date information for realistic timelines
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const currentQuarter = Math.ceil(currentMonth / 3);
    
    const prompt = `
      Based on real Dubai real estate market data, generate realistic information about 5 upcoming property development projects ${locationFilter}.
      
      Important: Today's date is ${currentDate.toISOString().split('T')[0]}, so all expected completion dates must be in the future relative to this date.
      
      For each project, include:
      - Project name
      - Developer name (use real Dubai developers)
      - Location (specific area in Dubai)
      - Expected completion date (must be future dates only, starting from Q${currentQuarter} ${currentYear} onwards)
      - Property types (e.g., apartments, villas, townhouses)
      - Estimated price range
      - Total units
      - Key features/amenities
      - Current construction status (e.g., "Foundation work", "30% complete")
      
      Provide the data as a valid JSON array in the following format:
      [
        {
          "id": 1,
          "name": "Example Heights",
          "developer": "Developer Name",
          "location": "Area Name",
          "completionDate": "Q4 ${currentYear + 1}",
          "propertyTypes": ["Apartments", "Penthouses"],
          "priceRange": "2.5M - 7M AED",
          "totalUnits": 280,
          "keyFeatures": ["Smart home technology", "Private beach access", "Infinity pool"],
          "constructionStatus": "Foundation work (15% complete)",
          "imageUrl": "https://example.com/image.jpg"
        },
        ...
      ]
      
      Make sure all the data is realistic for the Dubai market, using actual developer names and areas, with realistic timelines and price points. All projects must be future projects with completion dates ranging from ${currentYear} to ${currentYear + 3}. Only output the JSON array with no other text.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const content = response.choices[0]?.message?.content?.trim() || '[]';
    
    // Extract the JSON data
    const jsonMatch = content.match(/(\[.*\])/s);
    const jsonString = jsonMatch ? jsonMatch[0] : '[]';
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error getting upcoming projects:', error);
    throw error;
  }
}

// Get ongoing projects data
export async function getOngoingProjects(location: string = ''): Promise<any[]> {
  const openai = getOpenAIClient();
  if (!openai) {
    throw new Error('OpenAI client not initialized. Please check your API key.');
  }

  try {
    const locationFilter = location ? `in the ${location} area of Dubai` : 'across Dubai';
    
    // Get current date information for realistic timelines
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const currentQuarter = Math.ceil(currentMonth / 3);
    
    const prompt = `
      Based on real Dubai real estate market data, generate realistic information about 5 ongoing property development projects ${locationFilter} that are currently under construction.
      
      Important: Today's date is ${currentDate.toISOString().split('T')[0]}, so all expected completion dates must be in the future relative to this date.
      
      For each project, include:
      - Project name
      - Developer name (use real Dubai developers)
      - Location (specific area in Dubai)
      - Expected completion date (must be future dates only, starting from Q${currentQuarter} ${currentYear} onwards, but no later than Q4 ${currentYear + 1} since these are ongoing projects)
      - Property types (e.g., apartments, villas, townhouses)
      - Price range
      - Total units
      - Percentage completed (between 30% and 90% since these are ongoing projects)
      - Key features/amenities
      - Construction update
      
      Provide the data as a valid JSON array in the following format:
      [
        {
          "id": 1,
          "name": "Example Residences",
          "developer": "Developer Name",
          "location": "Area Name",
          "completionDate": "Q${currentQuarter + 1 > 4 ? 1 : currentQuarter + 1} ${currentQuarter + 1 > 4 ? currentYear + 1 : currentYear}",
          "propertyTypes": ["Villas", "Townhouses"],
          "priceRange": "4M - 12M AED",
          "totalUnits": 150,
          "percentageCompleted": 65,
          "keyFeatures": ["Private gardens", "Community center", "Sports facilities"],
          "constructionUpdate": "Structural work completed, interior finishing in progress",
          "imageUrl": "https://example.com/image.jpg"
        },
        ...
      ]
      
      Make sure all the data is realistic for the Dubai market, using actual developer names and areas, with realistic timelines, completion percentages, and price points. All completion dates must be in the near future (within the next 12 months). Only output the JSON array with no other text.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const content = response.choices[0]?.message?.content?.trim() || '[]';
    
    // Extract the JSON data
    const jsonMatch = content.match(/(\[.*\])/s);
    const jsonString = jsonMatch ? jsonMatch[0] : '[]';
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error getting ongoing projects:', error);
    throw error;
  }
}

// Export all functions
export default {
  getPropertyValuationHistory,
  getNearbyProperties,
  getDeveloperAnalysis,
  getMarketOverview,
  getUpcomingProjects,
  getOngoingProjects
}; 