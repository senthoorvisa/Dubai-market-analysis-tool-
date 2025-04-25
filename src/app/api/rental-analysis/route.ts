import { NextResponse } from 'next/server';
import openai from '../../services/initOpenAi';

export async function POST(request: Request) {
  try {
    // Extract the location and property details from the request
    const { 
      location, 
      propertyType,
      bedrooms,
      model = 'gpt-4o-mini' 
    } = await request.json();
    
    if (!location) {
      return NextResponse.json({ 
        success: false, 
        error: 'Location is required' 
      }, { status: 400 });
    }

    // Create the detailed prompt for rental analysis
    const bedroomText = bedrooms ? `${bedrooms} bedroom` : '';
    const propertyTypeText = propertyType || 'property';
    
    const prompt = `You are a Dubai real estate market expert assistant. Please provide a detailed rental market analysis for ${bedroomText} ${propertyTypeText} in ${location}, Dubai.

Please include:
1. Current average rental prices for this property type in this area
2. Rental price trends over the past 12 months
3. Rental yield estimates
4. Tenant demand analysis
5. Seasonal rental fluctuations
6. Market supply status (oversupplied, balanced, undersupplied)
7. Future outlook for rental prices in this area
8. Recommendations for landlords

Base your analysis on current Dubai real estate market data, referencing the Dubai Land Department records and RERA index where possible.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { 
          role: "system", 
          content: "You are a Dubai real estate market expert assistant specializing in rental market analysis. Provide detailed, factual information based on current market data." 
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
    console.error('Error in rental analysis:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to analyze rental market' 
    }, { status: 500 });
  }
} 