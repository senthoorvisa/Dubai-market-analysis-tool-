import { NextResponse } from 'next/server';
import OpenAIClient from '@/app/services/openAiClient';
import { functionSchemas, promptTemplates, createMessagesFromTemplate } from '@/app/services/promptTemplates';
import apiKeyService from '@/app/services/apiKeyService';

// Mock vector store retrieval function - in a real app, this would connect to a vector database
async function retrieveRelevantChunks(query: string, location?: string, propertyType?: string): Promise<string[]> {
  // This is a placeholder - in a real application, you would query a vector store
  return [
    `Dubai property market update (Jun 2023): Average price for ${propertyType || 'properties'} in ${location || 'Dubai'} is AED 1,350 per sqft, showing 8.2% increase YoY. Transaction volume increased by 34% compared to same period last year.`,
    `Recent sales data (Jul 2023): ${location || 'Dubai'} saw 128 transactions for ${propertyType || 'properties'} with an average price of AED ${location === 'Downtown Dubai' ? '1,850' : '1,400'} per sqft. High-end properties showed stronger appreciation at 12.3% YoY.`,
    `Rental yield analysis (Q2 2023): ${propertyType || 'Properties'} in ${location || 'Dubai'} currently generate 6.8% annual rental yield on average. Studio and 1-bedroom units provide higher yields (7.2-8.5%) compared to larger units.`,
    `Market forecast (Q3-Q4 2023): Experts predict continued price growth of 5-7% for ${propertyType || 'properties'} in ${location || 'Dubai'} through end of year, with premium areas like ${location || 'Palm Jumeirah, Downtown Dubai'} potentially seeing 9-10% appreciation.`
  ];
}

// Function to handle potential function calling response from OpenAI
async function handleFunctionCalling(
  functionCall: any,
  location?: string,
  propertyType?: string
): Promise<any> {
  try {
    if (!functionCall || !functionCall.name) return null;
    
    const functionName = functionCall.name;
    let functionArgs = {};
    
    try {
      if (functionCall.arguments) {
        functionArgs = JSON.parse(functionCall.arguments);
      }
    } catch (e) {
      console.error('Error parsing function arguments:', e);
      return { error: 'Invalid function arguments' };
    }
    
    // Handle the different function calls
    switch (functionName) {
      case 'generate_chart':
        // This would connect to a chart generation service
        return {
          function: functionName,
          result: {
            chart_url: 'https://example.com/charts/dubai-property-trends.png',
            alt_text: `Chart showing property price trends for ${propertyType || 'properties'} in ${location || 'Dubai'}`
          }
        };
        
      case 'forecast_time_series':
        // This would normally call a forecasting service or library
        const forecastData = {
          forecast: [
            { date: '2023-10-01', value: 1450, lower_bound: 1420, upper_bound: 1480 },
            { date: '2023-11-01', value: 1465, lower_bound: 1430, upper_bound: 1500 },
            { date: '2023-12-01', value: 1490, lower_bound: 1450, upper_bound: 1530 },
            { date: '2024-01-01', value: 1510, lower_bound: 1460, upper_bound: 1560 },
            { date: '2024-02-01', value: 1525, lower_bound: 1470, upper_bound: 1580 },
            { date: '2024-03-01', value: 1550, lower_bound: 1490, upper_bound: 1610 }
          ],
          avg_growth_rate: 0.0138, // 1.38% monthly
          annualized_roi: 0.0934, // 9.34% yearly
          confidence_level: functionArgs.confidence_level || 0.95
        };
        
        return {
          function: functionName,
          result: forecastData
        };
        
      case 'format_table':
        // Return a markdown table based on the data
        const { data, headers } = functionArgs;
        if (!data || !Array.isArray(data)) {
          return { error: 'Invalid data for table formatting' };
        }
        
        // Create markdown table
        let markdownTable = '';
        
        // Add headers if provided
        if (headers && Array.isArray(headers)) {
          markdownTable += '| ' + headers.join(' | ') + ' |\n';
          markdownTable += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
        } else if (data.length > 0) {
          // Generate headers from first data item
          const autoHeaders = Object.keys(data[0]);
          markdownTable += '| ' + autoHeaders.join(' | ') + ' |\n';
          markdownTable += '| ' + autoHeaders.map(() => '---').join(' | ') + ' |\n';
        }
        
        // Add data rows
        for (const row of data) {
          const rowValues = Object.values(row);
          markdownTable += '| ' + rowValues.join(' | ') + ' |\n';
        }
        
        return {
          function: functionName,
          result: {
            markdown_table: markdownTable
          }
        };
        
      case 'translate_text':
        // This would call a translation service or use OpenAI
        const { text, target_language } = functionArgs;
        let translatedText = text;
        
        // For demo purposes, we'll just append a notice
        if (target_language === 'ar') {
          translatedText = `[Arabic Translation] ${text}`;
        } else if (target_language === 'en') {
          translatedText = `[English Translation] ${text}`;
        }
        
        return {
          function: functionName,
          result: {
            translated_text: translatedText,
            source_language: target_language === 'ar' ? 'en' : 'ar',
            target_language
          }
        };
        
      case 'extract_key_metrics':
        // Return key metrics based on property criteria
        return {
          function: functionName,
          result: {
            property_type: functionArgs.property_type || propertyType || 'Apartment',
            location: functionArgs.location || location || 'Dubai',
            metrics: [
              {
                name: 'Average Price',
                value: location === 'Downtown Dubai' ? 1850 : 1400,
                unit: 'AED/sqft',
                trend: 'up'
              },
              {
                name: 'Annual Yield',
                value: 6.8,
                unit: '%',
                trend: 'stable'
              },
              {
                name: 'YoY Appreciation',
                value: 8.2,
                unit: '%',
                trend: 'up'
              },
              {
                name: 'Avg. Days on Market',
                value: location === 'Downtown Dubai' ? 45 : 60,
                unit: 'days',
                trend: 'down'
              }
            ]
          }
        };
        
      default:
        return {
          error: `Unknown function: ${functionName}`
        };
    }
  } catch (error) {
    console.error('Error handling function call:', error);
    return {
      error: 'Error executing function call',
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

// Main API route handler
export async function POST(request: Request) {
  try {
    const { apiKey, query, location, propertyType, analysisType, startDate, endDate } = await request.json();
    
    // Validate essential parameters
    if (!apiKey || !query) {
      return NextResponse.json(
        { success: false, error: 'API key and query are required' },
        { status: 400 }
      );
    }
    
    // Set the API key securely
    if (!apiKeyService.secureSetApiKey(apiKey)) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key format' },
        { status: 400 }
      );
    }
    
    // Create OpenAI client
    const openAIClient = new OpenAIClient(apiKey, {
      maxRetries: 2,
      telemetryEnabled: true
    });
    
    // Retrieve relevant documents from vector store
    console.log(`Retrieving relevant chunks for query: ${query}`);
    const retrievedChunks = await retrieveRelevantChunks(query, location, propertyType);
    const chunksText = retrievedChunks.join('\n\n');
    
    // Determine which prompt template to use
    let promptTemplate;
    switch (analysisType) {
      case 'market-overview':
        promptTemplate = promptTemplates.marketOverview;
        break;
      case 'appreciation-forecast':
        promptTemplate = promptTemplates.appreciationForecast;
        break;
      case 'property-analysis':
        promptTemplate = promptTemplates.propertyAnalysis;
        break;
      case 'developer-analysis':
        promptTemplate = promptTemplates.developerAnalysis;
        break;
      case 'neighborhood-analysis':
        promptTemplate = promptTemplates.neighborhoodAnalysis;
        break;
      default:
        // Default to market overview
        promptTemplate = promptTemplates.marketOverview;
    }
    
    // Create messages from template
    const messages = createMessagesFromTemplate(promptTemplate, {
      retrieved_chunks: chunksText,
      property_data: chunksText,
      developer_data: chunksText,
      neighborhood_data: chunksText,
      start_date: startDate || '2023-01-01',
      end_date: endDate || '2023-09-30'
    });
    
    // Make OpenAI request with function calling
    const completion = await openAIClient.createChatCompletion({
      model: 'gpt-4',
      messages,
      functions: functionSchemas,
      function_call: 'auto',
      temperature: 0.5
    });
    
    // Get the assistant's response
    const assistantResponse = completion.choices[0]?.message;
    
    // Handle potential function calling
    let functionCallResult = null;
    if (assistantResponse?.function_call) {
      functionCallResult = await handleFunctionCalling(
        assistantResponse.function_call,
        location,
        propertyType
      );
    }
    
    // Return the results
    return NextResponse.json({
      success: true,
      analysis: assistantResponse?.content || '',
      function_call: functionCallResult,
      usage: completion.usage,
      model: completion.model,
      retrieved_chunks: retrievedChunks.length
    });
  } catch (error) {
    console.error('Error in analysis endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// GET method for testing/health check
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Analysis API is active',
    endpoints: [
      {
        name: 'Analyze',
        method: 'POST',
        description: 'Analyzes real estate data with RAG and returns insights'
      }
    ],
    required_params: ['apiKey', 'query'],
    optional_params: ['location', 'propertyType', 'analysisType', 'startDate', 'endDate']
  });
} 