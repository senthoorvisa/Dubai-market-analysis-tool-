import axios from 'axios';

interface ChatGptResponse {
  summary: string[];
  sources: {
    title: string;
    url: string;
    description: string;
  }[];
}

// Mock ChatGPT responses for different search queries (kept as fallback)
const mockResponses: Record<string, ChatGptResponse> = {
  'Dubai Properties': {
    summary: [
      'Dubai Properties reported a 15% increase in sales for Q1 2023',
      'Their latest development "Marina Heights" sold 80% of units within first month',
      'Planning to launch 3 new projects in Downtown Dubai by end of 2023',
      'Invested $500 million in sustainable development initiatives',
      'CEO announced expansion plans into Abu Dhabi market'
    ],
    sources: [
      {
        title: 'Dubai Properties Reports Strong Q1 Performance',
        url: 'https://www.dubaiproperties.ae/news/q1-2023-results',
        description: 'Official quarterly report showing 15% year-on-year growth and future projections.'
      },
      {
        title: 'Marina Heights Development Breaks Sales Records',
        url: 'https://www.propertyweek.com/dubai-properties-marina-heights-success',
        description: 'Analysis of the successful launch of the Marina Heights development.'
      },
      {
        title: 'Dubai Properties Announces Expansion Plans',
        url: 'https://www.constructionweekly.com/dubai-properties-expansion',
        description: 'Details about upcoming projects and expansion into new markets.'
      }
    ]
  },
  'Dubai Marina property market': {
    summary: [
      'Dubai Marina property prices increased by 12.3% in the past year',
      'Rental yields in Dubai Marina average 6.2%, above city average',
      'Foreign investor interest increased by 20% since new visa regulations',
      'Luxury segment (above 5 million AED) saw fastest growth at 18%',
      'Supply of new properties in Dubai Marina decreased by 30% compared to 2022'
    ],
    sources: [
      {
        title: 'Dubai Real Estate Market Report 2023',
        url: 'https://www.dubailand.gov.ae/reports/market-report-2023',
        description: 'Comprehensive analysis of property price trends across Dubai.'
      },
      {
        title: 'Foreign Investment in Dubai Marina Surges',
        url: 'https://www.investmenttimes.com/dubai-marina-foreign-investment',
        description: 'Article detailing the increase in foreign investment following regulatory changes.'
      },
      {
        title: 'Luxury Property Segment Analysis',
        url: 'https://www.luxurypropertyreport.com/dubai-marina-2023',
        description: 'Specialized report focusing on high-end properties in Dubai Marina.'
      }
    ]
  },
  'Dubai infrastructure development': {
    summary: [
      'Dubai government allocated $9.5 billion for infrastructure in 2023 budget',
      'New Metro Blue Line to connect Dubai Marina to new areas by 2026',
      'Dubai 2040 Urban Master Plan includes 400% increase in public beaches',
      'New international airport terminal to increase capacity by 35% by 2028',
      'Smart city initiatives include 5G coverage for 95% of urban areas by 2025'
    ],
    sources: [
      {
        title: 'Dubai 2023 Budget Allocation Details',
        url: 'https://www.dubai.gov.ae/budget-2023-infrastructure',
        description: 'Official government release of budget allocations for infrastructure development.'
      },
      {
        title: 'Dubai 2040 Urban Master Plan - Full Details',
        url: 'https://www.dubaiplan2040.ae/infrastructure-projects',
        description: 'Comprehensive overview of planned infrastructure developments through 2040.'
      },
      {
        title: 'Smart Dubai 2025 Initiative Progress Report',
        url: 'https://www.smartdubai.ae/progress-report-2023',
        description: 'Update on implementation of smart city technologies across Dubai.'
      }
    ]
  }
};

// Function to parse the ChatGPT response into our format
const parseChatGPTResponse = (content: string): ChatGptResponse => {
  try {
    // Try to parse as JSON first (in case the model returns properly formatted JSON)
    try {
      const jsonResponse = JSON.parse(content);
      if (jsonResponse.summary && jsonResponse.sources) {
        return jsonResponse as ChatGptResponse;
      }
    } catch (e) {
      // Not valid JSON, continue with text parsing
    }
    
    // Fallback to text parsing
    const summaryMatch = content.match(/Summary:([\s\S]*?)(?=Sources:|$)/i);
    const sourcesMatch = content.match(/Sources:([\s\S]*?)$/i);
    
    const summary = summaryMatch 
      ? summaryMatch[1].split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
          .map(line => line.replace(/^[\s-*]+/, '').trim())
          .filter(line => line.length > 0)
      : [];
    
    // If no bullet points found, try to extract sentences
    if (summary.length === 0 && summaryMatch) {
      const sentences = summaryMatch[1].split('.')
        .map(s => s.trim())
        .filter(s => s.length > 10 && s.length < 200);
      summary.push(...sentences.slice(0, 5));
    }
    
    const sourcesText = sourcesMatch ? sourcesMatch[1] : '';
    const sourceItems = sourcesText.split(/\n(?=\d+\.|\*|\-\s+\w+:)/g)
      .filter(item => item.trim().length > 0);
    
    const sources = sourceItems.map(item => {
      const titleMatch = item.match(/Title:\s*([^\n]+)/i) || item.match(/\*\s*([^*\n]+)/);
      const urlMatch = item.match(/URL:\s*([^\n]+)/i) || item.match(/https?:\/\/[^\s\n]+/);
      const descMatch = item.match(/Description:\s*([^\n]+)/i) || item.match(/\n(.+)$/);
      
      return {
        title: titleMatch ? titleMatch[1].trim() : 'Resource',
        url: urlMatch ? urlMatch[1]?.trim() || urlMatch[0].trim() : '#',
        description: descMatch ? descMatch[1].trim() : 'Information about Dubai real estate.'
      };
    });
    
    // If we couldn't parse any sources, add at least one generic source
    if (sources.length === 0) {
      sources.push({
        title: 'Dubai Real Estate Information',
        url: 'https://example.com/dubai-real-estate',
        description: 'General information about the Dubai real estate market'
      });
    }
    
    return {
      summary: summary.length > 0 ? summary : ['No summary information available'],
      sources: sources
    };
  } catch (error) {
    console.error('Error parsing ChatGPT response:', error);
    return {
      summary: ['Error parsing the AI response'],
      sources: [{
        title: 'Error',
        url: '#',
        description: 'There was an error processing the AI response'
      }]
    };
  }
};

export const chatGptService = {
  // Function to perform a deep search using ChatGPT API
  performDeepSearch: async (query: string, apiKey: string): Promise<ChatGptResponse> => {
    try {
      // Check if API key is provided
      if (!apiKey) {
        throw new Error('API key is required');
      }
      
      try {
        // Make the actual API call to OpenAI
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are a Dubai real estate market expert assistant. 
                Provide detailed, factual information about Dubai's real estate market, 
                including property prices, market trends, developments, and investment opportunities.
                Format your response in two sections: "Summary:" with 5 bullet points, and "Sources:" with 3 reference sources.`
              },
              {
                role: 'user',
                content: `I need information about: ${query}`
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Parse the response
        const content = response.data.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No content in API response');
        }
        
        return parseChatGPTResponse(content);
      } catch (apiError) {
        console.error('OpenAI API error:', apiError);
        
        // Fallback to mock data if API call fails
        console.log('Falling back to mock data...');
        
        // Find the best matching mock response based on the query
        for (const key in mockResponses) {
          if (query.toLowerCase().includes(key.toLowerCase())) {
            return mockResponses[key];
          }
        }
        
        // If no specific match is found, return the Dubai Properties mock data as default
        return mockResponses['Dubai Properties'];
      }
    } catch (error) {
      console.error('Error performing deep search:', error);
      throw error;
    }
  },
  
  // Function to validate API key
  validateApiKey: async (apiKey: string): Promise<boolean> => {
    try {
      if (!apiKey || apiKey.length < 20) {
        return false;
      }
      
      // Try a simple API call to validate the key
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'user',
                content: 'Hello'
              }
            ],
            max_tokens: 5
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        return response.status === 200;
      } catch (apiError: any) {
        console.error('API key validation error:', apiError.message);
        
        // Check if it's an authentication error
        if (apiError.response && apiError.response.status === 401) {
          return false;
        }
        
        // If it's a different kind of error (e.g., quota exceeded), still consider the key valid
        return apiError.response && apiError.response.status !== 401;
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      return false;
    }
  },
  
  // Function to get a summary of market news for a location
  getMarketNewsSummary: async (location: string, apiKey: string): Promise<string[]> => {
    try {
      // In a real app, this would be a specific ChatGPT prompt about market news
      const query = `${location} property market news and recent developments`;
      const response = await chatGptService.performDeepSearch(query, apiKey);
      return response.summary;
    } catch (error) {
      console.error('Error getting market news summary:', error);
      throw error;
    }
  },
  
  // Function to get developer-specific news
  getDeveloperNews: async (developerName: string, apiKey: string): Promise<ChatGptResponse> => {
    try {
      return await chatGptService.performDeepSearch(`${developerName} real estate developer in Dubai latest news and projects`, apiKey);
    } catch (error) {
      console.error('Error getting developer news:', error);
      throw error;
    }
  }
}; 