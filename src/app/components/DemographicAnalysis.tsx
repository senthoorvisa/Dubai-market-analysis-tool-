"use client";

import { useState, useEffect } from 'react';
import { useDemographicAnalysis } from '../hooks/useDemographicAnalysis';
import { DemographicData, InfrastructureProject } from '../interfaces/demographics';
import { getDemographicInfo } from '../services/openAiService';
import ApiKeyInput from './ApiKeyInput';
import apiKeyService from '../services/apiKeyService';
import EnhancedDemographicDisplay from './EnhancedDemographicDisplay';

const DemographicAnalysis: React.FC = () => {
  const {
    location,
    isLoading,
    demographicData,
    infrastructureAnalysis,
    wealthComparison,
    marketNews,
    error,
    setLocation,
    setApiKey,
    fetchDemographicData,
    fetchInfrastructureAnalysis,
    fetchWealthComparison,
    fetchMarketNews
  } = useDemographicAnalysis();

  const [localApiKey, setLocalApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  useEffect(() => {
    // Check if API key is configured on component mount
    const hasApiKey = apiKeyService.isApiKeyConfigured();
    setIsApiKeyConfigured(hasApiKey);
  }, []);

  const handleApiKeySet = (success: boolean) => {
    setIsApiKeyConfigured(success);
    if (success) {
      setShowApiKeyInput(false);
      // Update the hook's API key
      setApiKey(apiKeyService.getStoredApiKey() || '');
    }
  };

  // Handle search button click
  const handleSearch = () => {
    if (!location.trim()) {
      return;
    }

    fetchDemographicData();
    fetchInfrastructureAnalysis();
    
    // Also get AI analysis if API key is configured
    if (isApiKeyConfigured) {
      fetchAIDemographics();
    }
  };

  // Handle API key submission
  const handleApiKeySubmit = () => {
    setApiKey(localApiKey);
    fetchMarketNews();
  };

  // Handle wealth comparison fetch
  const handleFetchWealthComparison = () => {
    fetchWealthComparison();
  };

  // Get AI-powered demographic analysis
  const fetchAIDemographics = async () => {
    if (!location.trim()) {
      setAiError('Location is required');
      return;
    }
    
    if (!isApiKeyConfigured) {
      setShowApiKeyInput(true);
      setAiError('Please configure your OpenAI API key to use this feature');
      return;
    }
    
    setAiLoading(true);
    setAiError(null);
    
    try {
      const response = await getDemographicInfo(location);
      if (response.success && response.data) {
        setAiAnalysis(response.data);
      } else {
        throw new Error(response.error || 'Failed to get demographic information');
      }
    } catch (err) {
      let errorMessage = 'Failed to generate AI analysis. Please try again later.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setAiError(errorMessage);
      
      // If error is related to API key, show API key input
      if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        setIsApiKeyConfigured(false);
        setShowApiKeyInput(true);
      }
      
      console.error('Error generating AI demographic analysis:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Demographic & Infrastructure Analysis</h2>

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
            <span>
              <strong>API Key Required:</strong> You must configure your OpenAI API key to access real-time demographic analysis. 
              This app uses OpenAI's GPT-4 to provide accurate, up-to-date information about Dubai locations.
            </span>
            <button 
              onClick={() => setShowApiKeyInput(true)}
              className="ml-2 underline text-blue-600 hover:text-blue-800 font-bold"
            >
              Configure API Key
            </button>
          </p>
        </div>
      )}

      {/* Search Form */}
      <div className="mb-8 bg-neutral-50 rounded-lg p-4 border border-neutral-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500"
              placeholder="e.g., Dubai Marina, Downtown Dubai"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              className="w-full md:w-auto px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-opacity-50 disabled:opacity-50"
              onClick={handleSearch}
              disabled={isLoading || aiLoading || !location.trim()}
            >
              {isLoading || aiLoading ? 'Loading...' : 'Analyze Demographics'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {(error || aiError) && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md border border-red-200">
          {error || aiError}
        </div>
      )}

      {/* AI Analysis */}
      {aiAnalysis && (
        <div className="mb-8">
          <EnhancedDemographicDisplay location={location} analysis={aiAnalysis} />
        </div>
      )}

      {/* Results Section */}
      {demographicData && (
        <div>
          {/* Demographic Overview */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Demographic Overview: {demographicData.location}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h4 className="font-medium mb-2 text-gray-800">Population Statistics</h4>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">Total Population:</span>{' '}
                    {demographicData.populationStats.total.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Year:</span> {demographicData.populationStats.year}
                  </p>
                  <p>
                    <span className="font-medium">Growth Rate:</span>{' '}
                    <span className="text-neutral-600">{demographicData.populationStats.growthRate}%</span>
                  </p>
                  <p>
                    <span className="font-medium">Population Density:</span>{' '}
                    {demographicData.populationStats.density.toLocaleString()}/km²
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h4 className="font-medium mb-2 text-gray-800">Age Distribution</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Under 18:</span>
                    <div className="flex-grow mx-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${demographicData.ageDistribution.under18}%` }}></div>
                      </div>
                    </div>
                    <span>{demographicData.ageDistribution.under18}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">18-35:</span>
                    <div className="flex-grow mx-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${demographicData.ageDistribution.age18to35}%` }}></div>
                      </div>
                    </div>
                    <span>{demographicData.ageDistribution.age18to35}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">36-50:</span>
                    <div className="flex-grow mx-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${demographicData.ageDistribution.age36to50}%` }}></div>
                      </div>
                    </div>
                    <span>{demographicData.ageDistribution.age36to50}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">51+:</span>
                    <div className="flex-grow mx-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(demographicData.ageDistribution.age51to65 + demographicData.ageDistribution.above65)}%` }}></div>
                      </div>
                    </div>
                    <span>{(demographicData.ageDistribution.age51to65 + demographicData.ageDistribution.above65)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Section (if available) */}
          {infrastructureAnalysis && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Infrastructure Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Projects */}
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <h4 className="font-medium mb-3 text-gray-800">Major Infrastructure Projects</h4>
                  
                  <div className="space-y-3">
                    {infrastructureAnalysis.projects && infrastructureAnalysis.projects.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-gray-800">{project.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{project.description}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Completion: {project.estimatedCompletion}</span>
                          <span>Impact: <span className="text-green-600">+{project.estimatedImpact}%</span></span>
                        </div>
                      </div>
                    ))}
                    {!infrastructureAnalysis.projects && (
                      <p className="text-gray-500 text-sm">Project data not available for this location.</p>
                    )}
                  </div>
                </div>
                
                {/* Transportation - only show if there's transportation data */}
                {infrastructureAnalysis.transportation && infrastructureAnalysis.transportation.length > 0 ? (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <h4 className="font-medium mb-3 text-gray-800">Transportation & Connectivity</h4>
                    
                    <div className="space-y-3">
                      {infrastructureAnalysis.transportation.map((item, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className={`p-1 rounded-full ${
                            item.type === 'Metro' ? 'bg-red-100 text-red-800' :
                            item.type === 'Bus' ? 'bg-blue-100 text-blue-800' :
                            item.type === 'Road' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l4-4m0 0l4 4m-4-4v18" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              
              {/* Urban Facilities */}
              {infrastructureAnalysis.urbanFacilities && infrastructureAnalysis.urbanFacilities.length > 0 ? (
                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <h4 className="font-medium mb-3 text-gray-800">Urban Facilities</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {infrastructureAnalysis.urbanFacilities.map((facility, index) => (
                      <div key={index} className="text-center">
                        <div className="flex items-center justify-center bg-gray-100 rounded-full w-12 h-12 mx-auto mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                        <p className="font-medium text-sm text-gray-800">{facility.type}</p>
                        <p className="text-xs text-gray-600">{facility.count} within 3km</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Urban facilities data will be loaded when you search with an API key.</p>
              )}
            </div>
          )}

          {/* Market News Section */}
          {isApiKeyConfigured && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-semibold text-gray-800">Market News & Updates</h3>
                <button
                  className="text-sm text-green-600 hover:underline focus:outline-none"
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                >
                  {showApiKeyInput ? 'Hide API Settings' : 'Configure API'}
                </button>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                {marketNews && marketNews.length > 0 ? (
                  <div className="space-y-3">
                    {marketNews.map((news, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-3 py-1">
                        <p className="text-gray-800">{news}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">Click "Analyze Demographics" to fetch latest market news for this location.</p>
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
                      onClick={fetchMarketNews}
                      disabled={isLoading || !location.trim() || !isApiKeyConfigured}
                    >
                      Fetch News
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DemographicAnalysis; 