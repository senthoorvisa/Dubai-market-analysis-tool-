"use client";

import { useState, useEffect } from 'react';
import { useForecastAnalysis } from '../hooks/useForecastAnalysis';
import { PropertyForecast } from '../interfaces/property';
import { getMarketForecast } from '../services/openAiService';
import ApiKeyInput from './ApiKeyInput';
import apiKeyService from '../services/apiKeyService';

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
  const [timeframe, setTimeframe] = useState<string>('12 months');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean>(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format period for display
  const formatPeriod = (period: string) => {
    switch (period) {
      case '6months': return '6 Months';
      case '1year': return '1 Year';
      case '2years': return '2 Years';
      case '3years': return '3 Years';
      case '5years': return '5 Years';
      default: return period;
    }
  };
  
  useEffect(() => {
    // Check if API key is configured on component mount
    const hasApiKey = apiKeyService.isApiKeyConfigured();
    setIsApiKeyConfigured(hasApiKey);
  }, []);

  const handleApiKeySet = (success: boolean) => {
    setIsApiKeyConfigured(success);
    if (success) {
      setShowApiKeyInput(false);
    }
  };
  
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

  // Get AI-powered market forecast
  const handleGetAIForecast = async () => {
    if (!isApiKeyConfigured) {
      setShowApiKeyInput(true);
      setAiError('Please configure your OpenAI API key to use this feature');
      return;
    }
    
    setAiLoading(true);
    setAiError(null);
    
    try {
      const response = await getMarketForecast(timeframe);
      if (response.success && response.data) {
        setAiAnalysis(response.data);
      } else {
        throw new Error(response.error || 'Failed to get market forecast');
      }
    } catch (err) {
      let errorMessage = 'Failed to generate AI forecast. Please try again later.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setAiError(errorMessage);
      
      // If error is related to API key, show API key input
      if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        setIsApiKeyConfigured(false);
        setShowApiKeyInput(true);
      }
      
      console.error('Error generating AI forecast:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Format the AI analysis with line breaks
  const formatAnalysis = (text: string) => {
    if (!text) return [];
    return text.split('\n').map((line, index) => (
      <p key={index} className={`mb-2 ${line.trim().startsWith('#') ? 'font-bold text-lg mt-4' : ''}`}>
        {line}
      </p>
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Dubai Property Price Forecast</h2>
      
      {/* API Key Configuration */}
      {showApiKeyInput && (
        <div className="mb-6">
          <ApiKeyInput 
            onApiKeySet={handleApiKeySet}
            className="mb-4"
          />
          {isApiKeyConfigured && (
            <button
              onClick={() => setShowApiKeyInput(false)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Hide API Key Settings
            </button>
          )}
        </div>
      )}
      
      {!showApiKeyInput && !isApiKeyConfigured && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            You need to configure your OpenAI API key to access all forecasting features. 
            <button 
              onClick={() => setShowApiKeyInput(true)}
              className="ml-2 underline text-blue-600 hover:text-blue-800"
            >
              Configure API Key
            </button>
          </p>
        </div>
      )}

      <div className="mb-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Property Parameters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Property ID
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="Enter property ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Location
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Dubai Marina"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Current Price (AED)
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={currentPrice || ''}
              onChange={handlePriceChange}
              placeholder="e.g., 2500000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Property Type
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Office">Office</option>
              <option value="Retail">Retail</option>
            </select>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            onClick={handleGenerateForecast}
            disabled={isLoading || !location || !propertyId || currentPrice <= 0 || !isApiKeyConfigured}
          >
            Generate Forecast
          </button>
          
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50"
            onClick={handleGenerateComparativeForecasts}
            disabled={isLoading || !location || !isApiKeyConfigured}
          >
            Compare Property Types
          </button>
          
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 disabled:opacity-50"
            onClick={handleGenerateInfrastructureImpact}
            disabled={isLoading || !location || !propertyId || currentPrice <= 0 || !isApiKeyConfigured}
          >
            Include Infrastructure Impact
          </button>
        </div>
      </div>
      
      {/* AI-Powered Market Forecast */}
      <div className="mb-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">AI-Powered Market Forecast</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Timeframe
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="6 months">Next 6 Months</option>
              <option value="12 months">Next 12 Months</option>
              <option value="24 months">Next 24 Months</option>
              <option value="5 years">Next 5 Years</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
              onClick={handleGetAIForecast}
              disabled={aiLoading || !isApiKeyConfigured}
            >
              {aiLoading ? 'Generating...' : 'Get AI Forecast'}
            </button>
          </div>
        </div>
        
        {aiError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-100">
            {aiError}
          </div>
        )}
      </div>
      
      {/* AI Analysis Results */}
      {aiAnalysis && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow border border-blue-100 p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Market Forecast: Next {timeframe}
            </h3>
            <div className="prose prose-lg max-w-none">
              {formatAnalysis(aiAnalysis)}
            </div>
          </div>
        </div>
      )}
      
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
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">{formatPeriod(f.period)}</h3>
                  <div className="grid grid-cols-3 gap-4">
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
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div 
                          className="bg-green-600 h-2.5 rounded-full" 
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
                  <div key={type} className="border border-gray-200 rounded-lg p-4">
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
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
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
      {showInfrastructure && infrastructureImpactForecast && (
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
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-gray-700">{formatPeriod(f.period)}</span>
                          <span className="text-green-600 font-semibold">+{growth.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700">
                          <span>{formatCurrency(infrastructureImpactForecast.currentPrice)}</span>
                          <span>{formatCurrency(f.predictedPrice)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
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
                {nearbyProjects && nearbyProjects.length > 0 ? (
                  <div className="space-y-3">
                    {nearbyProjects.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-gray-700">{project.name}</span>
                          <span className="text-blue-600 font-semibold">Impact: {project.estimatedImpact}%</span>
                        </div>
                        <p className="text-sm text-gray-600">{project.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Completion: {project.estimatedCompletion}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No nearby infrastructure projects found.</p>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-gray-800 mb-1">Infrastructure Impact Analysis</h4>
              <p className="text-sm text-gray-700">
                Properties near major infrastructure developments typically see increased value growth compared to similar properties without such proximity. The impact is calculated based on project distance, scale, and completion timeline.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastAnalysis; 