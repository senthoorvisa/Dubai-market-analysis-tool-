import { NextResponse } from 'next/server';
import openai from '../../services/initOpenAi';

export async function POST(request: Request) {
  try {
    // Extract market trend analysis details from the request
    const { 
      location,
      propertyType,
      timeframe = '12', // months
      metricFocus = ['price', 'transactions', 'demand'], // default metrics
      compareLocations = [],
      includeDeveloperActivity = false,
      includeRegulatoryChanges = false,
      includeInfrastructureProjects = false,
      forecastPeriod = '12', // months
      segmentAnalysis = false,
      model = 'gpt-4o-mini'
    } = await request.json();

    // Validate required fields
    if (!location) {
      return NextResponse.json({ 
        success: false, 
        error: 'Location is required for market trend analysis' 
      }, { status: 400 });
    }

    // Create detailed prompt for market trend analysis
    const prompt = `As a Dubai real estate market analyst with access to the latest market data, provide a comprehensive market trend analysis for the following criteria:

Analysis Parameters:
- Primary Location: ${location}
- Property Type: ${propertyType || 'All property types'}
- Analysis Timeframe: Past ${timeframe} months
- Metrics of Focus: ${metricFocus.join(', ')}
- Comparison Locations: ${compareLocations.length > 0 ? compareLocations.join(', ') : 'None requested'}
- Include Developer Activity: ${includeDeveloperActivity ? 'Yes' : 'No'}
- Include Regulatory Changes: ${includeRegulatoryChanges ? 'Yes' : 'No'}
- Include Infrastructure Projects: ${includeInfrastructureProjects ? 'Yes' : 'No'}
- Forecast Period: Next ${forecastPeriod} months
- Segment Analysis (Luxury, Mid-market, Affordable): ${segmentAnalysis ? 'Yes' : 'No'}

Please provide a comprehensive market trend analysis including:

1. Price Trend Analysis
   - Historical price trends for ${location} ${propertyType ? `(${propertyType})` : ''} over the past ${timeframe} months
   - Comparison to Dubai market average
   - Price volatility assessment
   - Price growth rate (annualized)

2. Transaction Volume Analysis
   - Transaction volume trends
   - Buyer profile changes (if any)
   - Percentage of off-plan vs. secondary market transactions
   - Average time on market

3. Supply and Demand Analysis
   - Current supply levels
   - Projected new supply entering the market
   - Absorption rates
   - Occupancy rates trends

4. Rental Market Analysis
   - Rental yield trends
   - Rental price movement
   - Tenant preferences and behavior

5. Market Sentiment Indicators
   - Investor confidence metrics
   - End-user vs. investor purchasing patterns
   - Foreign investment trends

6. Forecast for Next ${forecastPeriod} Months
   - Price projections
   - Expected transaction volume
   - Market risks and opportunities
   - Key factors likely to influence the market

${includeDeveloperActivity ? `
7. Developer Activity
   - Major projects launched in ${location}
   - Construction progress updates
   - Developer financing trends
   - Developer incentives and payment plans
` : ''}

${includeRegulatoryChanges ? `
8. Regulatory Environment
   - Recent regulatory changes affecting ${location}
   - RERA updates
   - Visa policy impacts on real estate
   - Financing regulations
` : ''}

${includeInfrastructureProjects ? `
9. Infrastructure Development
   - Major infrastructure projects affecting ${location}
   - Timeline for completions
   - Expected impact on property values
   - Accessibility improvements
` : ''}

${segmentAnalysis ? `
10. Market Segment Analysis
    - Luxury segment performance
    - Mid-market segment performance 
    - Affordable housing segment performance
    - Comparative analysis between segments
` : ''}

${compareLocations.length > 0 ? `
11. Location Comparison
    - Comparative performance metrics with ${compareLocations.join(', ')}
    - Investment advantages/disadvantages between locations
    - Risk-adjusted returns comparison
` : ''}

12. Investment Implications
    - Best performing sub-areas within ${location}
    - Property types showing strongest performance
    - Investment strategy recommendations
    - Risk assessment (low, medium, high) with detailed explanation

Please use data-driven analysis referencing Dubai Land Department statistics, Property Finder data, and other reliable market sources. Include relevant metrics and percentages where possible.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { 
          role: "system", 
          content: "You are a Dubai real estate market analyst with expertise in property market trends, price forecasting, and investment strategy. You have access to comprehensive market data and provide detailed, data-driven trend analyses for investors and property professionals." 
        },
        { role: "user", content: prompt }
      ],
    });
    
    const responseText = completion.choices[0]?.message?.content || '';
    
    return NextResponse.json({ 
      success: true,
      data: responseText
    });
  } catch (error) {
    console.error('Error in market trend analysis:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to perform market trend analysis' 
    }, { status: 500 });
  }
} 