import { NextResponse } from 'next/server';
import openai from '../../services/initOpenAi';

export async function POST(request: Request) {
  try {
    // Extract the developer name from the request
    const { developerName, model = 'gpt-4o-mini' } = await request.json();
    
    if (!developerName) {
      return NextResponse.json({ 
        success: false, 
        error: 'Developer name is required' 
      }, { status: 400 });
    }

    // Create the prompt for developer info
    const prompt = `You are a Dubai real estate market expert assistant. Please provide detailed information about the developer "${developerName}" in Dubai's real estate market.

Please include:
1. Company profile and history in Dubai
2. Major projects and developments (completed, ongoing, and planned)
3. Market reputation and reliability assessment
4. Quality standards and typical property features
5. Price range of their properties
6. Investment performance of their previous projects
7. Any relevant news or updates about this developer

Base your analysis on current Dubai real estate market data, referencing the Dubai Land Department records where possible.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { 
          role: "system", 
          content: "You are a Dubai real estate market expert assistant. Provide detailed, factual information about Dubai's real estate market and developers." 
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
    console.error('Error in developer info:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get developer information' 
    }, { status: 500 });
  }
} 