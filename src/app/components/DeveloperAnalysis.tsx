"use client";

import React, { useState, useEffect } from 'react';
import { useDeveloperAnalysis } from '../hooks/useDeveloperAnalysis';
import { getDeveloperInfo } from '../services/openAiService';
import Image from 'next/image';

// Types
interface DeveloperProject {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  area: number;
  startDate: string;
  completionDate: string;
  priceRange: {
    min: number;
    max: number;
  };
  description: string;
  imageUrl?: string;
}

export const DeveloperAnalysis: React.FC = () => {
  const [developerName, setDeveloperName] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [localApiKey, setLocalApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  const [developerNews, setDeveloperNews] = useState<string[]>([]);
  const { loading: mockDataLoading, error: mockDataError, developerAnalysis, fetchDeveloperAnalysis } = useDeveloperAnalysis();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  useEffect(() => {
    // Load API key from localStorage on component mount
    const savedApiKey = localStorage.getItem('chatgptApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setLocalApiKey(savedApiKey);
    }
  }, []);

  const handleDeveloperSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!developerName.trim()) return;
    
    setLoading(true);
    setError(null);
    setAiAnalysis(null);
    
    try {
      // First fetch mock data for the UI
      fetchDeveloperAnalysis(developerName);
      
      // Then get real-time AI analysis from OpenAI
      const response = await getDeveloperInfo(developerName);
      
      if (response.success && response.data) {
        setAiAnalysis(response.data);
      } else {
        throw new Error(response.error || 'Failed to get developer information');
      }
    } catch (err) {
      setError('Failed to perform developer analysis. Please try again later.');
      console.error('Error during developer analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySubmit = async () => {
    if (!localApiKey.trim()) return;
    
    setLoading(true);
    try {
      // Save API key to localStorage
      localStorage.setItem('chatgptApiKey', localApiKey);
      setApiKey(localApiKey);
      
      // Mock API call for news - in a real app, this would call ChatGPT API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock news if API key is not available or if no real data returned
      const mockNews = [
        `${developerName} announces new luxury development in Dubai Marina.`,
        `${developerName} reports 12% increase in sales for Q2 2023.`,
        `Investors show strong interest in ${developerName}&apos;s latest off-plan development.`,
        `${developerName} partners with government for new affordable housing initiative.`,
        `${developerName} wins "Developer of the Year" award at Dubai Property Summit.`
      ];
      
      setDeveloperNews(mockNews);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-neutral-800">Developer Analysis</h1>
      
      {/* Search Form */}
      <form onSubmit={handleDeveloperSearch} className="mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            className="flex-grow p-3 border border-neutral-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-500 shadow-sm"
            placeholder="Enter developer name (e.g., Emaar, Nakheel, Damac)"
            value={developerName}
            onChange={(e) => setDeveloperName(e.target.value)}
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 font-medium transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
            disabled={loading || mockDataLoading}
          >
            {(loading || mockDataLoading) ? 'Loading...' : 'Analyze Developer'}
          </button>
        </div>
      </form>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Real-time AI Analysis */}
      {aiAnalysis && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-neutral-800">AI-Powered Market Analysis</h3>
          <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-md">
            <p className="text-neutral-700 whitespace-pre-line">{aiAnalysis}</p>
            <div className="mt-4 text-sm text-neutral-500">
              <p>Data sources: Dubai Land Department, Developer websites, Market reports</p>
              <p className="mt-1">Analysis generated using OpenAI</p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Loading indicator */}
      {(loading || mockDataLoading) && !aiAnalysis && !error && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neutral-800"></div>
          <p className="mt-2 text-neutral-600">Analyzing developer data...</p>
        </div>
      )}

      {/* Analysis Results */}
      {developerAnalysis && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-neutral-800">{developerAnalysis.name}</h2>
            <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-md">
              <p className="text-neutral-700 mb-4">{developerAnalysis.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <StatCard 
                  title="Founded" 
                  value={developerAnalysis.foundedYear} 
                  bgColor="bg-neutral-50"
                  borderColor="border-neutral-200"
                  textColor="text-neutral-800"
                />
                <StatCard 
                  title="Projects Completed" 
                  value={developerAnalysis.projectsCompleted.toString()} 
                  bgColor="bg-neutral-50"
                  borderColor="border-neutral-200"
                  textColor="text-neutral-800"
                />
                <StatCard 
                  title="Market Share" 
                  value={developerAnalysis.marketShare.toString() + '%'} 
                  bgColor="bg-neutral-50"
                  borderColor="border-neutral-200"
                  textColor="text-neutral-800"
                />
                <StatCard 
                  title="YoY Growth" 
                  value={developerAnalysis.yearOverYearGrowth.toString() + '%'} 
                  isPositive={developerAnalysis.yearOverYearGrowth >= 0}
                  bgColor="bg-neutral-50"
                  borderColor="border-neutral-200"
                  textColor="text-neutral-800"
                />
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-neutral-800">Performance Metrics</h3>
            <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium mb-2 text-neutral-800">Financial Performance</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard 
                      title="Revenue (AED)" 
                      value={formatCurrency(developerAnalysis.financialPerformance.revenue)}
                      bgColor="bg-neutral-50"
                      borderColor="border-neutral-200"
                      textColor="text-neutral-800"
                    />
                    <StatCard 
                      title="Profit Margin" 
                      value={developerAnalysis.financialPerformance.profitMargin.toString() + '%'}
                      bgColor="bg-neutral-50"
                      borderColor="border-neutral-200"
                      textColor="text-neutral-800"
                    />
                    <StatCard 
                      title="Debt Ratio" 
                      value={developerAnalysis.financialPerformance.debtRatio.toFixed(2)}
                      isPositive={developerAnalysis.financialPerformance.debtRatio < 0.5}
                      bgColor="bg-neutral-50"
                      borderColor="border-neutral-200"
                      textColor="text-neutral-800"
                    />
                    <StatCard 
                      title="ROI" 
                      value={developerAnalysis.financialPerformance.returnOnInvestment.toString() + '%'}
                      bgColor="bg-neutral-50"
                      borderColor="border-neutral-200"
                      textColor="text-neutral-800"
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-neutral-800">Project Performance</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard 
                      title="On-Time Delivery" 
                      value={developerAnalysis.projectPerformance.onTimeDelivery.toString() + '%'}
                      bgColor="bg-neutral-50"
                      borderColor="border-neutral-200"
                      textColor="text-neutral-800"
                    />
                    <StatCard 
                      title="Quality Score" 
                      value={developerAnalysis.projectPerformance.qualityScore.toString() + '/10'}
                      bgColor="bg-neutral-50"
                      borderColor="border-neutral-200"
                      textColor="text-neutral-800"
                    />
                    <StatCard 
                      title="Customer Reviews" 
                      value={developerAnalysis.projectPerformance.customerReviews.toString() + '/5'}
                      bgColor="bg-neutral-50"
                      borderColor="border-neutral-200"
                      textColor="text-neutral-800"
                    />
                    <StatCard 
                      title="Booking Rate" 
                      value={developerAnalysis.projectPerformance.bookingRate.toString() + '%'}
                      bgColor="bg-neutral-50"
                      borderColor="border-neutral-200"
                      textColor="text-neutral-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-neutral-800">Key Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {developerAnalysis.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
            </div>
          </div>

          {/* Market Perception */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3 text-neutral-800">Market Perception</h3>
            <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-center shadow-sm">
                  <p className="text-sm text-neutral-600 mb-1">Quality Rating</p>
                  <p className="text-xl font-bold text-neutral-800">{developerAnalysis.marketPerception.qualityRating}/10</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-center shadow-sm">
                  <p className="text-sm text-neutral-600 mb-1">Value for Money</p>
                  <p className="text-xl font-bold text-neutral-800">{developerAnalysis.marketPerception.valueForMoney}/10</p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-center shadow-sm">
                  <p className="text-sm text-neutral-600 mb-1">Customer Satisfaction</p>
                  <p className="text-xl font-bold text-neutral-800">{developerAnalysis.marketPerception.customerSatisfaction}/10</p>
                </div>
              </div>
              
              <h4 className="font-medium mb-2 text-neutral-800">Key Strengths</h4>
              <ul className="list-disc pl-5 mb-4 text-neutral-700">
                {developerAnalysis.marketPerception.keyStrengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
              
              <h4 className="font-medium mb-2 text-neutral-800">Areas for Improvement</h4>
              <ul className="list-disc pl-5 text-neutral-700">
                {developerAnalysis.marketPerception.areasForImprovement.map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* News Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-neutral-800">Latest News & Updates</h3>
              <button
                className="text-sm text-neutral-800 hover:text-neutral-600 hover:underline focus:outline-none transition-colors"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              >
                {showApiKeyInput ? 'Hide API Settings' : 'Configure API'}
              </button>
            </div>

            {showApiKeyInput && (
              <div className="bg-white rounded-xl p-5 mb-4 border border-neutral-200 shadow-md">
                <label className="block text-sm font-medium mb-1 text-neutral-700" htmlFor="apiKey">
                  ChatGPT API Key
                </label>
                <div className="flex gap-2">
                  <input
                    id="apiKey"
                    type="password"
                    className="flex-grow p-2 border border-neutral-300 rounded-md bg-white focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400"
                    placeholder="Enter your ChatGPT API key"
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                  />
                  <button
                    className="px-4 py-2 bg-neutral-800 text-white rounded-md hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-opacity-50 disabled:opacity-50 transition-all shadow-sm"
                    onClick={handleApiKeySubmit}
                    disabled={loading || !localApiKey.trim()}
                  >
                    {loading ? 'Loading...' : 'Fetch News'}
                  </button>
                </div>
                <p className="text-xs mt-1 text-neutral-500">
                  Your API key is required to fetch the latest news about this developer.
                </p>
              </div>
            )}

            {developerNews && developerNews.length > 0 ? (
              <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-md">
                <ul className="space-y-2 text-neutral-700">
                  {developerNews.map((news, index) => (
                    <li key={index} className="p-2 hover:bg-neutral-50 rounded transition-colors">
                      <div className="flex items-start">
                        <span className="inline-block w-3 h-3 bg-gradient-to-r from-neutral-400 to-neutral-600 rounded-full mr-2 mt-1.5"></span>
                        <span>{news}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-5 text-center border border-neutral-200 shadow-md">
                <p className="text-neutral-500">
                  Configure your API key to fetch the latest news about {developerName || 'this developer'}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  isPositive?: boolean;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}> = ({ 
  title, 
  value, 
  isPositive = true,
  bgColor = "bg-neutral-50",
  textColor = "text-neutral-800",
  borderColor = "border-neutral-200"
}) => {
  return (
    <div className={`${bgColor} rounded-lg p-3 border ${borderColor} shadow-sm text-center hover:shadow-md transition-shadow`}>
      <p className="text-sm text-neutral-600 mb-1">{title}</p>
      <p className={`text-xl font-bold ${isPositive ? textColor : 'text-red-500'}`}>{value}</p>
    </div>
  );
};

const ProjectCard: React.FC<{ project: DeveloperProject }> = ({ project }) => {
  function getStatusColor(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'ongoing':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'future':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-100';
    }
  }

  function getPropertyTypeColor(type: string) {
    switch (type.toLowerCase()) {
      case 'residential':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'commercial':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'mixed-use':
        return 'bg-violet-50 text-violet-600 border-violet-100';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-100';
    }
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-md overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1">
      {project.imageUrl && (
        <div className="h-40 overflow-hidden relative">
          <Image 
            src={project.imageUrl} 
            alt={project.name} 
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
      <div className="p-4">
        <h4 className="text-lg font-semibold text-neutral-800 mb-2">{project.name}</h4>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs border ${getPropertyTypeColor(project.type)}`}>
            {project.type}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(project.status)}`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-neutral-600">
          <p><span className="font-medium">Location:</span> {project.location}</p>
          <p><span className="font-medium">Area:</span> {project.area} sqft</p>
          <p><span className="font-medium">Started:</span> {formatDate(project.startDate)}</p>
          <p>
            <span className="font-medium">Completion:</span>{' '}
            {project.status === 'completed' ? formatDate(project.completionDate) : project.completionDate}
          </p>
        </div>
        
        <div className="text-center p-2 bg-gradient-to-r from-neutral-50 to-neutral-600 rounded-md mb-3">
          <span className="font-medium text-neutral-800">Price Range:</span>{' '}
          {formatCurrency(project.priceRange.min)} - {formatCurrency(project.priceRange.max)}
        </div>
        
        <p className="text-sm text-neutral-700 line-clamp-2">{project.description}</p>
      </div>
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

export default DeveloperAnalysis;