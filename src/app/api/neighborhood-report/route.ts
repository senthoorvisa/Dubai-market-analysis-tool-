import { NextResponse } from 'next/server';
import openai from '../../services/initOpenAi';

export async function POST(request: Request) {
  try {
    // Extract neighborhood analysis details from the request
    const { 
      neighborhood,
      includeLifestyleAmenities = true,
      includeTransportation = true,
      includeSchools = true,
      includeHealthcare = true,
      includeRetail = true,
      includeDining = true,
      includePropertyTypes = true,
      includeInvestmentPotential = true,
      includeExpatsGuide = false,
      includeFutureProjects = true,
      model = 'gpt-4o-mini'
    } = await request.json();

    // Validate required fields
    if (!neighborhood) {
      return NextResponse.json({ 
        success: false, 
        error: 'Neighborhood is required for analysis' 
      }, { status: 400 });
    }

    // Create detailed prompt for neighborhood report
    const prompt = `As a Dubai neighborhood specialist, provide a comprehensive neighborhood report for ${neighborhood} with the following sections:

1. Overview and History
   - Brief history of ${neighborhood}
   - Location within Dubai
   - Character and atmosphere
   - Demographic profile (expat/local ratio, family-friendly, professional, etc.)

${includeLifestyleAmenities ? `
2. Lifestyle and Amenities
   - Parks and green spaces
   - Community facilities
   - Beach access (if applicable)
   - Sports facilities
   - Community events
   - Pools and fitness centers
` : ''}

${includeTransportation ? `
3. Transportation and Accessibility
   - Metro stations and proximity
   - Bus routes
   - Road connections and major highways
   - Taxi availability
   - Walking and cycling infrastructure
   - Average commute times to key Dubai locations
` : ''}

${includeSchools ? `
4. Education Options
   - List of nurseries and preschools
   - Primary schools (rating, curriculum, fee range)
   - Secondary schools (rating, curriculum, fee range)
   - Distance to universities or higher education
   - School bus services
` : ''}

${includeHealthcare ? `
5. Healthcare Facilities
   - Hospitals within or near the neighborhood
   - Medical clinics and specialty centers
   - Pharmacies
   - Wellness and fitness centers
` : ''}

${includeRetail ? `
6. Shopping and Retail
   - Major malls and shopping centers
   - Supermarkets and grocery stores
   - Convenience stores
   - Specialty shops
   - Service providers (banks, salons, etc.)
` : ''}

${includeDining ? `
7. Dining and Entertainment
   - Restaurant variety and notable establishments
   - Cafes and coffee shops
   - Nightlife options
   - Family entertainment venues
   - Cultural attractions
` : ''}

${includePropertyTypes ? `
8. Property Types and Housing
   - Common property types (apartments, villas, townhouses)
   - Average property sizes
   - Notable residential buildings or communities
   - Architectural styles
   - Age of properties
   - Common amenities in residential buildings
` : ''}

${includeInvestmentPotential ? `
9. Real Estate Investment Potential
   - Current price ranges (per sq ft for different property types)
   - Rental yield estimates
   - Capital appreciation history and forecast
   - Occupancy rates
   - Tenant profile
   - New developments and their potential impact
` : ''}

${includeExpatsGuide ? `
10. Expat Living Guide
    - Expat community presence
    - Integration ease
    - Social groups and networking
    - Cultural considerations
    - Cost of living compared to other Dubai neighborhoods
` : ''}

${includeFutureProjects ? `
11. Future Development Projects
    - Announced infrastructure improvements
    - New residential or commercial developments
    - Master plan changes
    - Timeline for major projects
    - Potential impact on property values
` : ''}

12. Pros and Cons Summary
    - Key advantages of living in ${neighborhood}
    - Potential drawbacks or considerations
    - Best suited resident profiles
    - Alternative neighborhoods with similar characteristics

Please provide accurate, detailed information reflecting the latest data on ${neighborhood}. Include numerical data where available and mention any recent changes or developments. The report should help potential residents or investors make informed decisions about ${neighborhood}.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { 
          role: "system", 
          content: "You are a Dubai neighborhood specialist with extensive knowledge of all Dubai communities, their amenities, lifestyle offerings, property types, and investment potential. You provide comprehensive, accurate, and up-to-date neighborhood reports to help residents and investors make informed decisions." 
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
    console.error('Error in neighborhood analysis:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate neighborhood report' 
    }, { status: 500 });
  }
} 