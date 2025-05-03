import { NextResponse } from 'next/server';
import dataIngestionService from '@/app/services/dataIngestionService';
import apiKeyService from '@/app/services/apiKeyService';

// Mock data for testing without actual API calls
const mockProperty = {
  id: "123456",
  source: "bayut" as const,
  title: "Luxury 3 Bedroom Apartment in Downtown Dubai",
  description: "<p>This stunning apartment features <b>modern amenities</b> and offers spectacular views of the Burj Khalifa. Located in the heart of Downtown Dubai, this property has easy access to Dubai Mall, restaurants, and public transportation.</p><p>Key Features:<br/>- Large balcony<br/>- Built-in wardrobes<br/>- Modern kitchen with appliances<br/>- Swimming pool access<br/>- Gym access<br/>- 24/7 security</p><p>[BAYUT_EXCLUSIVE] Contact agent John Doe at 971-55-123-4567 to schedule a viewing.</p>",
  price: 2500000,
  currency: "AED",
  size: 1500,
  area_unit: "sqft",
  bedrooms: 3,
  bathrooms: 3.5,
  location: "Downtown Dubai, Dubai",
  coordinates: {
    lat: 25.197197,
    lng: 55.274376
  },
  amenities: ["Swimming Pool", "Gym", "Security", "Parking", "Balcony"],
  images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  createdAt: "2023-06-15T10:30:00Z",
  updatedAt: "2023-09-28T14:45:00Z",
  originalLanguage: "en",
  propertyType: "apartment"
};

export async function POST(request: Request) {
  try {
    const { apiKey, source, properties, options } = await request.json();
    
    // Validate request
    if (!apiKey || !source || !properties) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters: apiKey, source, properties' 
        },
        { status: 400 }
      );
    }
    
    // Use secureSetApiKey for OpenAI API key
    if (!apiKeyService.secureSetApiKey(apiKey)) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 400 }
      );
    }
    
    // Process the data
    const processedData = await dataIngestionService.processPropertyData(
      properties,
      options || {}
    );
    
    // If chunking is requested, process descriptions into chunks
    if (options?.chunkSize) {
      for (const property of processedData) {
        if (property.description) {
          property.descriptionChunks = dataIngestionService.processDescriptionText(
            property.description,
            { chunkSize: options.chunkSize }
          );
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      data: processedData
    });
  } catch (error) {
    console.error('Error in data ingestion:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing with mock data
export async function GET() {
  try {
    // Process mock property
    const normalizedProperty = {
      ...mockProperty,
      size: dataIngestionService.convertToSquareFeet(mockProperty.size, mockProperty.area_unit)
    };
    
    // Sanitize and process the mock data
    const sanitizedDescription = mockProperty.description
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace HTML entities
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\[BAYUT_EXCLUSIVE\]/gi, '')
      .trim();
    
    // Create chunks
    const descriptionChunks = dataIngestionService.chunkText(sanitizedDescription, 500);
    
    return NextResponse.json({
      success: true,
      message: 'Sample processed property data',
      originalProperty: mockProperty,
      processedProperty: {
        ...mockProperty,
        description: sanitizedDescription,
        descriptionChunks
      },
      chunkCount: descriptionChunks.length
    });
  } catch (error) {
    console.error('Error generating sample data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate sample data' },
      { status: 500 }
    );
  }
} 