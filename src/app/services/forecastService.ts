import { PropertyForecast } from '../interfaces/property';

interface ForecastParameter {
  propertyId: string;
  location: string;
  currentPrice: number;
  propertyType: string;
  size: number;
  constructionYear: number;
  marketSentiment?: number; // 0-100 scale where 100 is extremely positive
}

// Mock forecast data for different property types
const mockForecasts: Record<string, PropertyForecast> = {
  'Apartment': {
    propertyId: 'property-001',
    currentPrice: 2500000,
    forecasts: [
      { period: '6months', predictedPrice: 2625000, confidence: 0.88 },
      { period: '1year', predictedPrice: 2750000, confidence: 0.82 },
      { period: '2years', predictedPrice: 3000000, confidence: 0.75 },
      { period: '3years', predictedPrice: 3250000, confidence: 0.68 },
      { period: '5years', predictedPrice: 3750000, confidence: 0.60 }
    ]
  },
  'Villa': {
    propertyId: 'property-002',
    currentPrice: 5000000,
    forecasts: [
      { period: '6months', predictedPrice: 5300000, confidence: 0.87 },
      { period: '1year', predictedPrice: 5600000, confidence: 0.81 },
      { period: '2years', predictedPrice: 6200000, confidence: 0.74 },
      { period: '3years', predictedPrice: 6800000, confidence: 0.67 },
      { period: '5years', predictedPrice: 8000000, confidence: 0.58 }
    ]
  },
  'Townhouse': {
    propertyId: 'property-003',
    currentPrice: 3500000,
    forecasts: [
      { period: '6months', predictedPrice: 3675000, confidence: 0.89 },
      { period: '1year', predictedPrice: 3850000, confidence: 0.83 },
      { period: '2years', predictedPrice: 4200000, confidence: 0.76 },
      { period: '3years', predictedPrice: 4550000, confidence: 0.69 },
      { period: '5years', predictedPrice: 5250000, confidence: 0.61 }
    ]
  },
  'Penthouse': {
    propertyId: 'property-004',
    currentPrice: 8000000,
    forecasts: [
      { period: '6months', predictedPrice: 8480000, confidence: 0.86 },
      { period: '1year', predictedPrice: 8960000, confidence: 0.80 },
      { period: '2years', predictedPrice: 9920000, confidence: 0.73 },
      { period: '3years', predictedPrice: 10880000, confidence: 0.66 },
      { period: '5years', predictedPrice: 12800000, confidence: 0.57 }
    ]
  }
};

// Location-based growth factors (multipliers for the base forecasts)
const locationFactors: Record<string, number> = {
  'Dubai Marina': 1.05,
  'Downtown Dubai': 1.08,
  'Palm Jumeirah': 1.12,
  'Business Bay': 1.03,
  'Jumeirah Beach Residence': 1.04,
  'Dubai Hills Estate': 1.06,
  'Arabian Ranches': 1.02
};

export const forecastService = {
  // Function to get price forecast for a property
  getPriceForecast: async (params: ForecastParameter): Promise<PropertyForecast> => {
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, this would use a machine learning model
      // For now, we'll use mock data based on property type and apply location factors
      
      // Get the base forecast for the property type
      const propertyType = params.propertyType || 'Apartment';
      const baseForecast = mockForecasts[propertyType] || mockForecasts['Apartment'];
      
      // Get the location factor (default to 1.0 if location not found)
      const location = params.location || 'Dubai Marina';
      const locationFactor = locationFactors[location] || 1.0;
      
      // Calculate custom forecast based on the current price, location factor, and market sentiment
      const marketSentimentFactor = params.marketSentiment ? (params.marketSentiment / 100) * 0.2 + 0.9 : 1.0;
      
      // Generate a custom forecast
      const customForecast: PropertyForecast = {
        propertyId: params.propertyId,
        currentPrice: params.currentPrice,
        forecasts: baseForecast.forecasts.map(forecast => {
          // Apply factors to the predicted price
          const adjustedPrice = params.currentPrice * 
            (forecast.predictedPrice / baseForecast.currentPrice) * 
            locationFactor * 
            marketSentimentFactor;
          
          return {
            period: forecast.period,
            predictedPrice: Math.round(adjustedPrice),
            confidence: forecast.confidence * 0.98 // Slightly reduce confidence for custom forecasts
          };
        })
      };
      
      return customForecast;
    } catch (error) {
      console.error('Error generating price forecast:', error);
      throw error;
    }
  },
  
  // Function to get comparative forecasts for different property types in a location
  getComparativeForecasts: async (location: string): Promise<Record<string, PropertyForecast>> => {
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get the location factor
      const locationFactor = locationFactors[location] || 1.0;
      
      // Create a forecast for each property type
      const comparativeForecasts: Record<string, PropertyForecast> = {};
      
      for (const propertyType in mockForecasts) {
        const baseForecast = mockForecasts[propertyType];
        
        // Apply location factor to the forecast
        comparativeForecasts[propertyType] = {
          propertyId: baseForecast.propertyId,
          currentPrice: baseForecast.currentPrice,
          forecasts: baseForecast.forecasts.map(forecast => {
            return {
              period: forecast.period,
              predictedPrice: Math.round(forecast.predictedPrice * locationFactor),
              confidence: forecast.confidence
            };
          })
        };
      }
      
      return comparativeForecasts;
    } catch (error) {
      console.error('Error generating comparative forecasts:', error);
      throw error;
    }
  },
  
  // Function to get forecast with infrastructure impact analysis
  getForecastWithInfrastructureImpact: async (
    propertyId: string, 
    location: string, 
    currentPrice: number, 
    infrastructureImpact: number
  ): Promise<PropertyForecast> => {
    try {
      // Get base forecast
      const forecast = await this.getPriceForecast({
        propertyId,
        location,
        currentPrice,
        propertyType: 'Apartment', // Default property type if not specified
        size: 0,
        constructionYear: 0
      });
      
      // Apply infrastructure impact to the forecast
      // Infrastructure impact is provided as a percentage (e.g. 5.2 means 5.2%)
      const impactFactor = 1 + (infrastructureImpact / 100);
      
      // Apply the impact to the forecast, with greater impact on longer-term forecasts
      const adjustedForecast: PropertyForecast = {
        propertyId,
        currentPrice,
        forecasts: forecast.forecasts.map(f => {
          // Apply multiplier based on forecast period
          let periodMultiplier = 1.0;
          switch (f.period) {
            case '6months': periodMultiplier = 0.2; break;
            case '1year': periodMultiplier = 0.4; break;
            case '2years': periodMultiplier = 0.7; break;
            case '3years': periodMultiplier = 0.9; break;
            case '5years': periodMultiplier = 1.0; break;
          }
          
          // Apply the impact factor with period-specific multiplier
          const adjustedImpact = 1 + ((impactFactor - 1) * periodMultiplier);
          
          return {
            period: f.period,
            predictedPrice: Math.round(f.predictedPrice * adjustedImpact),
            confidence: f.confidence * 0.95 // Reduce confidence due to additional variables
          };
        })
      };
      
      return adjustedForecast;
    } catch (error) {
      console.error('Error generating forecast with infrastructure impact:', error);
      throw error;
    }
  }
}; 