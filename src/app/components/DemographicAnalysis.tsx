"use client";

import { useState, useEffect } from 'react';
import { useDemographicAnalysis } from '../hooks/useDemographicAnalysis';
import { DemographicData, InfrastructureProject } from '../interfaces/demographics';
import { getDemographicAnalysis as getGeminiDemographicAnalysis } from '../services/geminiService';
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
    
    // Check for NEXT_PUBLIC_GEMINI_API_KEY directly
    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!geminiApiKey) {
      setAiError('Gemini API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment.');
      setIsApiKeyConfigured(false); // Reflect that the required key is missing
      // setShowApiKeyInput(true); // Optionally show a generic API key input if you have one, but error is more specific
      return;
    }
    setIsApiKeyConfigured(true); // Key is present
    
    setAiLoading(true);
    setAiError(null);
    setAiAnalysis(null); // Clear previous analysis
    
    try {
      // Call the new Gemini service function
      const response = await getGeminiDemographicAnalysis(location);
      if (response.success && response.data) {
        setAiAnalysis(response.data);
      } else {
        // Gemini service already checks for API key, but if other error occurs:
        const message = response.error || 'Failed to get demographic information from Gemini service.';
        setAiError(message);
        if (message.toLowerCase().includes('api key')) {
          setIsApiKeyConfigured(false);
        }
      }
    } catch (err) {
      let errorMessage = 'Failed to generate AI analysis. Please try again later.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setAiError(errorMessage);
      if (errorMessage.toLowerCase().includes('api key')) {
        setIsApiKeyConfigured(false);
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
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Infrastructure Projects</h3>
              {infrastructureAnalysis.projects && infrastructureAnalysis.projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {infrastructureAnalysis.projects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <h4 className="font-medium mb-2 text-gray-800">{project.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">Type: {project.type}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        Status: 
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${project.status === 'completed' ? 'bg-green-100 text-green-800' : project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mb-1">Completion: {project.completionDate}</p>
                      <p className="text-sm text-gray-600">Impact: {project.estimatedImpact}%</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No major infrastructure projects listed for this location or data not available.</p>
              )}
            </div>
          )}

          {/* Transportation - Re-evaluate based on data structure */}
          {infrastructureAnalysis && infrastructureAnalysis.transportation ? (
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-6">
              <h4 className="font-medium mb-3 text-gray-800">Transportation & Connectivity</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>Metro Access: {infrastructureAnalysis.transportation.metro ? 'Yes' : 'No'}</p>
                <p>Bus Network: {infrastructureAnalysis.transportation.bus ? 'Yes' : 'No'}</p>
                <p>Tram Availability: {infrastructureAnalysis.transportation.tram ? 'Yes' : 'No'}</p>
                <p>Water Taxi: {infrastructureAnalysis.transportation.waterTaxi ? 'Yes' : 'No'}</p>
                <p>Walk Score: {infrastructureAnalysis.transportation.walkScore !== undefined ? `${infrastructureAnalysis.transportation.walkScore}/100` : 'N/A'}</p>
              </div>
            </div>
          ) : infrastructureAnalysis && !infrastructureAnalysis.transportation ? (
             <p className="text-gray-500 text-sm mb-6">Transportation data not available for this location.</p>
          ) : null}
          
          {/* Urban Facilities - Conditionally render or provide placeholder */}
          {infrastructureAnalysis && (infrastructureAnalysis as any).urbanFacilities && (infrastructureAnalysis as any).urbanFacilities.length > 0 ? (
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <h4 className="font-medium mb-3 text-gray-800">Urban Facilities</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {(infrastructureAnalysis as any).urbanFacilities.map((facility: { type: string; count: number }, index: number) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center bg-gray-100 rounded-full w-12 h-12 mx-auto mb-2">
                      {/* Placeholder Icon - replace with dynamic icons if available */}
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
          ) : infrastructureAnalysis && !(infrastructureAnalysis as any).urbanFacilities ? (
            <p className="text-gray-500 text-sm">Urban facilities data not available for this location or will appear after AI analysis.</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default DemographicAnalysis; 