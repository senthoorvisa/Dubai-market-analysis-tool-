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
      viewType = "",
      furnishingStatus = "",
      model = 'gpt-4o-mini'
    } = await request.json();

    // Validate required fields
    if (!location || !propertyType || !area) {
      return NextResponse.json({ 
        success: false, 
        error: 'Location, property type, and area are required' 
      }, { status: 400 });
    }

    // Create detailed prompt for property estimation
    const prompt = `As a Dubai real estate valuation expert, please provide a detailed property price estimation for the following property:

Property Details:
- Location: ${location}
- Property Type: ${propertyType}
- Bedrooms: ${bedrooms || 'Not specified'}
- Bathrooms: ${bathrooms || 'Not specified'}
- Area: ${area} square feet/meters
- Property Age: ${age || 'Not specified'} years
- Amenities: ${amenities.length > 0 ? amenities.join(', ') : 'Not specified'}
- View Type: ${viewType || 'Not specified'}
- Furnishing Status: ${furnishingStatus || 'Not specified'}

Please provide:
1. Estimated market value range (in AED)
2. Estimated rental income (monthly in AED)
3. Price per square foot/meter comparison with similar properties
4. Key factors influencing this valuation
5. Confidence level of the estimation (high, medium, low) with explanation
6. Market trend for this type of property in the specified location
7. Recommendations for value enhancement
8. Comparable recent transactions in the area

Use data from reliable sources such as Dubai Land Department, Property Finder, Bayut, and other local real estate platforms.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { 
          role: "system", 
          content: "You are a Dubai real estate valuation expert specializing in property price estimation. Provide accurate, data-driven valuations based on current market conditions." 
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
    console.error('Error in property estimation:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to estimate property value' 
    }, { status: 500 });
  }
} 