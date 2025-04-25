"use client";

import { useState } from 'react';
import { useForecastAnalysis } from '../hooks/useForecastAnalysis';
import { PropertyForecast } from '../interfaces/property';

const ForecastAnalysis: React.FC = () => {
  const {
    propertyId,
    location,
    currentPrice,
    propertyType,
    marketSentiment,
    isLoading,
    forecast,
    comparativeForecasts,
    infrastructureImpactForecast,
    nearbyProjects,
    error,
    setPropertyId,
    setLocation,
    setCurrentPrice,
    setPropertyType,
    setMarketSentiment,
    generateForecast,
    generateComparativeForecasts,
    generateInfrastructureImpactForecast
  } = useForecastAnalysis();
  
  const [showComparative, setShowComparative] = useState<boolean>(false);
  const [showInfrastructure, setShowInfrastructure] = useState<boolean>(false);
  
  // Handle price input change
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setCurrentPrice(0);
    } else {
      const parsedValue = parseInt(value, 10);
      if (!isNaN(parsedValue)) {
        setCurrentPrice(parsedValue);
      }
    }
  };

  // Generate forecast
  const handleGenerateForecast = () => {
    generateForecast();
  };
  
  // Generate comparative forecasts
  const handleGenerateComparativeForecasts = () => {
    setShowComparative(true);
    generateComparativeForecasts();
  };
  
  // Generate infrastructure impact forecasts
  const handleGenerateInfrastructureImpact = async () => {
    setShowInfrastructure(true);
    generateInfrastructureImpactForecast();
  };

  return (
    <div className="dashboard-container">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Dynamic Price Forecast</h1>
        <p className="text-gray-600">
          Generate price predictions based on property details, market conditions, and infrastructure impact.
        </p>
      </header>
      
      {/* Forecast Parameters */}
      <div className="mb-8 bg-green-50 rounded-lg p-6 border border-green-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Forecast Parameters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md bg-white hover-lift focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              placeholder="e.g., Dubai Marina"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="propertyId">
              Property ID
            </label>
            <input
              id="propertyId"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md bg-white hover-lift focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              placeholder="e.g., property-001"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="propertyType">
              Property Type
            </label>
            <select
              id="propertyType"
              className="w-full p-2 border border-gray-300 rounded-md bg-white hover-lift focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Penthouse">Penthouse</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="currentPrice">
              Current Price (AED)
            </label>
            <input
              id="currentPrice"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md bg-white hover-lift focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              placeholder="e.g., 2500000"
              value={currentPrice > 0 ? currentPrice.toString() : ''}
              onChange={handlePriceChange}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Market Sentiment: {marketSentiment}%
          </label>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Bearish (0%)</span>
            <input
              type="range"
              min="0"
              max="100"
              value={marketSentiment}
              onChange={(e) => setMarketSentiment(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <span className="text-sm text-gray-600">Bullish (100%)</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-primary hover-lift"
            onClick={handleGenerateForecast}
            disabled={isLoading || !location || !propertyId || currentPrice <= 0}
          >
            Generate Forecast
          </button>
          
          <button
            className="btn-secondary hover-lift"
            onClick={handleGenerateComparativeForecasts}
            disabled={isLoading || !location}
          >
            Compare Property Types
          </button>
          
          <button
            className="btn-secondary hover-lift"
            onClick={handleGenerateInfrastructureImpact}
            disabled={isLoading || !location || !propertyId || currentPrice <= 0}
          >
            Include Infrastructure Impact
          </button>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md border border-red-100">
          {error}
        </div>
      )}
      
      {/* Forecast Results */}
      {forecast && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Price Forecast</h2>
          <div className="bg-white rounded-lg shadow border border-green-100 p-6">
            <p className="mb-4 text-gray-700">
              <span className="font-medium">Property:</span> {propertyType} in {location}
            </p>
            <p className="mb-6 text-gray-700">
              <span className="font-medium">Current Price:</span> {formatCurrency(forecast.currentPrice)}
            </p>
            
            <div className="space-y-6">
              {forecast.forecasts.map((f, index) => (
                <div key={index} className="forecast-card">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">{formatPeriod(f.period)}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Predicted Price</p>
                      <p className="text-xl font-bold text-gray-800">{formatCurrency(f.predictedPrice)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Growth</p>
                      <p className="text-xl font-bold text-green-600">
                        +{(((f.predictedPrice - forecast.currentPrice) / forecast.currentPrice) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Confidence</p>
                      <p className="text-xl font-medium text-gray-800">{(f.confidence * 100).toFixed(0)}%</p>
                      <div className="forecast-bar-bg mt-1">
                        <div 
                          className="forecast-bar" 
                          style={{ width: `${f.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Comparative Forecasts */}
      {showComparative && comparativeForecasts && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Comparative Forecasts for {location}</h2>
          <div className="bg-white rounded-lg shadow border border-green-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(comparativeForecasts).map(([type, forecast]) => {
                const fiveYearForecast = forecast.forecasts.find(f => f.period === '5years');
                const growth = fiveYearForecast 
                  ? ((fiveYearForecast.predictedPrice - forecast.currentPrice) / forecast.currentPrice) * 100 
                  : 0;
                
                return (
                  <div key={type} className="forecast-card">
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">{type}</h3>
                    <p className="mb-2 text-gray-700">
                      <span className="font-medium">Current:</span> {formatCurrency(forecast.currentPrice)}
                    </p>
                    <p className="mb-2 text-gray-700">
                      <span className="font-medium">5 Year Forecast:</span> {formatCurrency(fiveYearForecast?.predictedPrice || 0)}
                    </p>
                    <p className="mb-4 text-green-600 font-semibold">
                      Growth: +{growth.toFixed(1)}%
                    </p>
                    <div className="forecast-bar-bg">
                      <div 
                        className="forecast-bar" 
                        style={{ width: `${Math.min(100, growth)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Infrastructure Impact */}
      {showInfrastructure && infrastructureImpactForecast && nearbyProjects && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Infrastructure Impact Analysis</h2>
          <div className="bg-white rounded-lg shadow border border-green-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Forecast with Infrastructure</h3>
                <p className="mb-2 text-gray-700">
                  <span className="font-medium">Current Price:</span> {formatCurrency(infrastructureImpactForecast.currentPrice)}
                </p>
                <div className="space-y-3">
                  {infrastructureImpactForecast.forecasts.map((f, index) => {
                    const growth = ((f.predictedPrice - infrastructureImpactForecast.currentPrice) / infrastructureImpactForecast.currentPrice) * 100;
                    
                    return (
                      <div key={index} className="forecast-card">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-gray-700">{formatPeriod(f.period)}</span>
                          <span className="text-green-600 font-semibold">+{growth.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>{formatCurrency(infrastructureImpactForecast.currentPrice)}</span>
                          <span>{formatCurrency(f.predictedPrice)}</span>
                        </div>
                        <div className="forecast-bar-bg mt-1">
                          <div 
                            className="forecast-bar" 
                            style={{ width: `${Math.min(100, growth)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Nearby Infrastructure Projects</h3>
                <div className="space-y-3">
                  {nearbyProjects.map((project) => (
                    <div key={project.id} className="infrastructure-card">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-800">{project.name}</span>
                        <span className="text-green-600 font-semibold">+{project.estimatedImpact}%</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {project.type.charAt(0).toUpperCase() + project.type.slice(1)} | 
                        Completion: {formatDate(project.completionDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for formatting
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatPeriod = (period: string): string => {
  switch (period) {
    case '6months': return '6 Months';
    case '1year': return '1 Year';
    case '2years': return '2 Years';
    case '3years': return '3 Years';
    case '5years': return '5 Years';
    default: return period;
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AE', { year: 'numeric', month: 'short' });
};

export default ForecastAnalysis; 