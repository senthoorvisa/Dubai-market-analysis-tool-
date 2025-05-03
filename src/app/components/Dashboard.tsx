"use client";

import { useState, useEffect } from 'react';
import { usePropertyLookup } from '../hooks/usePropertyLookup';
import { useDemographicAnalysis } from '../hooks/useDemographicAnalysis';
import { useForecastAnalysis } from '../hooks/useForecastAnalysis';
import { PropertyLookupResult } from '../interfaces/property';
import { DemographicData } from '../interfaces/demographics';
import { PropertyForecast } from '../interfaces/property';
import ChatGptTester from './ChatGptTester';
import ApiKeyInput from './ApiKeyInput';
import apiKeyService from '../services/apiKeyService';

const Dashboard: React.FC = () => {
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean>(false);
  
  // Initialize hooks with empty values
  const propertyLookup = usePropertyLookup();
  const demographicAnalysis = useDemographicAnalysis();
  const forecastAnalysis = useForecastAnalysis();
  
  // Define search location for quick search
  const [quickSearchLocation, setQuickSearchLocation] = useState<string>('');

  useEffect(() => {
    // Check if API key is configured on component mount
    const hasApiKey = apiKeyService.isApiKeyConfigured();
    setIsApiKeyConfigured(hasApiKey);
    
    // If API key is available, update the demographic analysis hook
    if (hasApiKey) {
      const apiKey = apiKeyService.getStoredApiKey();
      if (apiKey) {
        demographicAnalysis.setApiKey(apiKey);
      }
    }
  }, []);
  
  // Handle quick search submission
  const handleQuickSearch = () => {
    if (!quickSearchLocation.trim()) return;
    
    // Set the location in all hooks
    propertyLookup.setLocation(quickSearchLocation);
    demographicAnalysis.setLocation(quickSearchLocation);
    forecastAnalysis.setLocation(quickSearchLocation);
    
    // Fetch data
    propertyLookup.searchProperty();
    demographicAnalysis.fetchDemographicData();
    demographicAnalysis.fetchInfrastructureAnalysis();
    forecastAnalysis.generateComparativeForecasts();
    
    // If API key is configured, fetch market news as well
    if (isApiKeyConfigured) {
      demographicAnalysis.fetchMarketNews();
    }
  };
  
  // Handle API key setting
  const handleApiKeySet = (success: boolean) => {
    setIsApiKeyConfigured(success);
    
    if (success) {
      // If API key is set successfully, update the demographic analysis hook
      const apiKey = apiKeyService.getStoredApiKey();
      if (apiKey) {
        demographicAnalysis.setApiKey(apiKey);
        
        // If location is already set, fetch market news
        if (demographicAnalysis.location) {
          demographicAnalysis.fetchMarketNews();
        }
      }
    }
  };

  return (
    <div className="dashboard-container">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Dubai Real Estate Market Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Comprehensive market insights and analysis for Dubai&apos;s real estate market.
        </p>
      </header>

      {/* Quick Search & API Key Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 search-container">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Quick Search</h2>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-grow p-2 border border-gray-300 rounded-md bg-white hover-lift focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              placeholder="Enter location (e.g., Dubai Marina)"
              value={quickSearchLocation}
              onChange={(e) => setQuickSearchLocation(e.target.value)}
            />
            <button
              className="btn-primary hover-lift"
              onClick={handleQuickSearch}
              disabled={!quickSearchLocation.trim()}
            >
              Search
            </button>
          </div>
        </div>
        
        <div className="api-container">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-800">OpenAI Integration</h2>
            <button
              className="text-sm text-green-600 hover:underline focus:outline-none hover-lift"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            >
              {showApiKeyInput ? 'Hide' : 'Configure'}
            </button>
          </div>
          
          {showApiKeyInput ? (
            <ApiKeyInput 
              onApiKeySet={handleApiKeySet}
              showInitialMessage={false}
            />
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Connect your OpenAI API key for real-time market data, developer news, and property insights.
              </p>
              <div className="flex items-center text-sm text-gray-600">
                <span className={`h-2 w-2 rounded-full mr-2 ${isApiKeyConfigured ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span>{isApiKeyConfigured ? 'API Key Connected' : 'API Key Not Connected'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Dashboard Content */}
      {propertyLookup.propertyData || demographicAnalysis.demographicData || forecastAnalysis.forecast ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Property Statistics Card */}
          {propertyLookup.propertyData && (
            <DashboardCard
              title="Property Statistics"
              data={propertyLookup.propertyData}
              type="property"
              location={quickSearchLocation}
            />
          )}
          
          {/* Demographic Data Card */}
          {demographicAnalysis.demographicData && (
            <DashboardCard
              title="Demographic Overview"
              data={demographicAnalysis.demographicData}
              type="demographic"
              location={quickSearchLocation}
            />
          )}
          
          {/* Forecast Data Card */}
          {forecastAnalysis.comparativeForecasts && (
            <DashboardCard
              title="Price Forecast"
              data={forecastAnalysis.comparativeForecasts}
              type="forecast"
              location={quickSearchLocation}
            />
          )}
          
          {/* Infrastructure Impact Card */}
          {demographicAnalysis.infrastructureAnalysis && (
            <DashboardCard
              title="Infrastructure Impact"
              data={demographicAnalysis.infrastructureAnalysis}
              type="infrastructure"
              location={quickSearchLocation}
            />
          )}
          
          {/* Market News Card */}
          {demographicAnalysis.marketNews && (
            <DashboardCard
              title="Market News"
              data={demographicAnalysis.marketNews}
              type="news"
              location={quickSearchLocation}
            />
          )}
        </div>
      ) : (
        <div className="dashboard-dark p-6 text-center">
          <p className="text-lg mb-4 text-gray-700">
            Enter a location to view comprehensive market analysis data.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <DashboardFeatureCard
              title="Property Lookup"
              description="Find properties and analyze statistics in any area."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              }
            />
            <DashboardFeatureCard
              title="Developer Analysis"
              description="View developer track records and project history."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
            <DashboardFeatureCard
              title="Demographics"
              description="Access population and wealth distribution statistics."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            <DashboardFeatureCard
              title="Price Forecast"
              description="Generate dynamic price predictions for properties."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Dashboard Card Component
interface DashboardCardProps {
  title: string;
  data: any;
  type: 'property' | 'demographic' | 'forecast' | 'infrastructure' | 'news';
  location: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, data, type, location }) => {
  return (
    <div className="dashboard-card">
      <div className="p-4 bg-green-50 border-b border-green-100 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{location}</p>
      </div>
      
      <div className="p-4">
        {type === 'property' && (
          <PropertyStatsCard data={data as PropertyLookupResult} />
        )}
        
        {type === 'demographic' && (
          <DemographicStatsCard data={data as DemographicData} />
        )}
        
        {type === 'forecast' && (
          <ForecastStatsCard data={data as Record<string, PropertyForecast>} />
        )}
        
        {type === 'infrastructure' && (
          <InfrastructureStatsCard data={data} />
        )}
        
        {type === 'news' && (
          <NewsStatsCard data={data as string[]} />
        )}
      </div>
    </div>
  );
};

// Property Statistics Card
const PropertyStatsCard: React.FC<{ data: PropertyLookupResult }> = ({ data }) => {
  return (
    <div className="dashboard-card">
      <div className="mb-4">
        <p className="dashboard-card-header">Total Properties: <span className="dashboard-card-value">{data.totalProperties}</span></p>
      </div>
      
      <h4 className="dashboard-card-header">Property Types</h4>
      <div className="grid grid-cols-2 gap-2">
        {data.propertyTypes.map((type, index) => (
          <div key={index} className="property-type-card">
            <span className="font-medium">{type.type}:</span> {type.count}
          </div>
        ))}
      </div>
      
      {data.selectedProperty && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="dashboard-card-header">Selected Property</h4>
          <p className="font-bold mb-1 text-gray-800">{data.selectedProperty.name}</p>
          <p className="mb-1 text-gray-700">{data.selectedProperty.type} by {data.selectedProperty.developerName}</p>
          <p className="font-medium text-green-600">Price: {formatCurrency(data.selectedProperty.currentPrice)}</p>
        </div>
      )}
    </div>
  );
};

// Demographic Statistics Card
const DemographicStatsCard: React.FC<{ data: DemographicData }> = ({ data }) => {
  return (
    <div className="dashboard-card">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="dashboard-card-label">Population</p>
          <p className="text-xl font-bold text-gray-800">{data.populationStats.total.toLocaleString()}</p>
          <p className="text-sm text-green-600">+{data.populationStats.growthRate}% growth</p>
        </div>
        <div>
          <p className="dashboard-card-label">High-Net-Worth</p>
          <p className="text-xl font-bold text-gray-800">{data.wealthDistribution.highNetWorth.toLocaleString()}</p>
          <p className="text-sm text-gray-700">{data.wealthDistribution.percentageOfWealthy}% of population</p>
        </div>
      </div>
      
      <h4 className="dashboard-card-header">Age Distribution</h4>
      <div className="demographic-bar">
        <div style={{ width: `${data.ageDistribution.under18}%` }} className="demographic-segment-1"></div>
        <div style={{ width: `${data.ageDistribution.age18to35}%` }} className="demographic-segment-2"></div>
        <div style={{ width: `${data.ageDistribution.age36to50}%` }} className="demographic-segment-3"></div>
        <div style={{ width: `${data.ageDistribution.age51to65}%` }} className="demographic-segment-4"></div>
        <div style={{ width: `${data.ageDistribution.above65}%` }} className="demographic-segment-5"></div>
      </div>
      <div className="flex text-xs justify-between mt-1 text-gray-700">
        <span>Under 18</span>
        <span>18-35</span>
        <span>36-50</span>
        <span>51-65</span>
        <span>65+</span>
      </div>
    </div>
  );
};

// Forecast Statistics Card
const ForecastStatsCard: React.FC<{ data: Record<string, PropertyForecast> }> = ({ data }) => {
  // Convert the data to an array for easier rendering
  const forecastArray = Object.entries(data).map(([type, forecast]) => {
    const fiveYearForecast = forecast.forecasts.find(f => f.period === '5years');
    const oneYearForecast = forecast.forecasts.find(f => f.period === '1year');
    
    const fiveYearGrowth = fiveYearForecast 
      ? ((fiveYearForecast.predictedPrice - forecast.currentPrice) / forecast.currentPrice) * 100 
      : 0;
    
    const oneYearGrowth = oneYearForecast
      ? ((oneYearForecast.predictedPrice - forecast.currentPrice) / forecast.currentPrice) * 100
      : 0;
    
    return {
      type,
      currentPrice: forecast.currentPrice,
      fiveYearPrice: fiveYearForecast?.predictedPrice || 0,
      fiveYearGrowth,
      oneYearGrowth
    };
  });
  
  return (
    <div className="dashboard-card">
      <h4 className="dashboard-card-header">5-Year Price Growth Forecast</h4>
      <div className="space-y-3">
        {forecastArray.map((item) => (
          <div key={item.type} className="forecast-card">
            <div className="flex justify-between mb-1">
              <span className="font-medium text-gray-800">{item.type}</span>
              <span className="forecast-value-positive">+{item.fiveYearGrowth.toFixed(1)}%</span>
            </div>
            <div className="forecast-bar-bg">
              <div 
                className="forecast-bar" 
                style={{ width: `${Math.min(100, item.fiveYearGrowth)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm mt-1 text-gray-700">
              <span>{formatCurrency(item.currentPrice)}</span>
              <span>{formatCurrency(item.fiveYearPrice)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Infrastructure Statistics Card
const InfrastructureStatsCard: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="dashboard-card">
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="forecast-card text-center">
          <p className="dashboard-card-label">Short-Term</p>
          <p className="text-lg font-bold forecast-value-positive">+{data.valueImpactAnalysis.shortTerm}%</p>
        </div>
        <div className="forecast-card text-center">
          <p className="dashboard-card-label">Medium-Term</p>
          <p className="text-lg font-bold forecast-value-positive">+{data.valueImpactAnalysis.mediumTerm}%</p>
        </div>
        <div className="forecast-card text-center">
          <p className="dashboard-card-label">Long-Term</p>
          <p className="text-lg font-bold forecast-value-positive">+{data.valueImpactAnalysis.longTerm}%</p>
        </div>
      </div>
      
      <h4 className="dashboard-card-header">Projects ({data.totalProjects})</h4>
      <div className="space-y-2">
        {data.projects.slice(0, 3).map((project: any) => (
          <div key={project.id} className="infrastructure-card">
            <div className="flex justify-between">
              <span className="font-medium text-gray-800">{project.name}</span>
              <span className="impact-positive">+{project.estimatedImpact}%</span>
            </div>
            <p className="text-xs text-gray-600">
              {project.type.charAt(0).toUpperCase() + project.type.slice(1)} | 
              Completion: {formatDate(project.completionDate)}
            </p>
          </div>
        ))}
        {data.projects.length > 3 && (
          <p className="text-sm text-center text-gray-600">
            +{data.projects.length - 3} more projects
          </p>
        )}
      </div>
    </div>
  );
};

// News Statistics Card
const NewsStatsCard: React.FC<{ data: string[] }> = ({ data }) => {
  return (
    <div className="dashboard-card">
      <h4 className="dashboard-card-header">Latest Market Updates</h4>
      <ul className="list-disc pl-5 space-y-2">
        {data.slice(0, 4).map((item, index) => (
          <li key={index} className="text-sm text-gray-700">{item}</li>
        ))}
      </ul>
    </div>
  );
};

// Dashboard Feature Card
interface DashboardFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const DashboardFeatureCard: React.FC<DashboardFeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="feature-card">
      <div className="flex justify-center mb-3 dashboard-icon">{icon}</div>
      <h3 className="font-semibold mb-1 text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AE', { year: 'numeric', month: 'short' });
};

export default Dashboard; 