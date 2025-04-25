"use client";

import { useState } from 'react';
import { useDemographicAnalysis } from '../hooks/useDemographicAnalysis';
import { DemographicData, InfrastructureProject } from '../interfaces/demographics';

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

  const [apiKey, setLocalApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);

  // Handle search button click
  const handleSearch = () => {
    fetchDemographicData();
    fetchInfrastructureAnalysis();
  };

  // Handle API key submission
  const handleApiKeySubmit = () => {
    setApiKey(apiKey);
    fetchMarketNews();
  };

  // Handle wealth comparison fetch
  const handleFetchWealthComparison = () => {
    fetchWealthComparison();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Demographic & Infrastructure Analysis</h2>

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
              disabled={isLoading || !location.trim()}
            >
              {isLoading ? 'Loading...' : 'Analyze Demographics'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* Results Section */}
      {demographicData && (
        <div>
          {/* Demographic Overview */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">Demographic Overview: {demographicData.location}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <h4 className="font-medium mb-2 text-gray-800">Wealth Distribution</h4>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">High-Net-Worth Individuals:</span>{' '}
                    {demographicData.wealthDistribution.highNetWorth.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Ultra-High-Net-Worth:</span>{' '}
                    {demographicData.wealthDistribution.ultraHighNetWorth.toLocaleString()}
                  </p>
                  <p>
                    <span className="font-medium">Billionaires:</span>{' '}
                    {demographicData.wealthDistribution.billionaires}
                  </p>
                  <p>
                    <span className="font-medium">Wealthy Percentage:</span>{' '}
                    <span className="text-neutral-600">{demographicData.wealthDistribution.percentageOfWealthy}%</span>
                  </p>
                </div>
                
                {/* Visual representation of wealth */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-neutral-600 h-2.5 rounded-full" style={{ width: `${demographicData.wealthDistribution.percentageOfWealthy}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>Wealth Distribution</span>
                    <span>100%</span>
                  </div>
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
                    <span className="font-medium">51-65:</span>
                    <div className="flex-grow mx-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${demographicData.ageDistribution.age51to65}%` }}></div>
                      </div>
                    </div>
                    <span>{demographicData.ageDistribution.age51to65}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Above 65:</span>
                    <div className="flex-grow mx-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${demographicData.ageDistribution.above65}%` }}></div>
                      </div>
                    </div>
                    <span>{demographicData.ageDistribution.above65}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Trends */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">5-Year Historical Trends</h3>
            <div className="overflow-x-auto bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-gray-700">Year</th>
                    <th className="px-4 py-2 text-left text-gray-700">Population</th>
                    <th className="px-4 py-2 text-left text-gray-700">High-Net-Worth</th>
                    <th className="px-4 py-2 text-left text-gray-700">Average Income</th>
                    <th className="px-4 py-2 text-left text-gray-700">YoY Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {demographicData.historicalTrend.map((trend, index) => {
                    // Calculate YoY growth - if it's the first row, there's no previous year to compare to
                    const prevYear = index > 0 ? demographicData.historicalTrend[index - 1] : null;
                    const yoyGrowth = prevYear
                      ? ((trend.population - prevYear.population) / prevYear.population) * 100
                      : null;

                    return (
                      <tr key={trend.year} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-700">{trend.year}</td>
                        <td className="px-4 py-2 text-gray-700">{trend.population.toLocaleString()}</td>
                        <td className="px-4 py-2 text-gray-700">{trend.highNetWorthCount.toLocaleString()}</td>
                        <td className="px-4 py-2 text-gray-700">{formatCurrency(trend.averageIncome)}</td>
                        <td className="px-4 py-2">
                          {yoyGrowth !== null ? (
                            <span className={yoyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {yoyGrowth >= 0 ? '+' : ''}
                              {yoyGrowth.toFixed(1)}%
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Wealth Comparison with Other Areas */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-gray-800">Wealth Comparison with Other Areas</h3>
              {!wealthComparison && (
                <button
                  className="px-4 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
                  onClick={handleFetchWealthComparison}
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'Compare Areas'}
                </button>
              )}
            </div>

            {wealthComparison ? (
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left text-gray-700">Location</th>
                        <th className="px-4 py-2 text-left text-gray-700">High-Net-Worth</th>
                        <th className="px-4 py-2 text-left text-gray-700">Ultra-High-Net-Worth</th>
                        <th className="px-4 py-2 text-left text-gray-700">Billionaires</th>
                        <th className="px-4 py-2 text-left text-gray-700">Wealthy %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(wealthComparison).map(([location, data]: [string, any]) => (
                        <tr
                          key={location}
                          className={`border-t border-gray-200 hover:bg-gray-50 ${
                            location === demographicData.location
                              ? 'bg-green-50'
                              : ''
                          }`}
                        >
                          <td className="px-4 py-2 font-medium text-gray-700">{location}</td>
                          <td className="px-4 py-2 text-gray-700">{data.highNetWorth.toLocaleString()}</td>
                          <td className="px-4 py-2 text-gray-700">{data.ultraHighNetWorth.toLocaleString()}</td>
                          <td className="px-4 py-2 text-gray-700">{data.billionaires}</td>
                          <td className="px-4 py-2 text-green-600 font-medium">{data.percentageOfWealthy}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm">
                <p className="text-gray-500">Click "Compare Areas" to see how {demographicData.location} compares to other areas.</p>
              </div>
            )}
          </div>

          {/* Infrastructure Projects */}
          {infrastructureAnalysis && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Infrastructure Projects</h3>
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="mb-4">
                  <p className="mb-2 text-gray-700">
                    <span className="font-medium">Total Projects:</span> {infrastructureAnalysis.totalProjects}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-3 rounded border border-green-100">
                      <p className="font-medium text-gray-700">Short-Term Impact (1 year)</p>
                      <p className="text-green-600 font-bold text-xl">
                        +{infrastructureAnalysis.valueImpactAnalysis.shortTerm}%
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                      <p className="font-medium text-gray-700">Medium-Term Impact (3 years)</p>
                      <p className="text-blue-600 font-bold text-xl">
                        +{infrastructureAnalysis.valueImpactAnalysis.mediumTerm}%
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded border border-purple-100">
                      <p className="font-medium text-gray-700">Long-Term Impact (5 years)</p>
                      <p className="text-purple-600 font-bold text-xl">
                        +{infrastructureAnalysis.valueImpactAnalysis.longTerm}%
                      </p>
                    </div>
                  </div>
                </div>

                <h4 className="font-medium mb-3 text-gray-800">Project Details</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {infrastructureAnalysis.projects.map((project) => (
                    <InfrastructureProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Market News Section */}
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

            {showApiKeyInput && (
              <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm">
                <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="apiKey">
                  ChatGPT API Key
                </label>
                <div className="flex gap-2">
                  <input
                    id="apiKey"
                    type="password"
                    className="flex-grow p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter your ChatGPT API key"
                    value={apiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                  />
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
                    onClick={handleApiKeySubmit}
                    disabled={isLoading || !apiKey.trim()}
                  >
                    {isLoading ? 'Loading...' : 'Fetch Market News'}
                  </button>
                </div>
                <p className="text-xs mt-1 text-gray-500">
                  Your API key is required to fetch real-time market news for this area.
                </p>
              </div>
            )}

            {marketNews ? (
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <h4 className="font-medium mb-3 text-gray-800">Market News Summary</h4>
                <ul className="space-y-2">
                  {marketNews.map((item, index) => (
                    <li key={index} className="p-2 hover:bg-gray-50 rounded text-gray-700">
                      <div className="flex items-start">
                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2 mt-1.5"></span>
                        <span>{item}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm">
                <p className="text-gray-500">Enter your API key to fetch the latest market news for {demographicData.location}.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Infrastructure Project Card Component
const InfrastructureProjectCard: React.FC<{ project: InfrastructureProject }> = ({ project }) => {
  function getStatusColor(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'planned':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'transport':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'residential':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'commercial':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'mixed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <h4 className="font-semibold mb-1 text-gray-800">{project.name}</h4>
      <div className="flex flex-wrap gap-2 mb-2">
        <span className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(project.type)}`}>
          {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(project.status)}`}>
          {project.status === 'in_progress' ? 'In Progress' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-2 text-sm text-gray-600">
        <p>
          <span className="font-medium">Start:</span> {formatDate(project.startDate)}
        </p>
        <p>
          <span className="font-medium">Completion:</span> {formatDate(project.completionDate)}
        </p>
        <p>
          <span className="font-medium">Est. Cost:</span> {formatCurrency(project.estimatedCost)}
        </p>
        <p>
          <span className="font-medium">Value Impact:</span>{' '}
          <span className="text-green-600">+{project.estimatedImpact}%</span>
        </p>
      </div>
      
      <p className="text-sm text-gray-700">{project.description}</p>
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

export default DemographicAnalysis; 