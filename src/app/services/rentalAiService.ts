import { RentalListing, RentalFilter } from './rentalApiService';
import apiKeyService from './apiKeyService';

export interface AIRentalResponse {
  success: boolean;
  data?: string;
  error?: string;
}

// Helper function to convert markdown to enhanced HTML (private to the module)
function convertMarkdownToEnhancedHtml(markdown: string): string {
  // Basic markdown conversion
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-dubai-blue-900 mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-dubai-blue-900 mt-8 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-dubai-blue-900 mt-8 mb-4">$1</h1>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
    
    // Bullet points
    .replace(/^\s*-\s*(.*$)/gim, '<li class="ml-4 mb-1 list-disc">$1</li>')
    .replace(/^\s*\d+\.\s*(.*$)/gim, '<li class="ml-4 mb-1 list-decimal">$1</li>')
    
    // Paragraphs
    .replace(/^\s*(?!<)(.+)(?!<\/)/gim, '<p class="mb-4 text-dubai-blue-700">$1</p>');
  
  // Wrap bullet points in ul
  html = html.replace(/<li class="ml-4 mb-1 list-disc">([\s\S]*?)(?=<\/li>[\s\S]*?(?:<li|$))/g, (match) => {
    return '<ul class="mb-4 pl-4">' + match;
  });
  
  // Add closing ul tags
  let openUl = (html.match(/<ul/g) || []).length;
  let closeUl = (html.match(/<\/ul>/g) || []).length;
  for (let i = 0; i < openUl - closeUl; i++) {
    html += '</ul>';
  }
  
  // Wrap ol elements
  html = html.replace(/<li class="ml-4 mb-1 list-decimal">([\s\S]*?)(?=<\/li>[\s\S]*?(?:<li|$))/g, (match) => {
    return '<ol class="mb-4 pl-4">' + match;
  });
  
  // Add closing ol tags
  let openOl = (html.match(/<ol/g) || []).length;
  let closeOl = (html.match(/<\/ol>/g) || []).length;
  for (let i = 0; i < openOl - closeOl; i++) {
    html += '</ol>';
  }
  
  // Highlight price information
  html = html.replace(/(\d+[\,\.]?\d*\s*AED)/gi, '<span class="font-bold text-dubai-blue-900">$1</span>');
  html = html.replace(/(average|median|price|rent|rental)/gi, '<span class="text-dubai-blue-800">$1</span>');
  
  // Add a div around sections with price information
  html = html.replace(/(<p[^>]*>[^<]*(price|rent|AED)[^<]*<\/p>)/gi, 
    '<div class="bg-dubai-blue-50 p-3 rounded-lg border border-dubai-blue-100 my-3">$1</div>');
  
  // Add summary box at the end
  html += `
    <div class="mt-6 pt-4 border-t border-dubai-blue-200 bg-gold-50 p-4 rounded-lg">
      <h3 class="text-lg font-bold text-dubai-blue-900 mb-2">Analysis Summary</h3>
      <p class="text-sm text-dubai-blue-700">
        This AI-powered analysis is based on current rental listings in ${markdown.includes('Dubai') ? 'Dubai' : 'this area'}.
        Actual prices and conditions may vary. Last updated: ${new Date().toLocaleDateString()}.
      </p>
    </div>
  `;
  
  return html;
}

// Service to fetch AI-powered rental market information
const rentalAiService = {
  // Get rental market information from OpenAI
  getRentalPriceInfo: async (
    area: string,
    propertyName: string | undefined,
    filters: RentalFilter
  ): Promise<AIRentalResponse> => {
    try {
      const apiKey = apiKeyService.getApiKey();
      
      if (!apiKey) {
        return {
          success: false,
          error: 'API key not configured. Please set up your OpenAI API key to use this feature.'
        };
      }
      
      // Construct the prompt for OpenAI
      let prompt = `I need accurate, up-to-date rental price information for properties in ${area}, Dubai. `;
      
      if (propertyName) {
        prompt += `Specifically, I'm looking for rental prices for "${propertyName}". `;
      }
      
      // Add filters to the prompt
      if (filters.propertyType) {
        prompt += `Property type: ${filters.propertyType}. `;
      }
      
      if (filters.bedrooms) {
        prompt += `Bedrooms: ${filters.bedrooms}. `;
      }
      
      if (filters.sizeMin || filters.sizeMax) {
        prompt += `Size range: ${filters.sizeMin || 'any'} to ${filters.sizeMax || 'any'} sqft. `;
      }
      
      if (filters.furnishing) {
        prompt += `Furnishing: ${filters.furnishing}. `;
      }
      
      prompt += `Please provide:
      1. Current average rental prices (in AED/year)
      2. Price ranges based on actual listings
      3. Trends in this area over the past 3-6 months
      4. Price comparison with similar properties in nearby areas
      
      Ensure all information is based on actual current rental market data, not estimates. Cite current rental prices from specific properties whenever possible.`;
      
      // Make the API call to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a Dubai real estate expert specializing in rental property analysis. 
              Provide accurate, detailed, and specific rental price information based on current market data.
              Use concrete figures, actual listings, and avoid vague statements or broad ranges when possible.
              Format your response with clear sections and bullet points for readability.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 750
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        return {
          success: false,
          error: `API error: ${errorData.error?.message || 'Unknown error'}`
        };
      }
      
      const data = await response.json();
      const rentalInfo = data.choices[0].message.content;
      
      return {
        success: true,
        data: rentalInfo
      };
    } catch (error) {
      console.error('Error fetching rental market information:', error);
      return {
        success: false,
        error: `Failed to fetch rental information: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
  
  // Get comprehensive market analysis from OpenAI
  getComprehensiveMarketAnalysis: async (
    area: string,
    propertyDetails: any
  ): Promise<AIRentalResponse> => {
    try {
      const apiKey = apiKeyService.getApiKey();
      
      if (!apiKey) {
        return {
          success: false,
          error: 'API key not configured. Please set up your OpenAI API key to use this feature.'
        };
      }
      
      // Construct detailed prompt for market analysis
      const prompt = `Provide a comprehensive rental market analysis for ${area}, Dubai with the following details:
      
      Area: ${area}
      Property Type: ${propertyDetails.propertyType || 'Any'}
      ${propertyDetails.bedrooms ? `Bedrooms: ${propertyDetails.bedrooms}` : ''}
      ${propertyDetails.size ? `Size: Approximately ${propertyDetails.size} sqft` : ''}
      
      Please include:
      1. Current market rental rates (AED/year) with specific examples from current listings
      2. Market trends over the past 6-12 months
      3. Supply and demand dynamics in this area
      4. Rental price comparison with neighboring areas
      5. Tenant demographics and preferences
      6. Projected future trends based on current market data
      
      Format the response in a structured way with clear sections and specific data points.`;
      
      // Make the API call to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a senior Dubai real estate analyst with expertise in rental market analysis.
              Provide accurate, data-driven rental market insights using current market information.
              Cite specific properties and prices when available. Format the response with clear headings and concise bullet points.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1200
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        return {
          success: false,
          error: `API error: ${errorData.error?.message || 'Unknown error'}`
        };
      }
      
      const data = await response.json();
      const analysisData = data.choices[0].message.content;
      
      return {
        success: true,
        data: analysisData
      };
    } catch (error) {
      console.error('Error fetching comprehensive market analysis:', error);
      return {
        success: false,
        error: `Failed to fetch analysis: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
  
  // Analyze rental listings and provide enhanced HTML output
  analyzeRentalData: async (
    area: string,
    listings: RentalListing[],
    apiKey: string
  ): Promise<string> => {
    try {
      // Check if we have a valid API key
      if (!apiKey) {
        throw new Error('API key is not configured.');
      }

      // Create analysis prompt
      const prompt = `Analyze the following rental market data for ${area} in Dubai. Provide insights on:
1. Current average prices based on property types and bedrooms
2. Price trends and recommendations
3. Best opportunities for different tenant profiles
4. Market comparison to other Dubai areas

Please format your response using markdown with clear headers, bullet points, and emphasis on important numbers or recommendations.

This is the rental data (${listings.length} listings):
${JSON.stringify(listings.slice(0, 50))}`;

      const model = 'gpt-3.5-turbo';
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${errorText}`);
      }

      const data = await response.json();
      const analysisText = data.choices[0]?.message?.content || 'No analysis available.';
      
      // Parse the markdown and convert to HTML with enhanced styling
      const convertedHtml = convertMarkdownToEnhancedHtml(analysisText);
      
      return convertedHtml;
    } catch (error) {
      console.error('Error analyzing rental data:', error);
      throw error;
    }
  }
};

export default rentalAiService; 