import { NextResponse } from 'next/server';
import openai from '../../services/initOpenAi';

export async function POST(request: Request) {
  try {
    // Extract the property search criteria from the request
    const { location, propertyType, bedrooms, priceRange, amenities, model = 'gpt-4o-mini' } = await request.json();
    
    if (!location) {
      return NextResponse.json({ 
        success: false, 
        error: 'Location is required' 
      }, { status: 400 });
    }

    // Create the prompt for property lookup
    let prompt = `You are a Dubai real estate market expert assistant. Please provide detailed information about properties in Dubai with the following criteria:\n\n`;
    
    if (location) {
      prompt += `Location: ${location}\n`;
    }
    if (propertyType) {
      prompt += `Property Type: ${propertyType}\n`;
    }
    if (bedrooms) {
      prompt += `Bedrooms: ${bedrooms}\n`;
    }
    if (priceRange) {
      prompt += `Price Range: ${priceRange}\n`;
    }
    if (amenities && amenities.length > 0) {
      prompt += `Amenities: ${amenities.join(', ')}\n`;
    }

    prompt += `\nFor this property search, please provide the following information:
1. Current average price for properties matching these criteria
2. Recent market trends for this type of property
3. Investment potential and ROI analysis
4. Similar properties in the area and their comparative values
5. Any notable developments or infrastructure projects nearby
6. Recommendations for potential buyers or investors

Base your analysis on current Dubai real estate market data, referencing the Dubai Land Department records where possible.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { 
          role: "system", 
          content: "You are a Dubai real estate market expert assistant. Provide detailed, factual information about Dubai's real estate market." 
        },
        { role: "user", content: prompt }
      ],
    });
    
    const responseText = completion.choices[0]?.message?.content || '';
    
    return NextResponse.json({ 
      success: true,
      data: responseText,
      sources: [
        "Dubai Land Department (dubailand.gov.ae)",
        "OpenAI Property Analysis",
        "Dubai Real Estate Market Data"
      ]
    });
  } catch (error) {
    console.error('Error in property lookup:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get property information' 
    }, { status: 500 });
  }
} 