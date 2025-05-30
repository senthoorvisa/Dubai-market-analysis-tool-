"use client";

import React, { useState, useEffect } from 'react';
import { getPropertyTransactions } from '../services/dubaiGovService';
import Image from 'next/image';
import ApiKeyInput from './ApiKeyInput';
import apiKeyService from '../services/apiKeyService';
import backendApiService from '../services/backendApiService';
import { getPropertyInfoWithScraping } from '../services/geminiService';

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

interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  rating: number;
  date: string;
  project: string;
}

interface DeveloperData {
  name: string;
  description: string;
  foundedYear: number;
  headquarters: string;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  marketShare: number;
  reputation: string;
  projects: DeveloperProject[];
  testimonials: Testimonial[];
  recentPerformance: {
    salesVolume: number;
    priceTrend: number;
    customerSatisfaction: number;
    deliveryTimeline: number;
  };
  financialMetrics: {
    revenue: number;
    profitMargin: number;
    growthRate: number;
    marketCap: number;
  };
}

export const DeveloperAnalysis: React.FC = () => {
  const [developerName, setDeveloperName] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  const [developerNews, setDeveloperNews] = useState<string[]>([]);
  const [mockDataLoading, setMockDataLoading] = useState<boolean>(false);
  const [mockDataError, setMockDataError] = useState<string | null>(null);
  const [developerAnalysis, setDeveloperAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [developerData, setDeveloperData] = useState<DeveloperData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'testimonials' | 'performance'>('overview');
  const [isApiKeyConfigured, setIsApiKeyConfigured] = useState<boolean>(false);

  useEffect(() => {
    // Check if API key is configured on component mount
    const hasApiKey = apiKeyService.isApiKeyConfigured();
    setIsApiKeyConfigured(hasApiKey);
  }, []);

  const handleApiKeySet = (success: boolean) => {
    setIsApiKeyConfigured(success);
    if (success) {
      // If an API key was successfully set and we have a developer name, retry the analysis
      if (developerName.trim()) {
        handleDeveloperSearch({ preventDefault: () => {} } as React.FormEvent);
      }
    }
  };

  const handleDeveloperSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!developerName.trim()) return;
    
    setLoading(true);
    setError(null);
    setAiAnalysis(null);
    
    try {
      // First fetch mock data for the UI
      fetchDeveloperAnalysis(developerName);
      
      // Check if API key is available
      if (!isApiKeyConfigured) {
        setShowApiKeyInput(true);
        throw new Error('Please provide an OpenAI API key to access AI-powered analysis');
      }
      
      // Try to get real-time AI analysis from Gemini
      try {
        const aiResponse = await getPropertyInfoWithScraping({ 
          location: developerName,
          propertyType: 'Developer Analysis'
        });
        
        if (!aiResponse.success) {
          throw new Error(aiResponse.error || 'Failed to get developer information');
        }
        
        setAiAnalysis(aiResponse.data ? (typeof aiResponse.data === 'string' ? aiResponse.data : JSON.stringify(aiResponse.data)) : null);
      } catch (aiError) {
        console.error('Error with OpenAI analysis:', aiError);
        // Check if it's an API key error
        const errorMessage = aiError instanceof Error ? aiError.message : String(aiError);
        if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
          setIsApiKeyConfigured(false);
          setShowApiKeyInput(true);
          throw new Error('Invalid API key. Please check your OpenAI API key and try again.');
        }
        // Continue with mock data for other types of errors
      }

      // Try to get transaction data from DLD
      // If real API fails, use mock data
      let transactions = [];
      try {
        transactions = await getPropertyTransactions(developerName, '2023-01-01', '2024-01-01');
      } catch (dldError) {
        console.error('Error fetching DLD data, using mock data instead:', dldError);
        // Generate mock transactions
        transactions = Array(15).fill(0).map((_, i) => ({
          transactionId: `TX${100000 + i}`,
          propertyType: Math.random() > 0.5 ? 'Apartment' : 'Villa',
          area: Math.floor(1000 + Math.random() * 3000),
          price: Math.floor(800000 + Math.random() * 5000000),
          date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(1 + Math.random() * 28)).toISOString(),
          location: {
            makaniNumber: `${10000 + i}`,
            coordinates: { lat: 25.2048, lng: 55.2708 },
            address: `${developerName} Property ${i+1}`,
            area: 'Dubai Marina'
          }
        }));
      }

      // Create mock developer data
      const mockDeveloperData: DeveloperData = {
        name: developerName,
        description: `${developerName} is a leading property developer in Dubai known for high-quality residential and commercial developments across the UAE.`,
        foundedYear: 1997,
        headquarters: 'Dubai, UAE',
        totalProjects: 42,
        activeProjects: 12,
        completedProjects: 30,
        marketShare: 15.5,
        reputation: 'Excellent',
        projects: Array(8).fill(0).map((_, i) => ({
          id: `PRJ-${1000 + i}`,
          name: `${developerName} ${['Residences', 'Heights', 'Towers', 'Park', 'Square', 'Boulevard'][i % 6]} ${i+1}`,
          type: ['Residential', 'Commercial', 'Mixed-Use'][i % 3],
          status: ['Completed', 'Under Construction', 'Planning Phase'][i % 3],
          location: ['Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'Business Bay'][i % 4],
          area: Math.floor(5000 + Math.random() * 50000),
          startDate: `202${i % 3}-${(i % 12) + 1}-01`,
          completionDate: `202${(i % 3) + 2}-${(i % 12) + 1}-01`,
          priceRange: {
            min: Math.floor(800000 + Math.random() * 1000000),
            max: Math.floor(2000000 + Math.random() * 5000000)
          },
          description: `A premium ${['residential', 'commercial', 'mixed-use'][i % 3]} development featuring modern design and amenities.`,
          imageUrl: `/images/projects/project-${(i % 6) + 1}.jpg`
        })),
        testimonials: Array(5).fill(0).map((_, i) => ({
          id: `TEST-${1000 + i}`,
          author: `Client ${i+1}`,
          role: `Property Investor`,
          content: `My experience with ${developerName} has been outstanding. The quality of construction and attention to detail exceeded my expectations.`,
          rating: 4 + Math.floor(Math.random() * 2),
          date: `2023-${(i % 12) + 1}-15`,
          project: `${developerName} ${['Residences', 'Heights', 'Towers', 'Park', 'Square'][i % 5]} ${i+1}`
        })),
        recentPerformance: {
          salesVolume: transactions.length,
          priceTrend: calculatePriceTrend(transactions),
          customerSatisfaction: 4.5,
          deliveryTimeline: 95
        },
        financialMetrics: {
          revenue: 2500000000,
          profitMargin: 25,
          growthRate: 15,
          marketCap: 50000000000
        }
      };

      setDeveloperData(mockDeveloperData);
    } catch (err) {
      let errorMessage = 'Failed to analyze developer data. Please try again later.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Error during developer analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePriceTrend = (transactions: any[]) => {
    if (transactions.length < 2) return 0;
    
    const firstQuarter = transactions
      .slice(0, Math.floor(transactions.length / 2))
      .reduce((sum, t) => sum + t.price, 0) / Math.floor(transactions.length / 2);
    
    const secondQuarter = transactions
      .slice(Math.floor(transactions.length / 2))
      .reduce((sum, t) => sum + t.price, 0) / Math.ceil(transactions.length / 2);
    
    return ((secondQuarter - firstQuarter) / firstQuarter) * 100;
  };

  // Format the AI analysis with line breaks for better display
  const formatAnalysis = (text: string) => {
    if (!text) return [];
    return text.split('\n').map((line, index) => (
      <p key={index} className={`mb-2 ${line.trim().startsWith('#') ? 'font-bold text-lg mt-4' : ''}`}>
        {line}
      </p>
    ));
  };

  // Mock function to replace useDeveloperAnalysis hook
  const fetchDeveloperAnalysis = async (name: string) => {
    setMockDataLoading(true);
    setMockDataError(null);
    
    try {
      const response = await backendApiService.getDeveloperAnalysis(name);
      if (response.success) {
        setDeveloperAnalysis(response.data);
      } else {
        setMockDataError(response.error || 'Failed to fetch developer analysis');
      }
    } catch (err) {
      setMockDataError('Failed to fetch developer analysis');
    } finally {
      setMockDataLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Developer Analysis</h1>
          <form onSubmit={handleDeveloperSearch} className="flex gap-4">
            <input
              type="text"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter developer name (e.g., Emaar, Nakheel, Damac)"
              value={developerName}
              onChange={(e) => setDeveloperName(e.target.value)}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze Developer'}
            </button>
          </form>
          
          {/* API Key Input Section */}
          {showApiKeyInput && (
            <div className="mt-4">
              <ApiKeyInput 
                onApiKeySet={handleApiKeySet}
                className="mb-2"
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
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Developer Analysis Results */}
        {aiAnalysis && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Analysis: {developerName}</h2>
            <div className="prose prose-lg max-w-none">
              {formatAnalysis(aiAnalysis)}
            </div>
          </div>
        )}

        {developerData && (
          <div className="space-y-8">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {['overview', 'projects', 'testimonials', 'performance'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{developerData.name}</h2>
                        <p className="text-gray-600 mb-4">{developerData.description}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <StatCard title="Founded" value={developerData.foundedYear.toString()} />
                          <StatCard title="Headquarters" value={developerData.headquarters} />
                          <StatCard title="Total Projects" value={developerData.totalProjects.toString()} />
                          <StatCard title="Market Share" value={`${developerData.marketShare}%`} />
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Revenue</span>
                            <span className="font-medium">{formatCurrency(developerData.financialMetrics.revenue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Profit Margin</span>
                            <span className="font-medium">{developerData.financialMetrics.profitMargin}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Growth Rate</span>
                            <span className="font-medium">{developerData.financialMetrics.growthRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Market Cap</span>
                            <span className="font-medium">{formatCurrency(developerData.financialMetrics.marketCap)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {developerData.projects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}

                {activeTab === 'testimonials' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {developerData.testimonials.map((testimonial) => (
                      <div key={testimonial.id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{testimonial.author}</h4>
                            <p className="text-sm text-gray-600">{testimonial.role}</p>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-5 h-5 ${
                                  i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{testimonial.content}</p>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{testimonial.project}</span>
                          <span>{formatDate(testimonial.date)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'performance' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Sales Volume</span>
                            <span className="font-medium">{developerData.recentPerformance.salesVolume}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price Trend</span>
                            <span className={`font-medium ${
                              developerData.recentPerformance.priceTrend >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {developerData.recentPerformance.priceTrend >= 0 ? '+' : ''}
                              {developerData.recentPerformance.priceTrend}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Customer Satisfaction</span>
                            <span className="font-medium">{developerData.recentPerformance.customerSatisfaction}/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery Timeline</span>
                            <span className="font-medium">{developerData.recentPerformance.deliveryTimeline}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Active Projects</span>
                            <span className="font-medium">{developerData.activeProjects}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Completed Projects</span>
                            <span className="font-medium">{developerData.completedProjects}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">On-Time Delivery</span>
                            <span className="font-medium">{developerData.recentPerformance.deliveryTimeline}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
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