import { NextResponse } from 'next/server';
import openai from '../../services/initOpenAi';

export async function POST(request: Request) {
  try {
    // Extract competitor analysis parameters from the request
    const { 
      propertyAddress,
      propertyType, 
      bedrooms,
      bathrooms,
      area,
      priceRange, // Optional: ["min", "max"]
      radius = 5, // kilometers
      amenities = [], // Optional: array of amenities
      model = 'gpt-4o-mini'
    } = await request.json();

    // Validate required fields
    if (!propertyAddress || !propertyType) {
      return NextResponse.json({ 
        success: false, 
        error: 'Property address and property type are required' 
      }, { status: 400 });
    }

    // Create detailed prompt for competitor analysis
    const bedroomText = bedrooms ? `${bedrooms} bedroom` : '';
    const bathroomText = bathrooms ? `${bathrooms} bathroom` : '';
    const areaText = area ? `approximately ${area} sq ft/meters` : '';
    const amenitiesText = amenities.length > 0 ? `with amenities including ${amenities.join(', ')}` : '';
    const priceRangeText = priceRange ? `in the price range of ${priceRange[0]} to ${priceRange[1]} AED` : '';

    const prompt = `You are a Dubai real estate market expert. Please provide a detailed competitor analysis for a ${bedroomText} ${bathroomText} ${propertyType} property located at "${propertyAddress}" with ${areaText} ${amenitiesText} ${priceRangeText}.

The analysis should focus on properties within a ${radius}km radius and should include:

1. Overview of similar properties currently listed for sale/rent
2. Price comparison (average, median, high, and low prices)
3. Average days on market for similar properties
4. Key differentiating factors between the subject property and competitors
5. Unique selling points of competing properties
6. Assessment of competitive advantage/disadvantage
7. Recommendations for pricing strategy based on competitor analysis
8. Recommendations for marketing strategy to stand out from competition
9. Identification of any market gaps or opportunities

Use data from reliable sources such as Dubai Land Department, Property Finder, Bayut, and other local real estate platforms.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { 
          role: "system", 
          content: "You are a Dubai real estate competitor analysis expert. Provide detailed, data-driven analysis of similar properties in the requested area based on current market listings." 
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
    console.error('Error in competitor analysis:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to analyze competitor properties' 
    }, { status: 500 });
  }
} 