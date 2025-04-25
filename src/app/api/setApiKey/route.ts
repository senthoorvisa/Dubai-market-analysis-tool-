import { NextResponse } from 'next/server';

// API route to set the OpenAI API key
export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    
    // In a real app, you'd securely store this key in a database or environment variable
    // Here we're returning it for the client to store in localStorage
    
    return NextResponse.json({
      success: true,
      message: 'API key received',
      apiKey
    });
  } catch (error) {
    console.error('Error in API key setting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process API key' },
      { status: 500 }
    );
  }
}

// GET method to check API status
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'OpenAI integration is active'
  });
} 