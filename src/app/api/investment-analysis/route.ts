import { NextResponse } from 'next/server';
import openai from '../../services/initOpenAi';

export async function POST(request: Request) {
  try {
    // Extract investment details from the request
    const { 
      location,
      propertyType, 
      purchasePrice,
      expectedRent,
      downPayment,
      loanTerm = 25,
      interestRate = 3.99,
      maintenanceCosts = 5, // percentage of property value
      serviceCharges = 15, // AED per sq ft annually
      area,
      occupancyRate = 90, // percentage
      investmentPeriod = 5, // years
      propertyAppreciationRate = 5, // percentage annually
      model = 'gpt-4o-mini'
    } = await request.json();

    // Validate required fields
    if (!location || !propertyType || !purchasePrice || !expectedRent || !area) {
      return NextResponse.json({ 
        success: false, 
        error: 'Location, property type, purchase price, expected rent, and area are required' 
      }, { status: 400 });
    }

    // Create detailed prompt for investment analysis
    const prompt = `As a Dubai real estate investment analyst, please provide a comprehensive investment analysis for the following property:

Investment Property Details:
- Location: ${location}
- Property Type: ${propertyType}
- Purchase Price: ${purchasePrice} AED
- Expected Monthly Rent: ${expectedRent} AED
- Area: ${area} square feet
- Down Payment: ${downPayment || 'Not specified'} AED (${downPayment ? ((downPayment/purchasePrice)*100).toFixed(2) : '?'}% of purchase price)
- Loan Term: ${loanTerm} years
- Interest Rate: ${interestRate}%
- Annual Maintenance Costs: ${maintenanceCosts}% of property value
- Service Charges: ${serviceCharges} AED per square foot annually
- Expected Occupancy Rate: ${occupancyRate}%
- Investment Period: ${investmentPeriod} years
- Expected Annual Property Appreciation: ${propertyAppreciationRate}%

Please provide a comprehensive investment analysis including:

1. Return on Investment (ROI) calculation
2. Cash on Cash Return
3. Cap Rate
4. Gross Rental Yield
5. Net Rental Yield
6. Monthly cash flow analysis
7. Break-even analysis
8. Investment payback period
9. Projected property value after ${investmentPeriod} years
10. Internal Rate of Return (IRR)
11. Comparison with market averages for similar properties in ${location}
12. Risk assessment (low, medium, high) with detailed explanation
13. Sensitivity analysis showing how changes in key variables affect returns
14. Investment recommendations and alternative strategies

Include all tax considerations relevant to Dubai real estate investments, including rental income registration fees and any taxes applicable to foreign investors if relevant.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { 
          role: "system", 
          content: "You are a Dubai real estate investment analyst specializing in property ROI analysis. Provide detailed, data-driven investment analyses that help investors make informed decisions." 
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
    console.error('Error in investment analysis:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to perform investment analysis' 
    }, { status: 500 });
  }
} 