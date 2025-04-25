import { NextResponse } from 'next/server';
import openai from '../../services/initOpenAi';

export async function POST(request: Request) {
  try {
    // Extract property details from the request
    const { 
      location, 
      propertyType, 
      bedrooms,
      bathrooms,
      area,
      age,
      amenities = [],
      view = '',
      floor = null,
      finishQuality = 'standard', // standard, luxury, ultra-luxury
      furnishingStatus = 'unfurnished', // unfurnished, semi-furnished, fully-furnished
      includeRentalEstimate = true,
      includeMarketComparison = true,
      includeInvestmentMetrics = true,
      model = 'gpt-4o-mini'
    } = await request.json();

    // Validate required fields
    if (!location || !propertyType || !area) {
      return NextResponse.json({ 
        success: false, 
        error: 'Location, property type, and area are required for valuation' 
      }, { status: 400 });
    }

    // Create detailed prompt for property valuation
    const prompt = `
As a Dubai real estate valuation expert, provide a comprehensive property valuation analysis for the following property:

Property Details:
- Location/Community: ${location}
- Property Type: ${propertyType}
- Bedrooms: ${bedrooms || 'N/A'}
- Bathrooms: ${bathrooms || 'N/A'}
- Area (sq ft): ${area}
- Age (years): ${age || 'N/A'}
- Floor: ${floor !== null ? floor : 'N/A'}
- View: ${view || 'Standard'}
- Amenities: ${amenities.length > 0 ? amenities.join(', ') : 'Standard community amenities'}
- Finish Quality: ${finishQuality}
- Furnishing Status: ${furnishingStatus}

Please provide a detailed property valuation with the following sections:

1. Estimated Market Value
   - Provide a price range (minimum and maximum estimated value)
   - Price per square foot
   - Confidence level of the estimate (high, medium, low)
   - Key factors influencing the valuation

2. Valuation Methodology
   - Explain how the valuation was determined
   - List comparable recent transactions in the same community/building
   - Discuss how specific property attributes affected the valuation

${includeRentalEstimate ? `
3. Rental Income Potential
   - Estimated annual rental income
   - Monthly rental estimate
   - Seasonal rental variations (if applicable)
   - Rental demand in the area
` : ''}

${includeMarketComparison ? `
4. Market Comparison
   - How the property compares to similar properties in the area
   - Price trends in the specific community over the past 2 years
   - Current market conditions for this property type and location
   - Supply and demand dynamics
` : ''}

${includeInvestmentMetrics ? `
5. Investment Analysis
   - Estimated gross rental yield
   - Net yield after expenses (service charges, maintenance, etc.)
   - Projected 3-year capital appreciation potential
   - Liquidity assessment (how quickly the property could be sold)
   - Overall investment rating (excellent, good, fair, poor)
` : ''}

6. Value Enhancement Opportunities
   - Recommended improvements to increase property value
   - Potential value-add from renovation or upgrade
   - Cost vs. benefit analysis of potential improvements

7. Market Risks and Considerations
   - Potential factors that could negatively impact the property value
   - Market-specific risks for this location
   - Regulatory considerations

Please provide numerical data where possible and explain your reasoning throughout the analysis. The valuation should reflect current Dubai market conditions and recent transaction data.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { 
          role: "system", 
          content: "You are a Dubai real estate valuation expert with extensive knowledge of property prices, market trends, and valuation methodologies. You provide comprehensive, accurate, and data-driven property valuations based on current market conditions and recent comparable sales." 
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
    console.error('Error in property valuation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate property valuation' 
    }, { status: 500 });
  }
} 