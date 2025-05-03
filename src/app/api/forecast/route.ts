import { NextResponse } from 'next/server';
import apiKeyService from '@/app/services/apiKeyService';

interface ForecastParams {
  prices: number[];
  dates: string[];
  periods: number;
  interval: 'day' | 'week' | 'month' | 'quarter' | 'year';
  confidence_level?: number;
  property_type?: string;
  location?: string;
}

interface ForecastPoint {
  date: string;
  value: number;
  lower_bound: number;
  upper_bound: number;
}

interface ForecastResult {
  forecast: ForecastPoint[];
  avg_growth_rate: number;
  annualized_roi: number;
  confidence_level: number;
  metadata?: {
    property_type?: string;
    location?: string;
    forecast_method: string;
    data_points_used: number;
  };
}

/**
 * Simple exponential smoothing forecast
 * This is a basic implementation. In a production environment, 
 * you would use a proper statistical package like Prophet, statsmodels, etc.
 */
function generateSimpleForecast(
  prices: number[],
  dates: string[],
  periods: number,
  interval: string,
  confidence: number = 0.95
): ForecastResult {
  // Ensure we have data to work with
  if (!prices.length || prices.length < 3) {
    throw new Error('Insufficient data points for forecasting');
  }
  
  if (prices.length !== dates.length) {
    throw new Error('Number of prices must match number of dates');
  }
  
  // Calculate average growth rate
  const growthRates: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const rate = (prices[i] - prices[i - 1]) / prices[i - 1];
    growthRates.push(rate);
  }
  
  const avgGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
  
  // Calculate standard deviation for confidence intervals
  const growthRateVariance = growthRates.reduce((sum, rate) => sum + Math.pow(rate - avgGrowthRate, 2), 0) / growthRates.length;
  const growthRateStdDev = Math.sqrt(growthRateVariance);
  
  // Z-score for confidence level (approximate)
  const zScore = confidence >= 0.99 ? 2.576 :
                 confidence >= 0.98 ? 2.326 :
                 confidence >= 0.95 ? 1.96 :
                 confidence >= 0.90 ? 1.645 :
                 confidence >= 0.85 ? 1.44 :
                 confidence >= 0.80 ? 1.282 : 1.0;
  
  // Calculate forecast points
  const forecast: ForecastPoint[] = [];
  const lastPrice = prices[prices.length - 1];
  const lastDate = new Date(dates[dates.length - 1]);
  
  // Calculate interval in milliseconds
  let intervalMs: number;
  switch (interval) {
    case 'day':
      intervalMs = 24 * 60 * 60 * 1000;
      break;
    case 'week':
      intervalMs = 7 * 24 * 60 * 60 * 1000;
      break;
    case 'month':
      intervalMs = 30 * 24 * 60 * 60 * 1000;
      break;
    case 'quarter':
      intervalMs = 90 * 24 * 60 * 60 * 1000;
      break;
    case 'year':
      intervalMs = 365 * 24 * 60 * 60 * 1000;
      break;
    default:
      intervalMs = 30 * 24 * 60 * 60 * 1000; // Default to month
  }
  
  let cumulativeGrowth = 1.0;
  let expectedPrice = lastPrice;
  
  for (let i = 0; i < periods; i++) {
    // Calculate next date
    const nextDate = new Date(lastDate.getTime() + (i + 1) * intervalMs);
    
    // Apply growth rate
    cumulativeGrowth *= (1 + avgGrowthRate);
    expectedPrice = lastPrice * cumulativeGrowth;
    
    // Calculate confidence intervals
    const varianceFactor = Math.sqrt(i + 1); // Variance increases with forecast distance
    const marginOfError = zScore * growthRateStdDev * lastPrice * varianceFactor;
    
    forecast.push({
      date: nextDate.toISOString().split('T')[0], // YYYY-MM-DD format
      value: Math.round(expectedPrice * 100) / 100,
      lower_bound: Math.round((expectedPrice - marginOfError) * 100) / 100,
      upper_bound: Math.round((expectedPrice + marginOfError) * 100) / 100
    });
  }
  
  // Calculate annualized ROI
  const periodsPerYear = {
    day: 365,
    week: 52,
    month: 12,
    quarter: 4,
    year: 1
  };
  
  const periodsInYear = periodsPerYear[interval as keyof typeof periodsPerYear] || 12;
  const annualizedRoi = Math.pow(1 + avgGrowthRate, periodsInYear) - 1;
  
  return {
    forecast,
    avg_growth_rate: Math.round(avgGrowthRate * 10000) / 10000, // 4 decimal places
    annualized_roi: Math.round(annualizedRoi * 10000) / 10000, // 4 decimal places
    confidence_level: confidence,
    metadata: {
      forecast_method: 'exponential_smoothing',
      data_points_used: prices.length
    }
  };
}

// POST endpoint for forecasting
export async function POST(request: Request) {
  try {
    // Parse request body
    const { 
      apiKey, 
      prices, 
      dates, 
      periods, 
      interval, 
      confidence_level,
      property_type,
      location
    }: ForecastParams & { apiKey: string } = await request.json();
    
    // Validate essential parameters
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      );
    }
    
    if (!prices || !Array.isArray(prices) || prices.length < 3) {
      return NextResponse.json(
        { success: false, error: 'At least 3 price points are required for forecasting' },
        { status: 400 }
      );
    }
    
    if (!dates || !Array.isArray(dates) || dates.length !== prices.length) {
      return NextResponse.json(
        { success: false, error: 'Number of dates must match number of prices' },
        { status: 400 }
      );
    }
    
    if (!periods || periods <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid number of periods' },
        { status: 400 }
      );
    }
    
    if (!interval) {
      return NextResponse.json(
        { success: false, error: 'Interval is required (day, week, month, quarter, year)' },
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
    
    // Generate forecast
    const forecast = generateSimpleForecast(
      prices,
      dates,
      periods,
      interval,
      confidence_level
    );
    
    // Add metadata
    if (property_type) {
      forecast.metadata = {
        ...forecast.metadata,
        property_type
      };
    }
    
    if (location) {
      forecast.metadata = {
        ...forecast.metadata,
        location
      };
    }
    
    // Return forecast result
    return NextResponse.json({
      success: true,
      forecast
    });
  } catch (error) {
    console.error('Error in forecast endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// Sample historical data for testing
const sampleData = {
  'downtown-apartment': {
    prices: [1550, 1580, 1620, 1680, 1710, 1750, 1790, 1830, 1850],
    dates: ['2022-01-01', '2022-04-01', '2022-07-01', '2022-10-01', '2023-01-01', '2023-04-01', '2023-07-01', '2023-10-01', '2024-01-01']
  },
  'marina-apartment': {
    prices: [1450, 1470, 1500, 1540, 1580, 1610, 1650, 1680, 1700],
    dates: ['2022-01-01', '2022-04-01', '2022-07-01', '2022-10-01', '2023-01-01', '2023-04-01', '2023-07-01', '2023-10-01', '2024-01-01']
  },
  'palm-villa': {
    prices: [2200, 2250, 2320, 2400, 2480, 2550, 2650, 2750, 2850],
    dates: ['2022-01-01', '2022-04-01', '2022-07-01', '2022-10-01', '2023-01-01', '2023-04-01', '2023-07-01', '2023-10-01', '2024-01-01']
  }
};

// GET method to return sample data and instructions
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const property = searchParams.get('property');
  
  if (property && sampleData[property as keyof typeof sampleData]) {
    return NextResponse.json({
      success: true,
      sample_data: sampleData[property as keyof typeof sampleData],
      instruction: 'Use this sample data with the POST endpoint to test the forecast service'
    });
  }
  
  return NextResponse.json({
    success: true,
    message: 'Forecast API is active',
    available_samples: Object.keys(sampleData),
    endpoints: [
      {
        name: 'Forecast',
        method: 'POST',
        description: 'Generates time-series forecasts for property prices'
      },
      {
        name: 'Sample Data',
        method: 'GET',
        description: 'Returns sample data for testing',
        example: '?property=downtown-apartment'
      }
    ],
    required_params: ['apiKey', 'prices', 'dates', 'periods', 'interval'],
    optional_params: ['confidence_level', 'property_type', 'location']
  });
} 