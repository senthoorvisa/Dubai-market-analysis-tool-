import { NextResponse } from 'next/server';
import openai from '../../services/initOpenAi';

export async function POST(request: Request) {
  try {
    // Extract the prompt and model from the request
    const { prompt, model = 'gpt-4o-mini' } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ 
        success: false, 
        error: 'Prompt is required' 
      }, { status: 400 });
    }

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
      data: responseText 
    });
  } catch (error) {
    console.error('Error in OpenAI request:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
} 